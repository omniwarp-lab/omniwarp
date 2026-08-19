use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Serialize)]
#[serde(transparent)]
pub struct Apps {
    apps: Vec<AppInfo>,
    #[serde(skip)]
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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum AppKind {
    App,
    Game,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppInfo {
    pub name: String,
    pub id: String,
    pub icon_path: Option<String>,
    #[serde(skip)]
    pub target_path: Option<String>,
    #[serde(skip)]
    pub args: String,
    pub kind: AppKind,
}

#[cfg(target_os = "windows")]
mod windows;
