import { invoke } from '@tauri-apps/api/core'

function searchWeb(url: string): Promise<void> {
  return invoke('search_web', { url })
}

function fetchWebsiteTitle(url: string): Promise<string | null> {
  return invoke<string | null>('fetch_website_title', { url })
}

export { searchWeb, fetchWebsiteTitle }

