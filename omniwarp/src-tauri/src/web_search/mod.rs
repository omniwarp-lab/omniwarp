use tauri_plugin_opener::OpenerExt;

pub mod error;
pub use error::WebSearchResult;

pub struct WebSearch;

impl WebSearch {
    pub fn open(app: &tauri::AppHandle, url: &str) -> WebSearchResult<()> {
        app.opener().open_url(url, None::<&str>)?;
        Ok(())
    }
}
