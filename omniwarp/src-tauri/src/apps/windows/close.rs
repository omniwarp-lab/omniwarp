use crate::apps::Apps;
use std::collections::HashSet;
use windows::core::BOOL;
use windows::Win32::Foundation::{HWND, LPARAM, WPARAM};
use windows::Win32::UI::WindowsAndMessaging::{
    EnumWindows, GetWindowThreadProcessId, IsWindowVisible, PostMessageW, WM_CLOSE,
};

struct CloseContext<'a> {
    pids: &'a HashSet<u32>,
}

impl Apps {
    pub fn close(&self, id: &str) {
        if let Some(app) = self.get(id) {
            if !app.pids.is_empty() {
                close_windows_for_pids(&app.pids);
            }
        }
    }
}

pub fn close_windows_for_pids(target_pids: &[u32]) {
    let pid_set: HashSet<u32> = target_pids.iter().copied().collect();
    let mut ctx = CloseContext { pids: &pid_set };

    unsafe {
        let _ = EnumWindows(
            Some(enum_close_proc),
            LPARAM(&mut ctx as *mut CloseContext as isize),
        );
    }
}

unsafe extern "system" fn enum_close_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
    let ctx = &mut *(lparam.0 as *mut CloseContext);

    if !IsWindowVisible(hwnd).as_bool() {
        return BOOL(1);
    }

    let mut process_id = 0u32;
    GetWindowThreadProcessId(hwnd, Some(&mut process_id));

    if ctx.pids.contains(&process_id) {
        let _ = PostMessageW(Some(hwnd), WM_CLOSE, WPARAM(0), LPARAM(0));
    }

    BOOL(1)
}
