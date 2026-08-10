#[derive(Debug)]
pub struct Apps {
    apps: Vec<AppInfo>,
}

#[derive(Debug)]
pub struct AppInfo {
    pub name: String,
    pub id: String,
    pub icon_path: Option<String>,
}

#[cfg(target_os = "windows")]
mod windows;
