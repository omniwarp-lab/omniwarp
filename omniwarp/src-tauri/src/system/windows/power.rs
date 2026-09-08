use crate::system::{System, SystemError, SystemResult};
use std::os::windows::process::CommandExt;
use std::process::Command;

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[link(name = "powrprof")]
extern "system" {
    fn SetSuspendState(b_hibernate: u8, b_force: u8, b_wakeup_events_disabled: u8) -> u8;
}

impl System {
    pub fn lock() -> SystemResult<()> {
        extern "system" {
            fn LockWorkStation() -> i32;
        }

        let success = unsafe { LockWorkStation() };
        if success == 0 {
            return Err(SystemError::Lock(std::io::Error::last_os_error()));
        }

        Ok(())
    }

    pub fn sleep() -> SystemResult<()> {
        let success = unsafe { SetSuspendState(0, 0, 0) };
        if success == 0 {
            return Err(SystemError::Sleep(std::io::Error::last_os_error()));
        }

        Ok(())
    }

    pub fn restart() -> SystemResult<()> {
        Command::new("shutdown")
            .args(["/r", "/t", "0"])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map_err(SystemError::Restart)?;

        Ok(())
    }

    pub fn shutdown() -> SystemResult<()> {
        Command::new("shutdown")
            .args(["/s", "/t", "0"])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map_err(SystemError::Shutdown)?;

        Ok(())
    }
}
