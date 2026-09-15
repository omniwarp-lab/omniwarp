import { invoke } from '@tauri-apps/api/core'

function copyToClipboard(text: string): Promise<void> {
  return invoke('copy_to_clipboard', { text })
}

export { copyToClipboard }
