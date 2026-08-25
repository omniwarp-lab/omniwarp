import { invoke } from '@tauri-apps/api/core'

async function openSettings(): Promise<void> {
  await invoke('open_settings_window')
}

export { openSettings }
