use crate::logging::{Logging, LoggingError, LoggingResult};
use tauri_plugin_opener::OpenerExt;

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn open_logs_dir(app: tauri::AppHandle) -> LoggingResult<()> {
    let log_dir = Logging::log_dir(&app);
    let _ = std::fs::create_dir_all(&log_dir);
    app.opener()
        .open_path(log_dir.to_string_lossy(), None::<&str>)
        .map_err(LoggingError::OpenDir)?;
    Ok(())
}
