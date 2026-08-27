use crate::apps::Apps;
use std::collections::HashSet;
use std::path::Path;
use windows::core::PCWSTR;
use windows::Win32::Foundation::ERROR_SUCCESS;
use windows::Win32::System::Registry::{
    RegCloseKey, RegEnumKeyW, RegOpenKeyExW, RegQueryValueExW, HKEY, HKEY_CURRENT_USER,
    HKEY_LOCAL_MACHINE, KEY_READ, REG_EXPAND_SZ, REG_SZ, REG_VALUE_TYPE,
};

impl Apps {
    pub fn filter(&mut self) {
        let uninstall_keys = collect_uninstall_targets();

        self.apps.retain(|app| {
            is_launchable(&app.target_path)
                && !is_uninstaller(&app.target_path, &app.args, &uninstall_keys)
        });
    }
}

fn is_launchable(target: &str) -> bool {
    (!is_web_url(target) && is_executable(target)) || is_game(target) || is_clsid(target)
}

fn is_web_url(target: &str) -> bool {
    target.starts_with("http://") || target.starts_with("https://")
}

fn is_executable(target: &str) -> bool {
    const EXECUTABLE_EXTS: &[&str] = &["exe", "com", "bat", "cmd", "msc", "scr"];
    Path::new(target)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| {
            EXECUTABLE_EXTS
                .iter()
                .any(|ext| e.eq_ignore_ascii_case(ext))
        })
        .unwrap_or(false)
}

fn is_clsid(target: &str) -> bool {
    target.starts_with("::{")
}

pub fn is_game(target: &str) -> bool {
    const GAME_PLATFORM_SCHEMES: &[&str] = &[
        "steam",
        "com.epicgames.launcher",
        "googleplaygames",
        "uplay",
        "battlenet",
    ];

    target
        .split_once("://")
        .map(|(scheme, _)| GAME_PLATFORM_SCHEMES.contains(&scheme.to_ascii_lowercase().as_str()))
        .unwrap_or(false)
}

fn is_uninstaller(target: &str, args: &str, uninstall_keys: &HashSet<String>) -> bool {
    uninstall_keys.contains(&key(target, args)) || is_msi_uninstall(Path::new(target), args)
}

fn key(exe: &str, args: &str) -> String {
    format!(
        "{}|{}",
        exe.trim().to_lowercase(),
        args.trim().to_lowercase()
    )
}

fn is_msi_uninstall(target: &Path, args: &str) -> bool {
    target
        .file_name()
        .and_then(|f| f.to_str())
        .map(|f| f.eq_ignore_ascii_case("msiexec.exe"))
        .unwrap_or(false)
        && (args.contains("/x")
            || args.contains("/X")
            || args.to_lowercase().contains("/uninstall"))
}

struct OwnedHKey(HKEY);
impl OwnedHKey {
    fn open(root: HKEY, path: &str) -> Option<Self> {
        let wpath = to_wide(path);
        let mut hkey = HKEY(std::ptr::null_mut());
        let result =
            unsafe { RegOpenKeyExW(root, PCWSTR(wpath.as_ptr()), Some(0), KEY_READ, &mut hkey) };
        (result == ERROR_SUCCESS).then_some(Self(hkey))
    }
}
impl std::ops::Deref for OwnedHKey {
    type Target = HKEY;
    fn deref(&self) -> &HKEY {
        &self.0
    }
}
impl Drop for OwnedHKey {
    fn drop(&mut self) {
        unsafe {
            let _ = RegCloseKey(self.0);
        }
    }
}

pub fn collect_uninstall_targets() -> HashSet<String> {
    let mut set = HashSet::new();
    let roots: [(HKEY, &str); 3] = [
        (
            HKEY_LOCAL_MACHINE,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
        ),
        (
            HKEY_LOCAL_MACHINE,
            r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall",
        ),
        (
            HKEY_CURRENT_USER,
            r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
        ),
    ];

    unsafe {
        for (root, path) in roots {
            let Some(uninstall_key) = OwnedHKey::open(root, path) else {
                continue;
            };

            for sub_name in unsafe { enum_subkeys(*uninstall_key) } {
                let Some(sub_key) = OwnedHKey::open(*uninstall_key, &sub_name) else {
                    continue;
                };

                if let Some(raw) = unsafe { get_string_value(*sub_key, "UninstallString") } {
                    let (exe, args) = split_cmdline(&raw);
                    set.insert(key(&exe, &args));
                }
            }
        }
    }

    set
}

unsafe fn open_key(root: HKEY, path: &str) -> Option<HKEY> {
    let wpath = to_wide(path);
    let mut hkey = HKEY(std::ptr::null_mut());
    let result = RegOpenKeyExW(root, PCWSTR(wpath.as_ptr()), Some(0), KEY_READ, &mut hkey);
    if result == ERROR_SUCCESS {
        Some(hkey)
    } else {
        None
    }
}

fn to_wide(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}

fn from_wide(buf: &[u16]) -> String {
    let len = buf.iter().position(|&c| c == 0).unwrap_or(buf.len());
    String::from_utf16_lossy(&buf[..len])
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

unsafe fn get_string_value(hkey: HKEY, name: &str) -> Option<String> {
    let wname = to_wide(name);
    let mut value_type = REG_VALUE_TYPE(0);
    let mut buf_len: u32 = 0;

    // first pass: ask for required buffer size
    let result = RegQueryValueExW(
        hkey,
        PCWSTR(wname.as_ptr()),
        None,
        Some(&mut value_type),
        None,
        Some(&mut buf_len),
    );
    if result != ERROR_SUCCESS || buf_len == 0 {
        return None;
    }
    if value_type != REG_SZ && value_type != REG_EXPAND_SZ {
        return None;
    }

    let mut buf: Vec<u8> = vec![0; buf_len as usize];
    let result = RegQueryValueExW(
        hkey,
        PCWSTR(wname.as_ptr()),
        None,
        None,
        Some(buf.as_mut_ptr()),
        Some(&mut buf_len),
    );
    if result != ERROR_SUCCESS {
        return None;
    }

    let (_, u16_buf, _) = buf.align_to::<u16>();
    Some(from_wide(u16_buf))
}

fn split_cmdline(raw: &str) -> (String, String) {
    let raw = raw.trim();
    if let Some(rest) = raw.strip_prefix('"') {
        if let Some(end) = rest.find('"') {
            return (rest[..end].to_string(), rest[end + 1..].trim().to_string());
        }
    }
    match raw.split_once(' ') {
        Some((exe, args)) => (exe.to_string(), args.trim().to_string()),
        None => (raw.to_string(), String::new()),
    }
}
