use crate::clipboard::{Clipboard, ClipboardResult};
use tauri::AppHandle;

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn copy_text(
    app: AppHandle,
    window: tauri::WebviewWindow,
    text: String,
) -> ClipboardResult<()> {
    let _ = window.hide();
    Clipboard::copy_text(&app, &text)
}
