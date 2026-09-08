use serde::Serialize;
use strum::IntoStaticStr;
use thiserror::Error;

pub type SettingsResult<T> = Result<T, SettingsError>;

#[derive(Error, Debug, IntoStaticStr)]
#[strum(serialize_all = "camelCase", prefix = "settings.")]
pub enum SettingsError {
    #[error("[open] {0}")]
    Open(#[from] tauri::Error),
}

impl Serialize for SettingsError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.into())
    }
}
