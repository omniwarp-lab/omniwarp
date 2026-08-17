use crate::apps::{AppInfo, Apps};
use std::cell::RefCell;
use windows::core::HSTRING;
use windows::Win32::Foundation::HWND;
use windows::Win32::System::Com::{
    CoCreateInstance, CoInitializeEx, CLSCTX_ALL, COINIT_APARTMENTTHREADED,
};
use windows::Win32::UI::Shell::{
    ApplicationActivationManager, IApplicationActivationManager, ShellExecuteW,
};
use windows::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;

impl Apps {
    pub fn launch(&self, id: &str) {
        if let Some(app) = self.get(id) {
            if app.target_path.is_none() && app.id.contains('!') {
                launch_uwp(&app.id).unwrap();
                return;
            }
            launch_via_shell(app);
        }
    }
}

thread_local! {
    static ACTIVATION_MANAGER: RefCell<Option<IApplicationActivationManager>> =
        const { RefCell::new(None) };
}

fn launch_uwp(aumid: &str) -> windows::core::Result<u32> {
    ACTIVATION_MANAGER.with(|cell| {
        let mut slot = cell.borrow_mut();
        if slot.is_none() {
            unsafe {
                CoInitializeEx(None, COINIT_APARTMENTTHREADED).ok()?; // once per thread
                let mgr: IApplicationActivationManager =
                    CoCreateInstance(&ApplicationActivationManager, None, CLSCTX_ALL)?;
                *slot = Some(mgr);
            }
        }
        let mgr = slot.as_ref().unwrap();
        let aumid_h = HSTRING::from(aumid);
        unsafe { mgr.ActivateApplication(&aumid_h, &HSTRING::new(), Default::default()) }
    })
}

fn launch_via_shell(app: &AppInfo) {
    let target = app.target_path.as_deref().expect("no target_path");

    let args = match app.args.trim().is_empty() {
        true => "",
        false => app.args.as_str(),
    };

    let result = unsafe {
        ShellExecuteW(
            Some(HWND::default()),
            &HSTRING::from("open"),
            &HSTRING::from(target),
            &HSTRING::from(args),
            &HSTRING::from(""),
            SW_SHOWNORMAL,
        )
    };

    let code = result.0 as isize;
    if code <= 32 {
        eprintln!("ShellExecuteW failed: {code}");
    } else {
        eprintln!("spawned ok");
    }
}
