use strum::IntoStaticStr;
use thiserror::Error;

pub type ShortcutResult<T> = Result<T, ShortcutError>;

#[derive(Error, Debug, IntoStaticStr)]
#[strum(serialize_all = "camelCase", prefix = "shortcuts.")]
pub enum ShortcutError {
    #[error("[register] {0}")]
    Register(#[from] tauri_plugin_global_shortcut::Error),
}

impl_error_serialize!(ShortcutError);
