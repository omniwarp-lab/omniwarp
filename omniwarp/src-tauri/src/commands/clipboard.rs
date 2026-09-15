use crate::clipboard::{Clipboard, ClipboardResult};
use tauri::AppHandle;

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn copy_to_clipboard(
    window: tauri::WebviewWindow,
    app: AppHandle,
    text: String,
) -> ClipboardResult<()> {
    let _ = window.hide();
    Clipboard::write_text(&app, &text)
}
