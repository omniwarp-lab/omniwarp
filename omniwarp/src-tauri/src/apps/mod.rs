use std::collections::HashMap;

#[derive(Debug)]
pub struct Apps {
    apps: Vec<AppInfo>,
    index: HashMap<String, usize>,
}

impl Apps {
    pub fn get(&self, id: &str) -> Option<&AppInfo> {
        self.index.get(id).map(|&i| &self.apps[i])
    }

    pub fn build_index(&mut self) {
        self.index = self
            .apps
            .iter()
            .enumerate()
            .map(|(i, a)| (a.id.clone(), i))
            .collect();
    }
}

#[derive(Debug)]
pub enum AppKind {
    App,
    Game,
}

#[derive(Debug)]
pub struct AppInfo {
    pub name: String,
    pub id: String,
    pub icon_path: Option<String>,
    pub target_path: Option<String>,
    pub args: String,
    pub kind: AppKind,
}

#[cfg(target_os = "windows")]
mod windows;
