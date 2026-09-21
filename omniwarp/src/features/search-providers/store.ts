import { create } from 'zustand/react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { BUILT_IN_ICONS } from './providers'
import type { SearchProvider } from './types'

function hydrateIcons(providers: SearchProvider[]): SearchProvider[] {
  return providers.map((p) => ({
    ...p,
    icon: p.icon || BUILT_IN_ICONS[p.id],
  }))
}

interface SearchProvidersStore {
  providers: SearchProvider[]
  setProviderEnabled: (id: string, enabled: boolean) => Promise<void>
  addProvider: (name: string, url: string) => Promise<SearchProvider>
  removeProvider: (id: string) => Promise<void>
  getProviderUrl: (id: string) => string | undefined
}

const useSearchProvidersStore = create<SearchProvidersStore>((set, get) => ({
  providers: [],
  getProviderUrl: (id: string) => {
    return get().providers.find((p) => p.id === id && p.enabled)?.url
  },
  setProviderEnabled: async (id, enabled) => {
    const current = get().providers.find((p) => p.id === id)
    if (!current || current.enabled === enabled) return
    const prev = get().providers
    set((s) => ({
      providers: s.providers.map((p) => (p.id === id ? { ...p, enabled } : p)),
    }))
    try {
      await invoke('set_search_provider_enabled', { id, enabled })
    } catch {
      set({ providers: prev })
    }
  },
  addProvider: async (name, url) => {
    const provider = await invoke<SearchProvider>('add_search_provider', {
      name,
      url,
    })
    set((s) => ({ providers: [...s.providers, provider] }))
    return provider
  },
  removeProvider: async (id) => {
    const target = get().providers.find((p) => p.id === id)
    if (!target || !target.isCustom) return
    const prev = get().providers
    set((s) => ({ providers: s.providers.filter((p) => p.id !== id) }))
    try {
      await invoke('delete_search_provider', { id })
    } catch {
      set({ providers: prev })
    }
  },
}))

let syncActive = false

async function initSearchProvidersSettingsSync(): Promise<void> {
  if (syncActive) return
  syncActive = true

  const loadProviders = async () => {
    try {
      const providers = await invoke<SearchProvider[]>('list_search_providers')
      useSearchProvidersStore.setState({ providers: hydrateIcons(providers) })
    } catch (err) {
      // TODO
    }
  }

  await loadProviders()
  await listen('omniwarp://search-providers-updated', loadProviders)
}

export { useSearchProvidersStore, initSearchProvidersSettingsSync }
