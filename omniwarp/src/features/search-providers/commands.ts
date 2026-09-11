import { invoke } from '@tauri-apps/api/core'

function searchWeb(url: string): Promise<void> {
  return invoke('search_web', { url })
}

export { searchWeb }
