use std::fs;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime};
use strum::IntoStaticStr;
use tauri::{App, Manager, Runtime};
use thiserror::Error;
use tracing_subscriber::filter::LevelFilter;
use tracing_subscriber::fmt;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::Layer;

pub type LoggingResult<T> = Result<T, LoggingError>;

#[derive(Error, Debug, IntoStaticStr)]
#[strum(serialize_all = "camelCase", prefix = "logging.")]
pub enum LoggingError {
    #[error("[openDir] {0}")]
    OpenDir(#[from] tauri_plugin_opener::Error),

    #[error("[readDir] {0}")]
    ReadDir(std::io::Error),

    #[error("[removeFile] {0}")]
    RemoveFile(std::io::Error),
}

impl_error_serialize!(LoggingError);

pub struct Logging;

impl Logging {
    pub const LOG_PREFIX: &'static str = "omniwarp.log";
    pub const MAX_LOG_AGE: Duration = Duration::from_secs(7 * 24 * 60 * 60);

    pub fn log_dir<R: Runtime>(app: &impl Manager<R>) -> PathBuf {
        app.path().app_log_dir().unwrap_or_else(|_| {
            app.path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."))
                .join("logs")
        })
    }

    pub fn parse_cleanup_retention(content: &str) -> Option<Duration> {
        let Ok(json) = serde_json::from_str::<serde_json::Value>(content) else {
            return Some(Self::MAX_LOG_AGE);
        };

        match json.get("logCleanup").and_then(|v| v.as_str()) {
            Some("never") => None,
            Some("30days") => Some(Duration::from_secs(30 * 24 * 60 * 60)),
            _ => Some(Self::MAX_LOG_AGE),
        }
    }

    pub fn get_cleanup_max_age(app: &App) -> Option<Duration> {
        let Ok(data_dir) = app.path().app_data_dir() else {
            return Some(Self::MAX_LOG_AGE);
        };
        let settings_path = data_dir.join("settings.json");
        let Ok(content) = fs::read_to_string(settings_path) else {
            return Some(Self::MAX_LOG_AGE);
        };

        Self::parse_cleanup_retention(&content)
    }

    pub fn setup(app: &App) -> Result<(), Box<dyn std::error::Error>> {
        let log_dir = Self::log_dir(app);

        fs::create_dir_all(&log_dir)?;

        let file_appender = tracing_appender::rolling::daily(&log_dir, Self::LOG_PREFIX);

        let file_layer = fmt::layer()
            .compact()
            .with_writer(file_appender)
            .with_ansi(false)
            .with_target(true)
            .with_file(true)
            .with_line_number(true)
            .with_filter(LevelFilter::INFO);

        tracing_subscriber::registry().with(file_layer).try_init()?;

        if let Some(max_age) = Self::get_cleanup_max_age(app) {
            Self::cleanup_old_logs(&log_dir, max_age);
        }

        Ok(())
    }

    pub fn cleanup_old_logs(log_dir: &Path, max_age: Duration) -> Vec<PathBuf> {
        let entries = match fs::read_dir(log_dir) {
            Ok(entries) => entries,
            Err(err) => {
                let error = LoggingError::ReadDir(err);
                tracing::warn!(error = %error);
                return Vec::new();
            }
        };

        let now = SystemTime::now();
        let mut deleted = Vec::new();

        for entry in entries.flatten() {
            let path = entry.path();

            let Ok(file_type) = entry.file_type() else {
                continue;
            };
            if !file_type.is_file() {
                continue;
            }

            let file_name = entry.file_name();
            let Some(name_str) = file_name.to_str() else {
                continue;
            };

            let is_log_file = name_str
                .strip_prefix(Self::LOG_PREFIX)
                .is_some_and(|rest| rest.is_empty() || rest.starts_with('.'));

            if !is_log_file {
                continue;
            }

            let Ok(metadata) = entry.metadata() else {
                continue;
            };

            let file_time = metadata.modified().or_else(|_| metadata.created());
            if let Ok(time) = file_time {
                if let Ok(age) = now.duration_since(time) {
                    if age >= max_age {
                        if let Err(err) = fs::remove_file(&path) {
                            let error = LoggingError::RemoveFile(err);
                            tracing::warn!(error = %error);
                        } else {
                            deleted.push(path);
                        }
                    }
                }
            }
        }

        deleted
    }
}

pub trait ResultExt<T, E> {
    fn log_err(self) -> Result<T, E>;
}

impl<T, E: std::fmt::Display> ResultExt<T, E> for Result<T, E> {
    fn log_err(self) -> Result<T, E> {
        if let Err(ref err) = self {
            tracing::error!(error = %err);
        }
        self
    }
}
