use crate::apps::{AppResult, Apps};
use crate::AppState;
use tauri::Manager;
use tauri_plugin_clipboard_manager::ClipboardExt;

#[tauri::command]
pub fn discover_apps(
    app_handle: tauri::AppHandle,
    state: tauri::State<AppState>,
) -> AppResult<serde_json::Value> {
    let mut guard = state.apps.lock();
    if let Some(apps) = guard.as_ref() {
        return Ok(serde_json::to_value(apps)?);
    }

    let result = (|| -> AppResult<serde_json::Value> {
        let mut apps = Apps::discover()?;
        let cache_dir = app_handle.path().app_cache_dir()?.join("app-icons");
        apps.filter();
        apps.classify();
        apps.cache_icons(&cache_dir);
        apps.build_index();
        apps.snapshot_running();

        let json = serde_json::to_value(&apps)?;
        *guard = Some(apps);
        Ok(json)
    })();

    if let Err(ref err) = result {
        tracing::error!(error = %err);
    }

    result
}

#[tauri::command]
pub fn launch_app(
    window: tauri::WebviewWindow,
    state: tauri::State<AppState>,
    id: String,
    as_admin: Option<bool>,
) -> AppResult<()> {
    let _ = window.hide();

    let guard = state.apps.lock();
    let apps = guard
        .as_ref()
        .expect("Apps must be discovered before launching");
    let result = apps.launch(&id, as_admin.unwrap_or(false));

    if let Err(ref err) = result {
        tracing::error!(error = %err);
    }

    result
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
pub fn close_app(window: tauri::WebviewWindow, state: tauri::State<AppState>, id: String) {
    let _ = window.hide();

    let guard = state.apps.lock();
    if let Some(apps) = guard.as_ref() {
        apps.close(&id);
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

#[tauri::command]
pub fn copy_app_target_path(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
    state: tauri::State<AppState>,
    id: String,
) -> bool {
    let _ = window.hide();

    let guard = state.apps.lock();
    if let Some(apps) = guard.as_ref() {
        if let Some(app) = apps.get(&id) {
            if app.can_open_in_explorer && !app.target_path.is_empty() {
                return app_handle
                    .clipboard()
                    .write_text(app.target_path.clone())
                    .is_ok();
            }
        }
    }
    false
}
