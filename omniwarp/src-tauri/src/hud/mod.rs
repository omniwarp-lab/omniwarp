use serde::{Deserialize, Serialize};
use tauri::{
    App, AppHandle, Emitter, Manager, PhysicalPosition, Position, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};

pub mod error;
#[allow(unused_imports)]
pub use error::{HudError, HudResult};

pub const HUD_WINDOW_LABEL: &str = "hud";
pub const HUD_WINDOW_URL: &str = "/hud";
pub const HUD_MESSAGE_EVENT: &str = "omniwarp://hud-message";

const HUD_WIDTH: f64 = 360.0;
const HUD_HEIGHT: f64 = 72.0;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HudPayload {
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    pub variant: String,
}

pub struct Hud;

impl Hud {
    pub fn setup(app: &App) -> HudResult<()> {
        Self::get_or_create_window(app.handle())?;
        Ok(())
    }

    pub fn get_or_create_window(app: &AppHandle) -> HudResult<WebviewWindow> {
        if let Some(window) = app.get_webview_window(HUD_WINDOW_LABEL) {
            return Ok(window);
        }

        let builder = WebviewWindowBuilder::new(
            app,
            HUD_WINDOW_LABEL,
            WebviewUrl::App(HUD_WINDOW_URL.into()),
        )
        .title("OmniWarp HUD")
        .inner_size(HUD_WIDTH, HUD_HEIGHT)
        .resizable(false)
        .maximizable(false)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .background_color(tauri::window::Color(0, 0, 0, 0))
        .transparent(true)
        .shadow(false)
        .visible(false)
        .focused(false);

        builder.build().map_err(Into::into)
    }

    fn position_window(window: &WebviewWindow) {
        if let Ok(Some(monitor)) = window.current_monitor() {
            let scale_factor = monitor.scale_factor();
            let monitor_size = monitor.size();
            let monitor_pos = monitor.position();

            let win_size = window.outer_size().unwrap_or_else(|_| {
                tauri::PhysicalSize::new(
                    (HUD_WIDTH * scale_factor) as u32,
                    (HUD_HEIGHT * scale_factor) as u32,
                )
            });

            let win_w = win_size.width as i32;
            let win_h = win_size.height as i32;

            let mon_w = monitor_size.width as i32;
            let mon_h = monitor_size.height as i32;

            let x = monitor_pos.x + (mon_w - win_w) / 2;

            let center_y = monitor_pos.y + (mon_h - win_h) / 2;
            let bottom_y = monitor_pos.y + mon_h - win_h - (40.0 * scale_factor) as i32;
            let y = (center_y + bottom_y) / 2;

            let _ = window.set_position(Position::Physical(PhysicalPosition::new(x, y)));
        } else {
            let _ = window.center();
        }
    }

    pub fn show(app: &AppHandle, payload: HudPayload) -> HudResult<()> {
        let window = Self::get_or_create_window(app)?;
        Self::position_window(&window);

        let _ = window.emit(HUD_MESSAGE_EVENT, &payload);
        window.show()?;

        Ok(())
    }
}
