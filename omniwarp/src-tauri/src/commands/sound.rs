use crate::sound::{Sound, SoundResult};

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn toggle_mute(window: tauri::WebviewWindow) -> SoundResult<()> {
    let _ = window.hide();
    Sound::toggle_mute()
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn toggle_microphone_mute(window: tauri::WebviewWindow) -> SoundResult<bool> {
    let _ = window.hide();
    Sound::toggle_microphone_mute()
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn get_volume() -> SoundResult<u32> {
    Sound::get_volume()
}

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub fn set_volume(percent: u32) -> SoundResult<()> {
    Sound::set_volume(percent)
}

