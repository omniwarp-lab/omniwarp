#[derive(Debug)]
pub struct Apps {
    apps: Vec<AppInfo>,
}

#[derive(Debug)]
pub struct AppInfo {
    pub name: String,
    pub id: String,
    pub icon_path: Option<String>,
    pub target_path: Option<String>,
    pub args: String,
}

#[cfg(target_os = "windows")]
mod windows;
