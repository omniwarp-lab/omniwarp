import { invoke } from '@tauri-apps/api/core'

function lockScreen(): Promise<void> {
  return invoke('lock_screen')
}

export { lockScreen }
