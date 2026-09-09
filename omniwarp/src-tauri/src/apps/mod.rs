use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Serialize)]
#[serde(transparent)]
pub struct Apps {
    apps: Vec<AppInfo>,
    #[serde(skip)]
    index: HashMap<String, usize>,
    #[serde(skip)]
    exe_index: HashMap<String, usize>,
}

impl Apps {
    pub fn get(&self, id: &str) -> &AppInfo {
        let &i = self
            .index
            .get(id)
            .expect("App ID must exist in discovered apps index");
        &self.apps[i]
    }

    pub fn find(&self, id: &str) -> Option<&AppInfo> {
        self.index.get(id).map(|&i| &self.apps[i])
    }

    pub fn build_index(&mut self) {
        self.index = self
            .apps
            .iter()
            .enumerate()
            .map(|(i, a)| (a.id.clone(), i))
            .collect();
        #[cfg(target_os = "windows")]
        self.build_exe_index();
    }

    pub fn running_map(&self) -> HashMap<&str, &[u32]> {
        self.apps
            .iter()
            .filter(|a| !a.pids.is_empty())
            .map(|a| (a.id.as_str(), a.pids.as_slice()))
            .collect()
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
    pub target_path: String,
    #[serde(skip)]
    pub args: String,
    pub kind: AppKind,
    pub pids: Vec<u32>,
    pub can_open_in_explorer: bool,
    pub can_run_as_admin: bool,
}

#[cfg(target_os = "windows")]
mod windows;

pub mod error;
pub use error::{AppError, AppResult};
