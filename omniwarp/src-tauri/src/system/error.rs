use serde::Serialize;
use strum::IntoStaticStr;
use thiserror::Error;

pub type SystemResult<T> = Result<T, SystemError>;

#[derive(Error, Debug, IntoStaticStr)]
#[strum(serialize_all = "camelCase", prefix = "system.")]
pub enum SystemError {
    #[error("Failed to lock workstation: {0}")]
    Lock(std::io::Error),

    #[error("Failed to enter sleep state: {0}")]
    Sleep(std::io::Error),

    #[error("Failed to restart system: {0}")]
    Restart(std::io::Error),

    #[error("Failed to shut down system: {0}")]
    Shutdown(std::io::Error),
}

impl Serialize for SystemError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(self.into())
    }
}
