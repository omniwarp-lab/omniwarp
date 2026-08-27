use crate::apps::windows::filter::is_game;
use crate::apps::{AppKind, Apps};

impl Apps {
    pub fn classify(&mut self) {
        for app in &mut self.apps {
            if is_game(&app.target_path) {
                app.kind = AppKind::Game;
            }
        }
    }
}
