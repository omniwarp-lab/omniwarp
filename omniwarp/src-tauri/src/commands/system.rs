use crate::system::{System, SystemResult};

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn lock_screen(window: tauri::WebviewWindow) -> SystemResult<()> {
    let _ = window.hide();
    System::lock()
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn sleep_system(window: tauri::WebviewWindow) -> SystemResult<()> {
    let _ = window.hide();
    System::sleep()
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn restart_system(window: tauri::WebviewWindow) -> SystemResult<()> {
    let _ = window.hide();
    System::restart()
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn shutdown_system(window: tauri::WebviewWindow) -> SystemResult<()> {
    let _ = window.hide();
    System::shutdown()
}

#[tauri::command]
pub fn next_track(window: tauri::WebviewWindow) {
    let _ = window.hide();
    System::next_track();
}

#[tauri::command]
pub fn previous_track(window: tauri::WebviewWindow) {
    let _ = window.hide();
    System::previous_track();
}

#[tauri::command]
pub fn play_pause(window: tauri::WebviewWindow) {
    let _ = window.hide();
    System::play_pause();
}
