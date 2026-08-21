use crate::tray::Tray;
use crate::AppState;
use std::collections::HashMap;
use tauri::AppHandle;

#[tauri::command]
pub fn update_tray_menu(
    app: AppHandle,
    state: tauri::State<AppState>,
    labels: HashMap<String, String>,
) -> Result<(), String> {
    let menu = Tray::build_menu(&app, &labels).map_err(|e| e.to_string())?;

    let tray_guard = state.tray.lock();
    if let Some(tray) = tray_guard.as_ref() {
        tray.set_menu(Some(menu)).map_err(|e| e.to_string())?;
    }

    Ok(())
}
