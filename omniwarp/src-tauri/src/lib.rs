use crate::apps::Apps;
use parking_lot::Mutex;
use std::sync::Arc;

mod apps;
mod commands;

struct AppState {
    apps: Mutex<Option<Arc<Apps>>>,
}

use commands::apps::{discover_apps, launch_app};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            apps: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![discover_apps, launch_app])
        .run(tauri::generate_context!())
        .expect("Error while running OmniWarp");
}
