use crate::apps::Apps;
use crate::AppState;
use tauri::Manager;

#[tauri::command]
pub fn discover_apps(
    app_handle: tauri::AppHandle,
    state: tauri::State<AppState>,
) -> Result<serde_json::Value, String> {
    let mut guard = state.apps.lock();
    if let Some(apps) = guard.as_ref() {
        return serde_json::to_value(apps).map_err(|e| e.to_string());
    }

    let mut apps = Apps::discover().map_err(|e| e.to_string())?;
    let cache_dir = app_handle
        .path()
        .app_cache_dir()
        .map_err(|e| e.to_string())?
        .join("app-icons");
    apps.filter();
    apps.classify();
    apps.cache_icons(&cache_dir);
    apps.build_index();
    apps.snapshot_running();

    let json = serde_json::to_value(&apps).map_err(|e| e.to_string())?;
    *guard = Some(apps);
    Ok(json)
}

#[tauri::command]
pub fn launch_app(
    window: tauri::WebviewWindow,
    state: tauri::State<AppState>,
    id: String,
    as_admin: Option<bool>,
) {
    let _ = window.hide();

    let guard = state.apps.lock();
    guard.as_ref().unwrap().launch(&id, as_admin.unwrap_or(false));
}

#[tauri::command]
pub fn focus_app(window: tauri::WebviewWindow, state: tauri::State<AppState>, id: String) -> bool {
    let _ = window.hide();

    let guard = state.apps.lock();
    if let Some(apps) = guard.as_ref() {
        apps.focus(&id)
    } else {
        false
    }
}

#[tauri::command]
pub fn open_app_in_explorer(
    window: tauri::WebviewWindow,
    state: tauri::State<AppState>,
    id: String,
) {
    let _ = window.hide();

    let guard = state.apps.lock();
    if let Some(apps) = guard.as_ref() {
        apps.open_in_explorer(&id);
    }
}
