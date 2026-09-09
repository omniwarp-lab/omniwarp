use crate::apps::{AppError, AppResult, Apps};
use crate::AppState;
use tauri::Manager;
use tauri_plugin_clipboard_manager::ClipboardExt;

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn discover_apps(
    app_handle: tauri::AppHandle,
    state: tauri::State<AppState>,
) -> AppResult<serde_json::Value> {
    let mut guard = state.apps.lock();
    if let Some(apps) = guard.as_ref() {
        return Ok(serde_json::to_value(apps)?);
    }

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
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn launch_app(
    window: tauri::WebviewWindow,
    state: tauri::State<AppState>,
    id: String,
    as_admin: Option<bool>,
) -> AppResult<()> {
    let _ = window.hide();
    state.apps().launch(&id, as_admin.unwrap_or(false))
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn focus_app(
    window: tauri::WebviewWindow,
    state: tauri::State<AppState>,
    id: String,
) -> AppResult<()> {
    let _ = window.hide();
    state.apps().focus(&id)
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn close_app(
    window: tauri::WebviewWindow,
    state: tauri::State<AppState>,
    id: String,
) -> AppResult<()> {
    let _ = window.hide();
    state.apps().close(&id)
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn open_app_in_explorer(
    window: tauri::WebviewWindow,
    state: tauri::State<AppState>,
    id: String,
) -> AppResult<()> {
    let _ = window.hide();
    state.apps().open_in_explorer(&id)
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn copy_app_target_path(
    app_handle: tauri::AppHandle,
    window: tauri::WebviewWindow,
    state: tauri::State<AppState>,
    id: String,
) -> AppResult<()> {
    let _ = window.hide();

    let apps = state.apps();
    let app = apps.get(&id);

    if !app.can_open_in_explorer || app.target_path.is_empty() {
        return Err(AppError::CopyTargetPath {
            app: app.name.clone(),
        });
    }

    app_handle
        .clipboard()
        .write_text(app.target_path.clone())
        .map_err(|_| AppError::CopyTargetPath {
            app: app.name.clone(),
        })?;

    Ok(())
}
