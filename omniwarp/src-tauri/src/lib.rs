use crate::apps::Apps;
use parking_lot::Mutex;
use std::sync::atomic::AtomicI64;
use tauri::tray::TrayIcon;
use tauri::{Emitter, Manager};
use tauri_plugin_autostart::MacosLauncher;

#[macro_use]
mod macros;

mod apps;
mod clipboard;
mod commands;
mod db;
mod hud;
mod logging;
mod settings;
mod shortcuts;
mod sound;
mod system;
mod tray;
mod web_search;

pub use logging::ResultExt;

pub struct AppState {
    pub apps: Mutex<Option<Apps>>,
    pub tray: Mutex<Option<TrayIcon>>,
    pub last_unfocus: AtomicI64,
    pub last_tray_unfocus: AtomicI64,
}

impl AppState {
    pub fn apps(&self) -> parking_lot::MappedMutexGuard<'_, Apps> {
        parking_lot::MutexGuard::map(self.apps.lock(), |apps| {
            apps.as_mut().expect("Apps must be discovered")
        })
    }
}

use crate::hud::Hud;
use crate::logging::Logging;
use crate::shortcuts::Shortcuts;
use crate::tray::Tray;
use commands::apps::{
    close_app, copy_app_target_path, discover_apps, focus_app, launch_app, open_app_in_explorer,
};
use commands::clipboard::copy_text;
use commands::hud::show_hud;
use commands::search_providers::{
    add_search_provider, delete_search_provider, list_search_providers,
    preview_search_provider_icon, reorder_search_providers, set_search_provider_enabled,
    update_search_provider, IconCache,
};
use commands::settings::{open_logs_dir, open_settings_window};
use commands::sound::{get_volume, set_volume, toggle_microphone_mute, toggle_mute};
use commands::system::{lock_screen, restart_system, shutdown_system, sleep_system};
use commands::tray::exit_app;
use commands::web_search::{fetch_website_title, search_web};
use db::Db;
use tauri::http::{header, Response, StatusCode};

pub fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let state = app.state::<AppState>();
        let mut guard = state.apps.lock();
        if let Some(apps) = guard.as_mut() {
            apps.snapshot_running();
            let running = apps.running_map();
            let _ = window.emit("omniwarp://apps-running-updated", running);
        }
        let _ = window.unminimize();
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
        .register_asynchronous_uri_scheme_protocol("provider-icon", |ctx, request, responder| {
            let app = ctx.app_handle().clone();
            let uri = request.uri().clone();
            tauri::async_runtime::spawn(async move {
                let query = uri.query().unwrap_or("");
                let mut id_param = None;
                let mut preview_param = None;
                for (k, v) in url::form_urlencoded::parse(query.as_bytes()) {
                    if k == "id" {
                        id_param = Some(v.into_owned());
                    } else if k == "preview" {
                        preview_param = Some(v.into_owned());
                    }
                }

                let icon: Option<Vec<u8>> = if let Some(id) = id_param {
                    let db = app.state::<Db>();
                    let row = db
                        .conn()
                        .query_row(
                            "SELECT icon_data FROM search_providers WHERE id = ?1",
                            rusqlite::params![id],
                            |r| r.get::<_, Option<Vec<u8>>>(0),
                        )
                        .ok();
                    row.flatten()
                } else if let Some(preview_key) = preview_param {
                    app.state::<parking_lot::Mutex<IconCache>>()
                        .lock()
                        .keys
                        .get(&preview_key)
                        .cloned()
                } else {
                    None
                };

                let response = match icon {
                    Some(bytes) => {
                        let mime = if bytes.starts_with(b"\x89PNG") {
                            "image/png"
                        } else {
                            "image/svg+xml"
                        };
                        Response::builder()
                            .status(StatusCode::OK)
                            .header(header::CONTENT_TYPE, mime)
                            .header("X-Content-Type-Options", "nosniff")
                            .header(header::CACHE_CONTROL, "public, max-age=31536000, immutable")
                            .header(
                                "Content-Security-Policy",
                                "default-src 'none'; style-src 'unsafe-inline'",
                            )
                            .body(bytes)
                            .unwrap()
                    }
                    None => Response::builder()
                        .status(StatusCode::NOT_FOUND)
                        .body(Vec::new())
                        .unwrap(),
                };

                responder.respond(response);
            });
        })
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .manage(AppState {
            apps: Mutex::new(None),
            tray: Mutex::new(None),
            last_unfocus: AtomicI64::new(0),
            last_tray_unfocus: AtomicI64::new(0),
        })
        .setup(|app| {
            Logging::setup(app)
                .inspect_err(|err| eprintln!("Failed to initialize logging: {err}"))?;
            app.manage(Db::init(app.handle()).log_err()?);
            app.manage(parking_lot::Mutex::new(IconCache::default()));
            Tray::setup(app).log_err()?;
            Shortcuts::setup(app).log_err()?;
            Hud::setup(app).log_err()?;

            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                let app_handle = app.handle().clone();
                window.on_window_event(move |event| match event {
                    tauri::WindowEvent::Focused(false) => {
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
                    tauri::WindowEvent::CloseRequested { api, .. } => {
                        api.prevent_close();
                        let _ = window_clone.hide();
                    }
                    _ => {}
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
            copy_text,
            exit_app,
            open_settings_window,
            open_logs_dir,
            show_hud,
            toggle_mute,
            toggle_microphone_mute,
            get_volume,
            set_volume,
            lock_screen,
            sleep_system,
            restart_system,
            shutdown_system,
            search_web,
            fetch_website_title,
            preview_search_provider_icon,
            list_search_providers,
            set_search_provider_enabled,
            add_search_provider,
            update_search_provider,
            reorder_search_providers,
            delete_search_provider
        ])
        .build(tauri::generate_context!())
        .expect("Error while running OmniWarp")
        .run(|app_handle, event| {
            if let tauri::RunEvent::ExitRequested { .. } = event {
                for (_, window) in app_handle.webview_windows() {
                    let _ = window.destroy();
                }
            }
        });
}
