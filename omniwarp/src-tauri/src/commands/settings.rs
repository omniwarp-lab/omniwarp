use crate::settings::SettingsResult;
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

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
