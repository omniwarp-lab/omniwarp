use strum::IntoStaticStr;
use thiserror::Error;

pub type HudResult<T> = Result<T, HudError>;

#[derive(Error, Debug, IntoStaticStr)]
#[strum(serialize_all = "camelCase", prefix = "hud.")]
pub enum HudError {
    #[error("[show] {0}")]
    Show(#[from] tauri::Error),
}

impl_error_serialize!(HudError);
