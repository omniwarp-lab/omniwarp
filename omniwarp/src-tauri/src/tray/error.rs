use strum::IntoStaticStr;
use thiserror::Error;

pub type TrayResult<T> = Result<T, TrayError>;

#[derive(Error, Debug, IntoStaticStr)]
#[strum(serialize_all = "camelCase", prefix = "tray.")]
pub enum TrayError {
    #[error("[window] {0}")]
    Window(#[from] tauri::Error),

    #[error("[icon] default window icon not found")]
    MissingIcon,
}

impl_error_serialize!(TrayError);
