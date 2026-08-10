use crate::apps::Apps;
use std::path::Path;

impl Apps {
    pub fn filter(&mut self) {
        self.apps.retain(|app| {
            match &app.target_path {
                Some(target) => {
                    (!is_web_url(target) && is_executable(target))
                        || is_game(target)
                        || is_clsid(target)
                }
                None => true, // no target -> keep
            }
        });
    }
}

fn is_web_url(target: &str) -> bool {
    target.starts_with("http://") || target.starts_with("https://")
}

fn is_executable(target: &str) -> bool {
    const EXECUTABLE_EXTS: &[&str] = &["exe", "com", "bat", "cmd", "msc", "scr"];
    Path::new(target)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| {
            EXECUTABLE_EXTS
                .iter()
                .any(|ext| e.eq_ignore_ascii_case(ext))
        })
        .unwrap_or(false)
}

fn is_clsid(target: &str) -> bool {
    target.starts_with("::{")
}

fn is_game(target: &str) -> bool {
    const GAME_PLATFORM_SCHEMES: &[&str] = &[
        "steam",
        "com.epicgames.launcher",
        "googleplaygames",
        "uplay",
        "battlenet",
    ];

    target
        .split_once("://")
        .map(|(scheme, _)| GAME_PLATFORM_SCHEMES.contains(&scheme.to_ascii_lowercase().as_str()))
        .unwrap_or(false)
}
