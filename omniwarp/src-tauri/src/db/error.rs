use strum::IntoStaticStr;
use thiserror::Error;

pub type DbResult<T> = Result<T, DbError>;

#[derive(Error, Debug, IntoStaticStr)]
#[strum(serialize_all = "camelCase", prefix = "db.")]
pub enum DbError {
    #[error("[sqlite] {0}")]
    Sqlite(#[from] rusqlite::Error),

    #[error("[io] {0}")]
    Io(#[from] std::io::Error),

    #[error("[path] {0}")]
    Path(#[from] tauri::Error),
}

impl_error_serialize!(DbError);
