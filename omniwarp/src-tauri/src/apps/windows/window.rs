use std::collections::HashSet;
use windows::core::w;
use windows::Win32::Foundation::HWND;
use windows::Win32::UI::WindowsAndMessaging::{FindWindowExW, GetWindowThreadProcessId};

pub fn window_matches_pids(hwnd: HWND, pids: &HashSet<u32>) -> bool {
    let mut process_id = 0u32;
    unsafe { GetWindowThreadProcessId(hwnd, Some(&mut process_id)) };
    if pids.contains(&process_id) {
        return true;
    }

    // UWP apps hosted inside ApplicationFrameHost
    let child = unsafe { FindWindowExW(Some(hwnd), None, w!("Windows.UI.Core.CoreWindow"), None) };
    if let Ok(child_hwnd) = child {
        if !child_hwnd.is_invalid() {
            let mut child_pid = 0u32;
            unsafe { GetWindowThreadProcessId(child_hwnd, Some(&mut child_pid)) };
            if pids.contains(&child_pid) {
                return true;
            }
        }
    }

    false
}
