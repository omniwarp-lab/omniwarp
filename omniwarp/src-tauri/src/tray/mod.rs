use crate::AppState;
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{
    App, AppHandle, Manager, PhysicalPosition, Position, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder,
};

pub mod error;
#[allow(unused_imports)]
pub use error::{TrayError, TrayResult};

pub const TRAY_WINDOW_LABEL: &str = "tray";
pub const TRAY_WINDOW_URL: &str = "/tray";

const TRAY_WIDTH: f64 = 180.0;
const TRAY_HEIGHT: f64 = 81.0;

pub struct Tray;

impl Tray {
    pub fn setup(app: &App) -> TrayResult<()> {
        let icon = app
            .default_window_icon()
            .cloned()
            .ok_or(TrayError::MissingIcon)?;

        // Pre-create the tray window in hidden state for instant display
        let _ = Self::get_or_create_window(app.handle())?;

        let tray = TrayIconBuilder::new()
            .icon(icon)
            .show_menu_on_left_click(false)
            .on_tray_icon_event(|tray, event| match event {
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } => {
                    let app = tray.app_handle();
                    let state = app.state::<AppState>();
                    let now = std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_millis() as i64;
                    let last_unfocus = state
                        .last_unfocus
                        .load(std::sync::atomic::Ordering::Relaxed);

                    if now - last_unfocus > 250 {
                        crate::show_main_window(app);
                    }
                }
                TrayIconEvent::Click {
                    button: MouseButton::Right,
                    button_state: MouseButtonState::Up,
                    position,
                    ..
                } => {
                    let app = tray.app_handle();
                    let state = app.state::<AppState>();
                    let now = std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_millis() as i64;
                    let last_tray_unfocus = state
                        .last_tray_unfocus
                        .load(std::sync::atomic::Ordering::Relaxed);

                    if now - last_tray_unfocus > 250 {
                        if let Ok(window) = Self::get_or_create_window(app) {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                Self::position_window(&window, Some(position));
                                let _ = window.unminimize();
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                }
                _ => {}
            })
            .build(app)?;

        let state = app.state::<AppState>();
        *state.tray.lock() = Some(tray);

        Ok(())
    }

    pub fn get_or_create_window(app: &AppHandle) -> TrayResult<WebviewWindow> {
        if let Some(window) = app.get_webview_window(TRAY_WINDOW_LABEL) {
            return Ok(window);
        }

        let builder = WebviewWindowBuilder::new(
            app,
            TRAY_WINDOW_LABEL,
            WebviewUrl::App(TRAY_WINDOW_URL.into()),
        )
        .title("OmniWarp Tray")
        .inner_size(TRAY_WIDTH, TRAY_HEIGHT)
        .resizable(false)
        .maximizable(false)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .shadow(true)
        .visible(false)
        .focused(false);

        let window = builder.build()?;
        let window_clone = window.clone();
        let app_handle = app.clone();

        window.on_window_event(move |event| match event {
            tauri::WindowEvent::Focused(false) => {
                let state = app_handle.state::<AppState>();
                let now = std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_millis() as i64;
                state
                    .last_tray_unfocus
                    .store(now, std::sync::atomic::Ordering::Relaxed);
                let _ = window_clone.hide();
            }
            tauri::WindowEvent::CloseRequested { api, .. } => {
                api.prevent_close();
                let _ = window_clone.hide();
            }
            _ => {}
        });

        Ok(window)
    }

    pub fn position_window(window: &WebviewWindow, click_pos: Option<PhysicalPosition<f64>>) {
        let target_monitor = if let Some(click) = click_pos {
            let monitors = window.available_monitors().unwrap_or_default();
            monitors.into_iter().find(|m| {
                let pos = m.position();
                let size = m.size();
                click.x >= pos.x as f64
                    && click.x <= (pos.x + size.width as i32) as f64
                    && click.y >= pos.y as f64
                    && click.y <= (pos.y + size.height as i32) as f64
            })
        } else {
            None
        };

        let monitor = target_monitor
            .or_else(|| window.current_monitor().ok().flatten())
            .or_else(|| window.primary_monitor().ok().flatten());

        if let Some(monitor) = monitor {
            let scale_factor = monitor.scale_factor();
            let monitor_size = monitor.size();
            let monitor_pos = monitor.position();

            let win_w = (TRAY_WIDTH * scale_factor) as i32;
            let win_h = (TRAY_HEIGHT * scale_factor) as i32;
            let margin = (12.0 * scale_factor) as i32;

            let (click_x, click_y) = if let Some(pos) = click_pos {
                (pos.x as i32, pos.y as i32)
            } else {
                (
                    monitor_pos.x + monitor_size.width as i32 - win_w / 2 - margin,
                    monitor_pos.y + monitor_size.height as i32 - margin,
                )
            };

            let min_x = monitor_pos.x + margin;
            let max_x = monitor_pos.x + monitor_size.width as i32 - win_w - margin;
            let x = (click_x - win_w / 2).clamp(min_x, max_x.max(min_x));

            let monitor_mid_y = monitor_pos.y + monitor_size.height as i32 / 2;
            let min_y = monitor_pos.y + margin;
            let max_y = monitor_pos.y + monitor_size.height as i32 - win_h - margin;

            let y = if click_y >= monitor_mid_y {
                (click_y - win_h - margin).clamp(min_y, max_y.max(min_y))
            } else {
                (click_y + margin).clamp(min_y, max_y.max(min_y))
            };

            let _ = window.set_position(Position::Physical(PhysicalPosition::new(x, y)));
        } else {
            let _ = window.center();
        }
    }
}
