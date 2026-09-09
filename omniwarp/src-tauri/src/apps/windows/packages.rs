use crate::apps::windows::env::expand_env_vars;
use crate::apps::windows::registry::enum_subkeys;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::OnceLock;
use windows::core::HSTRING;
use windows::Win32::Foundation::ERROR_SUCCESS;
use windows::Win32::System::Registry::{
    RegCloseKey, RegOpenKeyExW, RegQueryValueExW, HKEY, HKEY_CURRENT_USER, KEY_READ, REG_EXPAND_SZ,
    REG_SZ,
};

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

const APP_MODEL_REPOSITORY: &str = r"Software\Classes\Local Settings\Software\Microsoft\Windows\CurrentVersion\AppModel\Repository\Packages";
pub fn package_roots() -> &'static HashMap<String, PathBuf> {
    static ROOTS: OnceLock<HashMap<String, PathBuf>> = OnceLock::new();
    ROOTS.get_or_init(build_package_roots)
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
