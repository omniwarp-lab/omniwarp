use crate::system::System;

#[tauri::command]
pub fn lock_screen(window: tauri::WebviewWindow) -> Result<(), String> {
    let _ = window.hide();
    System::lock()
}

#[tauri::command]
pub fn sleep_system(window: tauri::WebviewWindow) -> Result<(), String> {
    let _ = window.hide();
    System::sleep()
}
