import { invoke } from '@tauri-apps/api/core'

function lockScreen(): Promise<void> {
  return invoke('lock_screen')
}

function sleepSystem(): Promise<void> {
  return invoke('sleep_system')
}

export { lockScreen, sleepSystem }
