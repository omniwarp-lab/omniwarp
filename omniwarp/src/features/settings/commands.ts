import { invoke } from '@tauri-apps/api/core'

async function openSettings(): Promise<void> {
  await invoke('open_settings_window')
}

async function openLogsDir(): Promise<void> {
  await invoke('open_logs_dir')
}

export { openSettings, openLogsDir }
