use crate::apps::Apps;
use parking_lot::Mutex;
use std::sync::Arc;
use tauri::tray::TrayIcon;

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
use commands::tray::update_tray_menu;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .manage(AppState {
            apps: Mutex::new(None),
            tray: Mutex::new(None),
        })
        .setup(|app| {
            Tray::setup(app)?;
            Shortcuts::setup(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            discover_apps,
            launch_app,
            update_tray_menu
        ])
        .run(tauri::generate_context!())
        .expect("Error while running OmniWarp");
}
