use crate::logging::Logging;
use crate::settings::SettingsResult;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_opener::OpenerExt;

const SETTINGS_WINDOW_LABEL: &str = "settings";
const SETTINGS_WINDOW_URL: &str = "/settings";

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub async fn open_settings_window(
    window: tauri::WebviewWindow,
    app: AppHandle,
) -> SettingsResult<()> {
    let _ = window.hide();

    if let Some(window) = app.get_webview_window(SETTINGS_WINDOW_LABEL) {
        window.unminimize()?;
        window.show()?;
        window.set_focus()?;
        return Ok(());
    }

    let builder = WebviewWindowBuilder::new(
        &app,
        SETTINGS_WINDOW_LABEL,
        WebviewUrl::App(SETTINGS_WINDOW_URL.into()),
    )
    .title("OmniWarp")
    .inner_size(700.0, 460.0)
    .resizable(false)
    .maximizable(false)
    .decorations(false)
    .center()
    .visible(false)
    .focused(false);

    builder.build()?;

    Ok(())
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub async fn open_logs_dir(app: AppHandle) -> SettingsResult<()> {
    let log_dir = Logging::dir(&app);
    let _ = std::fs::create_dir_all(&log_dir);
    app.opener().open_path(log_dir.to_string_lossy(), None::<&str>)?;
    Ok(())
}
