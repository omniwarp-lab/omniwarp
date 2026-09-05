use crate::apps::Apps;
use parking_lot::Mutex;
use tauri::tray::TrayIcon;
use tauri::{Emitter, Manager};
use tauri_plugin_autostart::MacosLauncher;

mod apps;
mod commands;
mod shortcuts;
mod tray;

struct AppState {
    apps: Mutex<Option<Apps>>,
    tray: Mutex<Option<TrayIcon>>,
}

use crate::shortcuts::Shortcuts;
use crate::tray::Tray;
use commands::apps::{discover_apps, focus_app, launch_app, open_app_in_explorer};
use commands::settings::open_settings_window;
use commands::tray::update_tray_menu;

pub fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let state = app.state::<AppState>();
        let mut guard = state.apps.lock();
        if let Some(apps) = guard.as_mut() {
            apps.snapshot_running();
            let running = apps.running_map();
            let _ = window.emit("omniwarp://apps-running-updated", running);
        }
        let _ = window.show();
        let _ = window.set_focus();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_main_window(app);
        }));
    }

    builder
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
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
            focus_app,
            open_app_in_explorer,
            update_tray_menu,
            open_settings_window
        ])
        .run(tauri::generate_context!())
        .expect("Error while running OmniWarp");
}
