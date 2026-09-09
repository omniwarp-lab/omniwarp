use strum::IntoStaticStr;
use thiserror::Error;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Error, Debug, IntoStaticStr)]
#[strum(serialize_all = "camelCase", prefix = "apps.")]
pub enum AppError {
    #[error("[launch] {app}: code {code}")]
    Launch { app: String, code: isize },

    #[error("[openInExplorer] {app}: code {code}")]
    OpenInExplorer { app: String, code: isize },

    #[error("[focus] {app}")]
    Focus { app: String },

    #[error("[close] {app}{}", format_code(.code))]
    Close { app: String, code: Option<u32> },

    #[error("[copyTargetPath] {app}")]
    CopyTargetPath { app: String },

    #[error("[discovery] {0}")]
    Discovery(#[from] windows::core::Error),

    #[error("[cacheDir] {0}")]
    CacheDir(#[from] tauri::Error),

    #[error("[serialize] {0}")]
    Serialize(#[from] serde_json::Error),
}

fn format_code(code: &Option<u32>) -> String {
    match code {
        Some(c) => format!(": code {c}"),
        None => String::new(),
    }
}

impl_error_serialize!(AppError);
