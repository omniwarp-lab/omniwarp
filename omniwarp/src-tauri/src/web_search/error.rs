use strum::IntoStaticStr;
use thiserror::Error;

pub type WebSearchResult<T> = Result<T, WebSearchError>;

#[derive(Error, Debug, IntoStaticStr)]
#[strum(serialize_all = "camelCase", prefix = "webSearch.")]
pub enum WebSearchError {
    #[error("[open] {0}")]
    Open(#[from] tauri_plugin_opener::Error),
}

impl_error_serialize!(WebSearchError);
