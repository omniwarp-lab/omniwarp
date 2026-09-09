use crate::apps::windows::window::window_matches_pids;
use crate::apps::{AppError, AppResult, Apps};
use std::collections::HashSet;
use windows::core::BOOL;
use windows::Win32::Foundation::{HWND, LPARAM, WPARAM};
use windows::Win32::UI::WindowsAndMessaging::{EnumWindows, IsWindowVisible, PostMessageW, WM_CLOSE};

struct CloseContext<'a> {
    pids: &'a HashSet<u32>,
    closed: usize,
}

impl Apps {
    pub fn close(&self, id: &str) -> AppResult<()> {
        let app = self.get(id);
        if app.pids.is_empty() || !close_windows_for_pids(&app.pids) {
            return Err(AppError::Close {
                app: app.name.clone(),
            });
        }
        Ok(())
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
