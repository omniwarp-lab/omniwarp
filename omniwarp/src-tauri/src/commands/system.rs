use crate::system::{System, SystemResult};

#[tauri::command]
pub fn lock_screen(window: tauri::WebviewWindow) -> SystemResult<()> {
    let _ = window.hide();
    let result = System::lock();
    if let Err(ref err) = result {
        tracing::error!(error = %err);
    }
    result
}

#[tauri::command]
pub fn sleep_system(window: tauri::WebviewWindow) -> SystemResult<()> {
    let _ = window.hide();
    let result = System::sleep();
    if let Err(ref err) = result {
        tracing::error!(error = %err);
    }
    result
}

#[tauri::command]
pub fn restart_system(window: tauri::WebviewWindow) -> SystemResult<()> {
    let _ = window.hide();
    let result = System::restart();
    if let Err(ref err) = result {
        tracing::error!(error = %err);
    }
    result
}

#[tauri::command]
pub fn shutdown_system(window: tauri::WebviewWindow) -> SystemResult<()> {
    let _ = window.hide();
    let result = System::shutdown();
    if let Err(ref err) = result {
        tracing::error!(error = %err);
    }
    result
}
