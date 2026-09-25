import { invoke } from '@tauri-apps/api/core'

function toggleMute(): Promise<void> {
  return invoke('toggle_mute')
}

function toggleMicrophoneMute(): Promise<boolean> {
  return invoke('toggle_microphone_mute')
}

function getVolume(): Promise<number> {
  return invoke('get_volume')
}

function setVolume(percent: number): Promise<void> {
  return invoke('set_volume', { percent })
}

function getMicrophoneVolume(): Promise<number> {
  return invoke('get_microphone_volume')
}

function setMicrophoneVolume(percent: number): Promise<void> {
  return invoke('set_microphone_volume', { percent })
}

export {
  toggleMute,
  toggleMicrophoneMute,
  getVolume,
  setVolume,
  getMicrophoneVolume,
  setMicrophoneVolume,
}

