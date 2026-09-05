use crate::apps::{AppInfo, Apps};
use std::borrow::Cow;
use windows::core::HSTRING;
use windows::Win32::Foundation::HWND;
use windows::Win32::UI::Shell::ShellExecuteW;
use windows::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;

impl Apps {
    pub fn launch(&self, id: &str, as_admin: bool) {
        if let Some(app) = self.get(id) {
            launch_via_shell(app, as_admin);
        }
    }
}

fn launch_via_shell(app: &AppInfo, as_admin: bool) {
    let target = ensure_shell_uri_for_clsid(&app.target_path);

    let args = match app.args.trim().is_empty() {
        true => "",
        false => app.args.as_str(),
    };

    let verb = if as_admin { "runas" } else { "open" };

    let result = unsafe {
        ShellExecuteW(
            Some(HWND::default()),
            &HSTRING::from(verb),
            &HSTRING::from(target.as_ref()),
            &HSTRING::from(args),
            &HSTRING::from(""),
            SW_SHOWNORMAL,
        )
    };

    let code = result.0 as isize;
    if code <= 32 {
        eprintln!("ShellExecuteW ({verb}) failed: {code}");
    } else {
        eprintln!("spawned ok");
    }
}

fn ensure_shell_uri_for_clsid(target: &str) -> Cow<'_, str> {
    if target.starts_with("::{") {
        Cow::Owned(format!("shell:{target}"))
    } else {
        Cow::Borrowed(target)
    }
}
