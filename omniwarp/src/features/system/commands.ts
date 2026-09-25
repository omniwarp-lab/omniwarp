import { invoke } from '@tauri-apps/api/core'

function lockScreen(): Promise<void> {
  return invoke('lock_screen')
}

function sleepSystem(): Promise<void> {
  return invoke('sleep_system')
}

function restartSystem(): Promise<void> {
  return invoke('restart_system')
}

function shutdownSystem(): Promise<void> {
  return invoke('shutdown_system')
}

function nextTrack(): Promise<void> {
  return invoke('next_track')
}

function previousTrack(): Promise<void> {
  return invoke('previous_track')
}

function playPause(): Promise<void> {
  return invoke('play_pause')
}

export {
  lockScreen,
  sleepSystem,
  restartSystem,
  shutdownSystem,
  nextTrack,
  previousTrack,
  playPause,
}
