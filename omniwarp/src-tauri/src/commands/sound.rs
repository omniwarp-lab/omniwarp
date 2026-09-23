use crate::sound::{Sound, SoundResult};

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn toggle_mute(window: tauri::WebviewWindow) -> SoundResult<()> {
    let _ = window.hide();
    Sound::toggle_mute()
}
