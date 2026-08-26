use crate::apps::Apps;
use parking_lot::Mutex;
use std::sync::Arc;
use tauri::tray::TrayIcon;
use tauri::Manager;

mod apps;
mod commands;
mod shortcuts;
mod tray;

struct AppState {
    apps: Mutex<Option<Arc<Apps>>>,
    tray: Mutex<Option<TrayIcon>>,
}

use crate::shortcuts::Shortcuts;
use crate::tray::Tray;
use commands::apps::{discover_apps, launch_app};
use commands::settings::open_settings_window;
use commands::tray::update_tray_menu;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }));
    }

    builder
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(AppState {
            apps: Mutex::new(None),
            tray: Mutex::new(None),
        })
        .setup(|app| {
            Tray::setup(app)?;
            Shortcuts::setup(app)?;

            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Focused(false) = event {
                        let _ = window_clone.hide();
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            discover_apps,
            launch_app,
            update_tray_menu,
            open_settings_window
        ])
        .run(tauri::generate_context!())
        .expect("Error while running OmniWarp");
}
