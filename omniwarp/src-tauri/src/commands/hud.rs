use crate::hud::{Hud, HudPayload};
use tauri::AppHandle;

#[tauri::command]
pub async fn show_hud(app: AppHandle, payload: HudPayload) -> Result<(), String> {
    Hud::show(&app, payload)
}
