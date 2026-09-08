use crate::hud::{Hud, HudPayload, HudResult};
use tauri::AppHandle;

#[tauri::command]
#[tracing::instrument(skip_all, err)]
pub async fn show_hud(app: AppHandle, payload: HudPayload) -> HudResult<()> {
    Hud::show(&app, payload)
}
