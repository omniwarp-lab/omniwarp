pub struct System;

#[cfg(target_os = "windows")]
mod windows;

pub mod error;
pub use error::{SystemError, SystemResult};
