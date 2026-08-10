use crate::apps::windows::filter::is_game;
use crate::apps::{AppKind, Apps};

impl Apps {
    pub fn classify(&mut self) {
        for app in &mut self.apps {
            if app.target_path.as_deref().is_some_and(is_game){
                app.kind = AppKind::Game;
            }
        }
    }
}
