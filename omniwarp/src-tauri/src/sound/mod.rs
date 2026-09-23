pub struct Sound;

#[cfg(target_os = "windows")]
mod windows;

pub mod error;
#[allow(unused_imports)]
pub use error::{SoundError, SoundResult};

