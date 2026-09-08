use crate::tray::{Tray, TrayResult};
use crate::AppState;
use std::collections::HashMap;
use tauri::AppHandle;

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn update_tray_menu(
    app: AppHandle,
    state: tauri::State<AppState>,
    labels: HashMap<String, String>,
) -> TrayResult<()> {
    let menu = Tray::build_menu(&app, &labels)?;

    let tray_guard = state.tray.lock();
    if let Some(tray) = tray_guard.as_ref() {
        tray.set_menu(Some(menu))?;
    }

    Ok(())
}
