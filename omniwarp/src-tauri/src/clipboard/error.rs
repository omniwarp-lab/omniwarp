use strum::IntoStaticStr;
use thiserror::Error;

pub type ClipboardResult<T> = Result<T, ClipboardError>;

#[derive(Error, Debug, IntoStaticStr)]
#[strum(serialize_all = "camelCase", prefix = "clipboard.")]
pub enum ClipboardError {
    #[error("[copyText] {0}")]
    CopyText(#[from] tauri_plugin_clipboard_manager::Error),
}

impl_error_serialize!(ClipboardError);
