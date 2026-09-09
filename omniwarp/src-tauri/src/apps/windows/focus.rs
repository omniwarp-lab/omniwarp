use crate::apps::{AppError, AppResult, Apps};
use std::collections::HashSet;
use windows::core::BOOL;
use windows::Win32::Foundation::{HWND, LPARAM};
use windows::Win32::System::Threading::{AttachThreadInput, GetCurrentThreadId};
use windows::Win32::UI::WindowsAndMessaging::{
    BringWindowToTop, EnumWindows, GetForegroundWindow, GetWindow, GetWindowThreadProcessId,
    IsIconic, IsWindowVisible, SetForegroundWindow, SetWindowPos, ShowWindow, SwitchToThisWindow,
    GW_OWNER, HWND_TOP, SET_WINDOW_POS_FLAGS, SWP_NOMOVE, SWP_NOSIZE, SWP_SHOWWINDOW, SW_RESTORE,
    SW_SHOW,
};

struct SearchContext<'a> {
    pids: &'a HashSet<u32>,
    found: Option<HWND>,
}

impl Apps {
    pub fn focus(&self, id: &str) -> AppResult<()> {
        let app = self
            .get(id)
            .expect("App ID must exist in discovered apps index");
        #[cfg(target_os = "windows")]
        if !app.pids.is_empty() && activate_window_for_pids(&app.pids) {
            return Ok(());
        }

        Err(AppError::Focus {
            app: app.name.clone(),
        })
    }
}

pub fn activate_window_for_pids(target_pids: &[u32]) -> bool {
    let pid_set: HashSet<u32> = target_pids.iter().copied().collect();
    let mut ctx = SearchContext {
        pids: &pid_set,
        found: None,
    };

    unsafe {
        let _ = EnumWindows(
            Some(enum_windows_proc),
            LPARAM(&mut ctx as *mut SearchContext as isize),
        );
    }

    let Some(hwnd) = ctx.found else {
        return false;
    };

    activate_window(hwnd);
    true
}

unsafe extern "system" fn enum_windows_proc(hwnd: HWND, lparam: LPARAM) -> BOOL {
    let ctx = &mut *(lparam.0 as *mut SearchContext);

    if !IsWindowVisible(hwnd).as_bool() {
        return BOOL(1);
    }

    if let Ok(owner) = GetWindow(hwnd, GW_OWNER) {
        if !owner.is_invalid() {
            return BOOL(1);
        }
    }

    let mut process_id = 0u32;
    GetWindowThreadProcessId(hwnd, Some(&mut process_id));

    if ctx.pids.contains(&process_id) {
        ctx.found = Some(hwnd);
        return BOOL(0);
    }

    BOOL(1)
}

fn activate_window(hwnd: HWND) {
    unsafe {
        if IsIconic(hwnd).as_bool() {
            let _ = ShowWindow(hwnd, SW_RESTORE);
        } else {
            let _ = ShowWindow(hwnd, SW_SHOW);
        }

        let fg_hwnd = GetForegroundWindow();
        let fg_thread = GetWindowThreadProcessId(fg_hwnd, None);
        let cur_thread = GetCurrentThreadId();

        let attached = if fg_thread != 0 && fg_thread != cur_thread {
            AttachThreadInput(cur_thread, fg_thread, true).as_bool()
        } else {
            false
        };

        let _ = BringWindowToTop(hwnd);
        let _ = SetForegroundWindow(hwnd);
        let flags: SET_WINDOW_POS_FLAGS = SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW;
        let _ = SetWindowPos(hwnd, Some(HWND_TOP), 0, 0, 0, 0, flags);
        SwitchToThisWindow(hwnd, true);

        if attached {
            let _ = AttachThreadInput(cur_thread, fg_thread, false);
        }
    }
}
