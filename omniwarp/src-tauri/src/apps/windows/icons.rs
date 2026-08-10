use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::sync::OnceLock;
use windows::core::{Interface, HSTRING, PCWSTR};
use windows::Win32::Foundation::{ERROR_SUCCESS, SIZE};
use windows::Win32::Graphics::Gdi::{
    CreateCompatibleDC, DeleteDC, DeleteObject, GetDIBits, GetObjectW, SelectObject, BITMAP,
    BITMAPINFO, BITMAPINFOHEADER, BI_RGB, DIB_RGB_COLORS, HBITMAP, HDC, HGDIOBJ,
};
use windows::Win32::System::Environment::ExpandEnvironmentStringsW;
use windows::Win32::System::Registry::{
    RegCloseKey, RegEnumKeyW, RegOpenKeyExW, RegQueryValueExW, HKEY, HKEY_CURRENT_USER, KEY_READ,
    REG_EXPAND_SZ, REG_SZ,
};
use windows::Win32::UI::Shell::{
    IShellItem, IShellItemImageFactory, SHCreateItemFromParsingName, SIIGBF_ICONONLY,
    SIIGBF_RESIZETOFIT,
};

const SIZE: u32 = 48;

fn icon(id: &str) -> Option<Vec<u8>> {
    if let Some(bytes) = icon_from_package(id, SIZE) {
        return Some(bytes);
    }
    icon_from_shell(id, SIZE)
}

fn icon_from_package(id: &str, size: u32) -> Option<Vec<u8>> {
    let (family, app_id) = id.split_once('!')?;
    let root = package_roots().get(family)?.clone();
    let manifest = std::fs::read_to_string(root.join("AppxManifest.xml")).ok()?;
    let logo = manifest_logo(&manifest, app_id)?;

    let logo_path = root.join(logo.replace('/', "\\"));
    let is_pri = logo_path
        .extension()
        .and_then(|e| e.to_str())
        .is_some_and(|e| e.eq_ignore_ascii_case("pri"));
    if is_pri {
        return None;
    }

    let dir = logo_path.parent()?;
    let file = logo_path.file_name()?.to_string_lossy();
    let stem = base_stem(&file);

    let asset = resolve_logo_path(dir, stem, size)?;

    if is_exact_size_png(&asset, size) {
        return std::fs::read(&asset).ok();
    }

    let bytes = std::fs::read(&asset).ok()?;
    let img = image::load_from_memory(&bytes).ok()?;
    let resized = if img.width() == size && img.height() == size {
        img
    } else {
        img.resize(size, size, image::imageops::FilterType::Lanczos3)
    };

    let mut png_bytes = Vec::new();
    resized
        .write_to(
            &mut std::io::Cursor::new(&mut png_bytes),
            image::ImageFormat::Png,
        )
        .ok()?;
    Some(png_bytes)
}

fn package_roots() -> &'static HashMap<String, PathBuf> {
    static ROOTS: OnceLock<HashMap<String, PathBuf>> = OnceLock::new();
    ROOTS.get_or_init(build_package_roots)
}

const APP_MODEL_REPOSITORY: &str = r"Software\Classes\Local Settings\Software\Microsoft\Windows\CurrentVersion\AppModel\Repository\Packages";

struct RegKey(HKEY);
impl RegKey {
    fn open(parent: HKEY, subkey: &str) -> Option<Self> {
        let mut key = HKEY(std::ptr::null_mut());
        let result =
            unsafe { RegOpenKeyExW(parent, &HSTRING::from(subkey), None, KEY_READ, &mut key) };
        result.is_ok().then_some(Self(key))
    }
}
impl Drop for RegKey {
    fn drop(&mut self) {
        unsafe {
            let _ = RegCloseKey(self.0);
        }
    }
}

