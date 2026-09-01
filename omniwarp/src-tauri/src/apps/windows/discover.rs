use crate::apps::windows::packages::package_roots;
use crate::apps::{AppInfo, AppKind, Apps};
use std::collections::HashMap;
use windows::core::{Interface, Result, PWSTR};
use windows::Win32::Foundation::PROPERTYKEY;
use windows::Win32::Storage::EnhancedStorage::{PKEY_Link_Arguments, PKEY_Link_TargetParsingPath};
use windows::Win32::System::Com::{
    CoInitializeEx, CoTaskMemFree, CoUninitialize, COINIT_APARTMENTTHREADED,
};
use windows::Win32::UI::Shell::{
    BHID_EnumItems, FOLDERID_AppsFolder, IEnumShellItems, IShellItem, IShellItem2,
    SHGetKnownFolderItem, KNOWN_FOLDER_FLAG, SIGDN_DESKTOPABSOLUTEPARSING, SIGDN_NORMALDISPLAY,
};

struct ComGuard(bool);
impl ComGuard {
    fn new() -> Self {
        let hr = unsafe { CoInitializeEx(None, COINIT_APARTMENTTHREADED) };
        Self(hr.is_ok())
    }
}
impl Drop for ComGuard {
    fn drop(&mut self) {
        if self.0 {
            unsafe { CoUninitialize() };
        }
    }
}

const BATCH_SIZE: usize = 32;

struct OwnedPwstr(PWSTR);
impl OwnedPwstr {
    fn into_string(self) -> String {
        unsafe { self.0.to_string().unwrap_or_default() }
    }
}
impl Drop for OwnedPwstr {
    fn drop(&mut self) {
        unsafe { CoTaskMemFree(Some(self.0 .0 as _)) };
    }
}

impl Apps {
    pub fn discover() -> Result<Self> {
        let _com = ComGuard::new();
        let apps_folder: IShellItem =
            unsafe { SHGetKnownFolderItem(&FOLDERID_AppsFolder, KNOWN_FOLDER_FLAG(0), None)? };
        let enum_items: IEnumShellItems =
            unsafe { apps_folder.BindToHandler(None, &BHID_EnumItems)? };
        let mut apps = Vec::with_capacity(256);
        let mut buf: [Option<IShellItem>; BATCH_SIZE] = std::array::from_fn(|_| None);

        loop {
            let mut fetched = 0u32;
            if unsafe { enum_items.Next(&mut buf, Some(&mut fetched)) }.is_err() {
                break;
            }
            if fetched == 0 {
                break;
            }

            for slot in buf.iter_mut().take(fetched as usize) {
                let Some(item) = slot.take() else { continue };
                if let Some(app) = build_app(&item) {
                    apps.push(app);
                }
            }
        }

        Ok(Self {
            apps,
            index: HashMap::new(),
        })
    }
}

fn build_app(item: &IShellItem) -> Option<AppInfo> {
    let id_p = unsafe { OwnedPwstr(item.GetDisplayName(SIGDN_DESKTOPABSOLUTEPARSING).ok()?) };
    let name_p = unsafe { OwnedPwstr(item.GetDisplayName(SIGDN_NORMALDISPLAY).ok()?) };

    let item2: Option<IShellItem2> = item.cast().ok();
    let id = id_p.into_string();
    let target_path = item_string(item2.as_ref(), &PKEY_Link_TargetParsingPath)
        .or_else(|| resolve_uwp_target_path(&id))
        .unwrap_or_default();
    let args = item_string(item2.as_ref(), &PKEY_Link_Arguments).unwrap_or_default();

    Some(AppInfo {
        name: name_p.into_string(),
        id,
        target_path,
        args,
        icon_path: None,
        kind: AppKind::App,
        pids: Vec::new(),
    })
}

fn item_string(item2: Option<&IShellItem2>, key: &PROPERTYKEY) -> Option<String> {
    let i2 = item2?;
    unsafe { i2.GetString(key) }
        .ok()
        .map(|p| OwnedPwstr(p).into_string())
}

fn resolve_uwp_target_path(aumid: &str) -> Option<String> {
    let (family, app_id) = aumid.split_once('!')?;
    let root = package_roots().get(family)?;
    let manifest = std::fs::read_to_string(root.join("AppxManifest.xml")).ok()?;
    let exe = manifest_executable(&manifest, app_id)?;
    Some(root.join(exe).to_string_lossy().into_owned())
}

fn manifest_executable(manifest: &str, app_id: &str) -> Option<String> {
    let doc = roxmltree::Document::parse(manifest).ok()?;
    doc.descendants()
        .find(|n| n.tag_name().name() == "Application" && n.attribute("Id") == Some(app_id))?
        .attribute("Executable")
        .map(str::to_string)
}
