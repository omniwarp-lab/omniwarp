use crate::system::System;

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
}
