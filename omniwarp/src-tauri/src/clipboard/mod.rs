use tauri_plugin_clipboard_manager::ClipboardExt;

pub mod error;
pub use error::ClipboardResult;

pub struct Clipboard;

impl Clipboard {
    pub fn write_text(app: &tauri::AppHandle, text: &str) -> ClipboardResult<()> {
        app.clipboard().write_text(text.to_string())?;
        Ok(())
    }
}
