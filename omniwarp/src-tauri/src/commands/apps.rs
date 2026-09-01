use crate::apps::Apps;
use crate::AppState;
use std::sync::Arc;
use tauri::Manager;

#[tauri::command]
pub fn discover_apps(
    app_handle: tauri::AppHandle,
    state: tauri::State<AppState>,
) -> Result<Arc<Apps>, String> {
    {
        let guard = state.apps.lock();
        if let Some(apps) = guard.as_ref() {
            return Ok(Arc::clone(apps));
        }
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

    let apps = Arc::new(apps);
    let mut guard = state.apps.lock();
    Ok(Arc::clone(guard.get_or_insert(apps)))
}

#[tauri::command]
pub fn launch_app(window: tauri::WebviewWindow, state: tauri::State<AppState>, id: String) {
    let _ = window.hide();

    let guard = state.apps.lock();
    guard.as_ref().unwrap().launch(&id);
}
