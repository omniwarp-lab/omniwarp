import { invoke } from '@tauri-apps/api/core'

async function exitApp(): Promise<void> {
  await invoke('exit_app')
}

export { exitApp }