fn build_package_roots() -> HashMap<String, PathBuf> {
    let mut map = HashMap::new();

    let Some(repo_key) = RegKey::open(HKEY_CURRENT_USER, APP_MODEL_REPOSITORY) else {
        return map;
    };

    for full_name in enum_subkeys(repo_key.0) {
        let Some(family) = family_from_full_name(&full_name) else {
            continue;
        };
        let Some(subkey) = RegKey::open(repo_key.0, &full_name) else {
            continue;
        };
        let Some(root) = reg_read_string(subkey.0, "PackageRootFolder")
            .map(|s| PathBuf::from(expand_env_vars(&s)))
        else {
            continue;
        };
        if root.join("AppxManifest.xml").exists() {
            map.insert(family, root);
        }
    }

    map
}

fn enum_subkeys(hkey: HKEY) -> Vec<String> {
    let mut names = Vec::new();
    let mut buffer = [0u16; 256];
    let mut index = 0u32;

    loop {
        let result = unsafe { RegEnumKeyW(hkey, index, Some(&mut buffer)) };
        if result != ERROR_SUCCESS {
            break; // ERROR_NO_MORE_ITEMS in the normal case
        }
        let len = buffer.iter().position(|&c| c == 0).unwrap_or(buffer.len());
        names.push(String::from_utf16_lossy(&buffer[..len]));
        index += 1;
    }

    names
}

// Windows package full names look like `<Name>_<Version>_<Arch>__<PublisherId>`
fn family_from_full_name(full: &str) -> Option<String> {
    let parts: Vec<&str> = full.split('_').collect();
    let publisher = *parts.last()?;

    let version_index = parts.iter().position(|part| is_version_part(part))?;
    if version_index == 0 {
        return None;
    }

    let name = parts[..version_index].join("_");
    Some(format!("{name}_{publisher}"))
}

// Matches dotted numeric segments like "10.2109.8.0".
fn is_version_part(part: &str) -> bool {
    !part.is_empty()
        && part.starts_with(|c: char| c.is_ascii_digit())
        && part.contains('.')
        && part.chars().all(|c| c.is_ascii_digit() || c == '.')
}

fn reg_read_string(hkey: HKEY, value: &str) -> Option<String> {
    let name = HSTRING::from(value);
    let mut value_type = REG_SZ;
    let mut size = 0u32;

    let result = unsafe {
        RegQueryValueExW(
            hkey,
            &name,
            None,
            Some(&mut value_type),
            None,
            Some(&mut size),
        )
    };
    if result != ERROR_SUCCESS || size == 0 {
        return None;
    }
    if value_type != REG_SZ && value_type != REG_EXPAND_SZ {
        return None;
    }

    // size is a byte count; registry strings are UTF-16, so allocate u16s
    // directly instead of reading bytes and re-pairing them by hand.
    let mut buffer = vec![0u16; size.div_ceil(2) as usize];
    let result = unsafe {
        RegQueryValueExW(
            hkey,
            &name,
            None,
            Some(&mut value_type),
            Some(buffer.as_mut_ptr() as *mut u8),
            Some(&mut size),
        )
    };
    if result != ERROR_SUCCESS {
        return None;
    }

    let len = buffer.iter().position(|&c| c == 0).unwrap_or(buffer.len());
    Some(String::from_utf16_lossy(&buffer[..len]))
}

fn expand_env_vars(input: &str) -> String {
    let wide: Vec<u16> = input.encode_utf16().chain(std::iter::once(0)).collect();
    let src = PCWSTR(wide.as_ptr());

    let needed = unsafe { ExpandEnvironmentStringsW(src, None) };
    if needed == 0 {
        return input.to_string();
    }

    let mut buffer = vec![0u16; needed as usize];
    let written = unsafe { ExpandEnvironmentStringsW(src, Some(&mut buffer)) };
    if written == 0 {
        return input.to_string();
    }

    let len = buffer.iter().position(|&c| c == 0).unwrap_or(buffer.len());
    String::from_utf16_lossy(&buffer[..len])
}

