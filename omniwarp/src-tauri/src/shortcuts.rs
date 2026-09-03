use tauri::{Manager, Result as TauriResult};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

pub struct Shortcuts;

impl Shortcuts {
    pub fn setup(app: &mut tauri::App) -> TauriResult<()> {
        let shortcut = Shortcut::new(Some(Modifiers::ALT), Code::Space);

        app.global_shortcut()
            .on_shortcut(shortcut, |app, _shortcut, event| {
                if event.state() == ShortcutState::Pressed {
                    if let Some(window) = app.get_webview_window("main") {
                        if window.is_visible().unwrap_or(false) {
                            let _ = window.hide();
                        } else {
                            crate::show_main_window(app);
                        }
                    }
                }
            })
            .unwrap();
        Ok(())
    }
}
