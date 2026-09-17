import { invoke } from '@tauri-apps/api/core'

function copyText(text: string): Promise<void> {
  return invoke('copy_text', { text })
}

export { copyText }