fn manifest_logo(manifest: &str, app_id: &str) -> Option<String> {
    let doc = roxmltree::Document::parse(manifest).ok()?;

    let app = doc
        .descendants()
        .find(|n| n.tag_name().name() == "Application" && n.attribute("Id") == Some(app_id))?;

    let visuals = app
        .descendants()
        .find(|n| n.tag_name().name() == "VisualElements")?;

    [
        "Square44x44Logo",
        "Square71x71Logo",
        "Logo",
        "SmallLogo",
        "StoreLogo",
    ]
    .into_iter()
    .find_map(|attr| visuals.attribute(attr))
    .map(str::to_string)
}

fn base_stem(filename: &str) -> &str {
    let without_ext = filename
        .rsplit_once('.')
        .map(|(stem, _)| stem)
        .unwrap_or(filename);
    for marker in [".targetsize", ".scale"] {
        if let Some(index) = without_ext.find(marker) {
            return &without_ext[..index];
        }
    }
    without_ext
}

fn resolve_logo_path(dir: &Path, stem: &str, size: u32) -> Option<PathBuf> {
    let mut unplated = Vec::new();
    let mut candidates = HashSet::new();

    for entry in std::fs::read_dir(dir).ok()?.flatten() {
        let file_name = entry.file_name();
        let name = file_name.to_string_lossy();

        if !name.starts_with(stem) || !name.ends_with(".png") {
            continue;
        }

        let is_unplated = !name.contains("_contrast-")
            && !name.contains("_altform-lightunplated")
            && name.contains("_altform-unplated");

        if is_unplated {
            if let Some(n) = targetsize_from_name(&name) {
                unplated.push((n, dir.join(name.as_ref())));
            }
        }

        candidates.insert(name.into_owned());
    }

    if let Some(path) = choose_best_targetsize(unplated, size) {
        return Some(path);
    }

    let exact = format!("{stem}.targetsize-{size}.png");
    if candidates.contains(&exact) {
        return Some(dir.join(exact));
    }

    for scale in [400u32, 200, 150, 125, 100] {
        let candidate = format!("{stem}.scale-{scale}.png");
        if candidates.contains(&candidate) {
            return Some(dir.join(candidate));
        }
    }

    let base = format!("{stem}.png");
    candidates.contains(&base).then(|| dir.join(base))
}

fn targetsize_from_name(name: &str) -> Option<u32> {
    let start = name.find("targetsize-")? + "targetsize-".len();
    let digits: String = name[start..]
        .chars()
        .take_while(|c| c.is_ascii_digit())
        .collect();
    digits.parse().ok()
}

fn choose_best_targetsize(files: Vec<(u32, PathBuf)>, size: u32) -> Option<PathBuf> {
    if let Some((_, path)) = files.iter().find(|(n, _)| *n == size) {
        return Some(path.clone());
    }
    if let Some((_, path)) = files
        .iter()
        .filter(|(n, _)| *n > size)
        .min_by_key(|(n, _)| *n)
    {
        return Some(path.clone());
    }
    files
        .iter()
        .max_by_key(|(n, _)| *n)
        .map(|(_, path)| path.clone())
}

fn is_exact_size_png(path: &Path, size: u32) -> bool {
    let is_png = path
        .extension()
        .and_then(|e| e.to_str())
        .is_some_and(|e| e.eq_ignore_ascii_case("png"));

    is_png
        && image::ImageReader::open(path)
            .and_then(|r| r.with_guessed_format())
            .ok()
            .and_then(|r| r.into_dimensions().ok())
            .is_some_and(|(w, h)| w == size && h == size)
}

struct OwnedHBitmap(HBITMAP);
impl Drop for OwnedHBitmap {
    fn drop(&mut self) {
        unsafe {
            let _ = DeleteObject(self.0.into());
        }
    }
}

