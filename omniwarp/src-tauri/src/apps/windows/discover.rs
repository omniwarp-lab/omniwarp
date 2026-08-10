use crate::apps::{AppInfo, Apps};
use windows::core::{Result, PWSTR};
use windows::Win32::System::Com::{
    CoInitializeEx, CoTaskMemFree, CoUninitialize, COINIT_APARTMENTTHREADED,
};
use windows::Win32::UI::Shell::{
    BHID_EnumItems, FOLDERID_AppsFolder, IEnumShellItems, IShellItem, SHGetKnownFolderItem,
    KNOWN_FOLDER_FLAG, SIGDN_DESKTOPABSOLUTEPARSING, SIGDN_NORMALDISPLAY,
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

        Ok(Self { apps })
    }
}

fn build_app(item: &IShellItem) -> Option<AppInfo> {
    let id_p = unsafe { OwnedPwstr(item.GetDisplayName(SIGDN_DESKTOPABSOLUTEPARSING).ok()?) };
    let name_p = unsafe { OwnedPwstr(item.GetDisplayName(SIGDN_NORMALDISPLAY).ok()?) };

    Some(AppInfo {
        name: name_p.into_string(),
        id: id_p.into_string(),
        icon_path: None,
    })
}
