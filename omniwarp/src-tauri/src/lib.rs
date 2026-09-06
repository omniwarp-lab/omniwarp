use crate::apps::Apps;
use parking_lot::Mutex;
use std::sync::atomic::AtomicI64;
use tauri::tray::TrayIcon;
use tauri::{Emitter, Manager};
use tauri_plugin_autostart::MacosLauncher;

mod apps;
mod commands;
mod shortcuts;
mod system;
mod tray;

pub struct AppState {
    pub apps: Mutex<Option<Apps>>,
    pub tray: Mutex<Option<TrayIcon>>,
    pub last_unfocus: AtomicI64,
}

use crate::shortcuts::Shortcuts;
use crate::tray::Tray;
use commands::apps::{
    close_app, copy_app_target_path, discover_apps, focus_app, launch_app, open_app_in_explorer,
};
use commands::settings::open_settings_window;
use commands::system::{lock_screen, restart_system, sleep_system};
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
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .manage(AppState {
            apps: Mutex::new(None),
            tray: Mutex::new(None),
            last_unfocus: AtomicI64::new(0),
        })
        .setup(|app| {
            Tray::setup(app)?;
            Shortcuts::setup(app)?;

            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                let app_handle = app.handle().clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Focused(false) = event {
                        let state = app_handle.state::<AppState>();
                        let now = std::time::SystemTime::now()
                            .duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_millis() as i64;
                        state
                            .last_unfocus
                            .store(now, std::sync::atomic::Ordering::Relaxed);
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
            close_app,
            open_app_in_explorer,
            copy_app_target_path,
            update_tray_menu,
            open_settings_window,
            lock_screen,
            sleep_system,
            restart_system
        ])
        .run(tauri::generate_context!())
        .expect("Error while running OmniWarp");
}
