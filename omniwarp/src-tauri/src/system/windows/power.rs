use crate::system::System;
use std::os::windows::process::CommandExt;
use std::process::Command;

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[link(name = "powrprof")]
extern "system" {
    fn SetSuspendState(b_hibernate: u8, b_force: u8, b_wakeup_events_disabled: u8) -> u8;
}

impl System {
    pub fn lock() -> Result<(), String> {
        extern "system" {
            fn LockWorkStation() -> i32;
        }

        let success = unsafe { LockWorkStation() };
        if success == 0 {
            return Err("Failed to lock workstation".to_string());
        }

        Ok(())
    }

    pub fn sleep() -> Result<(), String> {
        let success = unsafe { SetSuspendState(0, 0, 0) };
        if success == 0 {
            return Err("Failed to enter sleep state".to_string());
        }

        Ok(())
    }

    pub fn restart() -> Result<(), String> {
        Command::new("shutdown")
            .args(["/r", "/t", "0"])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn shutdown() -> Result<(), String> {
        Command::new("shutdown")
            .args(["/s", "/t", "0"])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map_err(|e| e.to_string())?;

        Ok(())
    }
}
