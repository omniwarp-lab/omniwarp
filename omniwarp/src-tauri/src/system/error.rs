use strum::IntoStaticStr;
use thiserror::Error;

pub type SystemResult<T> = Result<T, SystemError>;

#[derive(Error, Debug, IntoStaticStr)]
#[strum(serialize_all = "camelCase", prefix = "system.")]
pub enum SystemError {
    #[error("[lock] {0}")]
    Lock(std::io::Error),

    #[error("[sleep] {0}")]
    Sleep(std::io::Error),

    #[error("[restart] {0}")]
    Restart(std::io::Error),

    #[error("[shutdown] {0}")]
    Shutdown(std::io::Error),
}

impl_error_serialize!(SystemError);
