use crate::apps::windows::window::window_matches_pids;
use crate::apps::{AppError, AppResult, Apps};
use std::collections::HashSet;
use windows::core::BOOL;
use windows::Win32::Foundation::{CloseHandle, GetLastError, HWND, LPARAM, WPARAM};
use windows::Win32::System::Threading::{OpenProcess, TerminateProcess, PROCESS_TERMINATE};
use windows::Win32::UI::WindowsAndMessaging::{
    EnumWindows, IsWindowVisible, PostMessageW, WM_CLOSE,
};

struct CloseContext<'a> {
    pids: &'a HashSet<u32>,
    closed: usize,
}

impl Apps {
    pub fn close(&self, id: &str) -> AppResult<()> {
        let app = self.get(id);
        if app.pids.is_empty() {
            return Err(AppError::Close {
                app: app.name.clone(),
                code: None,
            });
        }

        // Try graceful window close first
        if close_windows_for_pids(&app.pids) {
            return Ok(());
        }

        // Fallback: If no visible window exists (e.g. background/tray apps), terminate process directly
        match terminate_pids(&app.pids) {
            Ok(()) => Ok(()),
            Err(code) => Err(AppError::Close {
                app: app.name.clone(),
                code,
            }),
        }
    }
}

pub fn close_windows_for_pids(target_pids: &[u32]) -> bool {
    let pid_set: HashSet<u32> = target_pids.iter().copied().collect();
    let mut ctx = CloseContext {
        pids: &pid_set,
        closed: 0,
    };

    unsafe {
        let _ = EnumWindows(
            Some(enum_close_proc),
            LPARAM(&mut ctx as *mut CloseContext as isize),
        );
    }

    ctx.closed > 0
}

unsafe extern "system" fn enum_close_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
    let ctx = &mut *(lparam.0 as *mut CloseContext);

    if !IsWindowVisible(hwnd).as_bool() {
        return BOOL(1);
    }

    if window_matches_pids(hwnd, ctx.pids) {
        let res = PostMessageW(Some(hwnd), WM_CLOSE, WPARAM(0), LPARAM(0));
        if res.is_ok() {
            ctx.closed += 1;
        }
    }

    BOOL(1)
}

pub fn terminate_pids(target_pids: &[u32]) -> Result<(), Option<u32>> {
    let mut terminated = 0;
    let mut last_error = None;

    for &pid in target_pids {
        match unsafe { terminate_pid(pid) } {
            Ok(()) => terminated += 1,
            Err(code) => last_error = Some(code),
        }
    }

    if terminated > 0 {
        Ok(())
    } else {
        Err(last_error)
    }
}

unsafe fn terminate_pid(pid: u32) -> Result<(), u32> {
    let handle = match OpenProcess(PROCESS_TERMINATE, false, pid) {
        Ok(h) => h,
        Err(_) => return Err(GetLastError().0),
    };
    let success = TerminateProcess(handle, 1).is_ok();
    let err = if !success {
        Some(GetLastError().0)
    } else {
        None
    };
    let _ = CloseHandle(handle);
    match err {
        Some(code) => Err(code),
        None => Ok(()),
    }
}
