use crate::apps::{AppInfo, Apps};
use std::path::Path;
use windows::core::HSTRING;
use windows::Win32::Foundation::HWND;
use windows::Win32::UI::Shell::ShellExecuteW;
use windows::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;

impl Apps {
    pub fn open_in_explorer(&self, id: &str) {
        if let Some(app) = self.get(id) {
            if app.can_open_in_explorer {
                open_target_in_explorer(app);
            }
        }
    }
}

fn open_target_in_explorer(app: &AppInfo) {
    let path = Path::new(&app.target_path);
    let select_arg = if path.exists() {
        format!("/select,\"{}\"", app.target_path)
    } else if let Some(parent) = path.parent().filter(|p| p.exists()) {
        format!("\"{}\"", parent.display())
    } else {
        return;
    };

    unsafe {
        let _ = ShellExecuteW(
            Some(HWND::default()),
            &HSTRING::from("open"),
            &HSTRING::from("explorer.exe"),
            &HSTRING::from(select_arg),
            &HSTRING::from(""),
            SW_SHOWNORMAL,
        );
    }
}
