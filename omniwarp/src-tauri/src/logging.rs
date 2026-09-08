use std::fs;
use tauri::{App, Manager};
use tracing_subscriber::filter::LevelFilter;
use tracing_subscriber::fmt;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::Layer;

pub struct Logging;

impl Logging {
    pub fn setup(app: &App) -> Result<(), Box<dyn std::error::Error>> {
        let log_dir = app.path().app_log_dir().unwrap_or_else(|_| {
            app.path()
                .app_data_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."))
                .join("logs")
        });

        fs::create_dir_all(&log_dir)?;

        let file_appender = tracing_appender::rolling::daily(&log_dir, "omniwarp.log");

        let file_layer = fmt::layer()
            .compact()
            .with_writer(file_appender)
            .with_ansi(false)
            .with_target(true)
            .with_file(true)
            .with_line_number(true)
            .with_filter(LevelFilter::INFO);

        tracing_subscriber::registry().with(file_layer).init();

        Ok(())
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
