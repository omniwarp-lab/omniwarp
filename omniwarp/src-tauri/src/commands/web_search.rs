use crate::web_search::{WebSearch, WebSearchResult};
use tauri::AppHandle;

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub async fn search_web(
    window: tauri::WebviewWindow,
    app: AppHandle,
    url: String,
) -> WebSearchResult<()> {
    let _ = window.hide();
    WebSearch::open(&app, &url)
}