fn icon_from_shell(identifier: &str, size: u32) -> Option<Vec<u8>> {
    let parsing_path = format!("shell:AppsFolder\\{identifier}");

    let item: IShellItem =
        unsafe { SHCreateItemFromParsingName(&HSTRING::from(parsing_path.as_str()), None) }.ok()?;
    let factory: IShellItemImageFactory = item.cast().ok()?;

    let dimensions = SIZE {
        cx: size as i32,
        cy: size as i32,
    };
    let flags = SIIGBF_RESIZETOFIT | SIIGBF_ICONONLY;
    let hbitmap = unsafe { factory.GetImage(dimensions, flags) }.ok()?;
    let hbitmap = OwnedHBitmap(hbitmap);

    hbitmap_to_png(hbitmap.0)
}

struct MemoryDc(HDC);
impl MemoryDc {
    fn new() -> Option<Self> {
        // Passing None is equivalent to first GetDC(screen) then
        // CreateCompatibleDC(that) — no separate screen DC needed.
        let hdc = unsafe { CreateCompatibleDC(None) };
        (hdc != HDC::default()).then_some(Self(hdc))
    }
}
impl Drop for MemoryDc {
    fn drop(&mut self) {
        unsafe {
            let _ = DeleteDC(self.0);
        }
    }
}

struct SelectedBitmap<'a> {
    dc: &'a MemoryDc,
    previous: HGDIOBJ,
}
impl<'a> SelectedBitmap<'a> {
    fn new(dc: &'a MemoryDc, bitmap: HBITMAP) -> Self {
        let previous = unsafe { SelectObject(dc.0, bitmap.into()) };
        Self { dc, previous }
    }
}
impl Drop for SelectedBitmap<'_> {
    fn drop(&mut self) {
        // `_selected` and `mem_dc` are separate LOCAL VARIABLES in
        // hbitmap_to_png, so they drop in reverse declaration order —
        // `_selected` first, restoring the DC's previous bitmap before
        // `mem_dc`'s DeleteDC runs. (Struct fields would drop forward,
        // the opposite rule — this guarantee comes from the caller's
        // local-variable order, not from this struct's own fields.)
        unsafe {
            let _ = SelectObject(self.dc.0, self.previous);
        }
    }
}

fn hbitmap_to_png(hbitmap: HBITMAP) -> Option<Vec<u8>> {
    let mut bitmap = BITMAP::default();
    let written = unsafe {
        GetObjectW(
            hbitmap.into(),
            size_of::<BITMAP>() as i32,
            Some(&mut bitmap as *mut _ as *mut _),
        )
    };
    if written == 0 || bitmap.bmWidth <= 0 || bitmap.bmHeight <= 0 {
        return None;
    }
    let width = bitmap.bmWidth as u32;
    let height = bitmap.bmHeight as u32;

    let mem_dc = MemoryDc::new()?;
    let _selected = SelectedBitmap::new(&mem_dc, hbitmap);

    let mut bmi = BITMAPINFO {
        bmiHeader: BITMAPINFOHEADER {
            biSize: size_of::<BITMAPINFOHEADER>() as u32,
            biWidth: width as i32,
            biHeight: -(height as i32), // negative = top-down, avoids a manual row flip
            biPlanes: 1,
            biBitCount: 32,
            biCompression: BI_RGB.0,
            ..Default::default()
        },
        ..Default::default()
    };

    let mut buffer = vec![0u8; (width * height * 4) as usize];
    let rows_copied = unsafe {
        GetDIBits(
            mem_dc.0,
            hbitmap,
            0,
            height,
            Some(buffer.as_mut_ptr() as *mut _),
            &mut bmi,
            DIB_RGB_COLORS,
        )
    };
    if rows_copied == 0 {
        return None; // failed — don't encode whatever's left in `buffer`
    }

    for pixel in buffer.chunks_exact_mut(4) {
        pixel.swap(0, 2); // BGRA -> RGBA
    }

    let image = image::RgbaImage::from_raw(width, height, buffer)?;
    let mut png_bytes = Vec::new();
    image::DynamicImage::ImageRgba8(image)
        .write_to(
            &mut std::io::Cursor::new(&mut png_bytes),
            image::ImageFormat::Png,
        )
        .ok()?;

    Some(png_bytes)
}
