use tauri::AppHandle;

#[tauri::command]
#[tracing::instrument(skip_all)]
pub fn exit_app(app: AppHandle) {
    app.exit(0);
}
