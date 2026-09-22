import { invoke } from '@tauri-apps/api/core'
import type { SearchProvider, IconPreview } from './types'

function searchWeb(url: string): Promise<void> {
  return invoke('search_web', { url })
}

function fetchWebsiteTitle(url: string): Promise<string | null> {
  return invoke<string | null>('fetch_website_title', { url })
}

function listSearchProviders(): Promise<SearchProvider[]> {
  return invoke<SearchProvider[]>('list_search_providers')
}

function setSearchProviderEnabled(id: string, enabled: boolean): Promise<void> {
  return invoke('set_search_provider_enabled', { id, enabled })
}

function addSearchProvider(name: string, url: string): Promise<SearchProvider> {
  return invoke<SearchProvider>('add_search_provider', { name, url })
}

function updateSearchProvider(
  id: string,
  name: string,
  url: string,
): Promise<SearchProvider> {
  return invoke<SearchProvider>('update_search_provider', { id, name, url })
}

function deleteSearchProvider(id: string): Promise<void> {
  return invoke('delete_search_provider', { id })
}

function previewSearchProviderIcon(url: string): Promise<IconPreview | null> {
  return invoke<IconPreview | null>('preview_search_provider_icon', { url })
}

export {
  searchWeb,
  fetchWebsiteTitle,
  previewSearchProviderIcon,
  listSearchProviders,
  setSearchProviderEnabled,
  addSearchProvider,
  updateSearchProvider,
  deleteSearchProvider,
}
