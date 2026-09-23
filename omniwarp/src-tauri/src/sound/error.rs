use thiserror::Error;

pub type SoundResult<T> = Result<T, SoundError>;

#[derive(Error, Debug)]
pub enum SoundError {
    #[error("[windows] {0}")]
    Windows(#[from] windows::core::Error),
}

impl serde::Serialize for SoundError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str("sound")
    }
}
