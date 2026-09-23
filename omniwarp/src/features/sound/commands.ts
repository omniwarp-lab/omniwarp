import { invoke } from '@tauri-apps/api/core'

function toggleMute(): Promise<void> {
  return invoke('toggle_mute')
}

function toggleMicrophoneMute(): Promise<boolean> {
  return invoke('toggle_microphone_mute')
}

export { toggleMute, toggleMicrophoneMute }

