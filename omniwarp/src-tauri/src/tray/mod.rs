use crate::AppState;
use std::collections::HashMap;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{App, AppHandle, Manager};

pub mod error;
#[allow(unused_imports)]
pub use error::{TrayError, TrayResult};

pub struct Tray;

impl Tray {
    pub fn setup(app: &App) -> TrayResult<()> {
        let default_labels = HashMap::new();
        let menu = Self::build_menu(app.handle(), &default_labels)?;
        let icon = app
            .default_window_icon()
            .cloned()
            .ok_or(TrayError::MissingIcon)?;

        let tray = TrayIconBuilder::new()
            .icon(icon)
            .menu(&menu)
            .show_menu_on_left_click(false)
            .on_menu_event(Self::handle_tray_menu_event)
            .on_tray_icon_event(|tray, event| {
                if let TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } = event
                {
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
            })
            .build(app)?;

        let state = app.state::<AppState>();
        *state.tray.lock() = Some(tray);

        Ok(())
    }

    pub fn build_menu(
        app: &AppHandle,
        labels: &HashMap<String, String>,
    ) -> TrayResult<Menu<tauri::Wry>> {
        let quit_label = labels.get("quit").map(String::as_str).unwrap_or("Quit");
        let quit_item = MenuItem::with_id(app, "quit", quit_label, true, None::<&str>)?;

        let menu = Menu::with_items(app, &[&quit_item])?;
        Ok(menu)
    }

    fn handle_tray_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
        match event.id.as_ref() {
            "quit" => app.exit(0),
            _ => {}
        }
    }
}
