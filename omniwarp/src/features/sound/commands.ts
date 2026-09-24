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

export { toggleMute, toggleMicrophoneMute, getVolume, setVolume }

