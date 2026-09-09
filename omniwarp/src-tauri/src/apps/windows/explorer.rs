use crate::apps::{AppError, AppInfo, AppResult, Apps};
use std::path::Path;
use windows::core::HSTRING;
use windows::Win32::Foundation::HWND;
use windows::Win32::UI::Shell::ShellExecuteW;
use windows::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;

impl Apps {
    pub fn open_in_explorer(&self, id: &str) -> AppResult<()> {
        open_target_in_explorer(self.get(id))
    }
}

fn open_target_in_explorer(app: &AppInfo) -> AppResult<()> {
    if !app.can_open_in_explorer {
        return Err(AppError::OpenInExplorer {
            app: app.name.clone(),
            code: 2,
        });
    }

    let path = Path::new(&app.target_path);
    let select_arg = if path.exists() {
        format!("/select,\"{}\"", app.target_path)
    } else if let Some(parent) = path.parent().filter(|p| p.exists()) {
        format!("\"{}\"", parent.display())
    } else {
        return Err(AppError::OpenInExplorer {
            app: app.name.clone(),
            code: 2,
        });
    };

    let result = unsafe {
        ShellExecuteW(
            Some(HWND::default()),
            &HSTRING::from("open"),
            &HSTRING::from("explorer.exe"),
            &HSTRING::from(select_arg),
            &HSTRING::from(""),
            SW_SHOWNORMAL,
        )
    };

    let code = result.0 as isize;
    if code <= 32 {
        Err(AppError::OpenInExplorer {
            app: app.name.clone(),
            code,
        })
    } else {
        Ok(())
    }
}
