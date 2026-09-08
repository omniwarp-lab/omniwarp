use strum::IntoStaticStr;
use thiserror::Error;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Error, Debug, IntoStaticStr)]
#[strum(serialize_all = "camelCase", prefix = "apps.")]
pub enum AppError {
    #[error("[launch] {app}: code {code}")]
    Launch { app: String, code: isize },

    #[error("[discovery] {0}")]
    Discovery(#[from] windows::core::Error),

    #[error("[cacheDir] {0}")]
    CacheDir(#[from] tauri::Error),

    #[error("[serialize] {0}")]
    Serialize(#[from] serde_json::Error),
}

impl_error_serialize!(AppError);
