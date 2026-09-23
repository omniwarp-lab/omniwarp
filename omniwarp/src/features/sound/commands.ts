import { invoke } from '@tauri-apps/api/core'

function toggleMute(): Promise<void> {
  return invoke('toggle_mute')
}

export { toggleMute }
