import { create } from 'zustand/react'
import { listen } from '@tauri-apps/api/event'
import { settingsStore } from '@/features/settings/storage'
import {
  addSearchProvider,
  deleteSearchProvider,
  listSearchProviders,
  reorderSearchProviders,
  setSearchProviderEnabled,
  updateSearchProvider,
} from './commands'
import { SEARCH_PROVIDERS_UPDATED_EVENT } from './events'
import { BUILT_IN_ICONS, providerIconUrl } from './providers'
import type { SearchProvider } from './types'

const ENABLED_KEY = 'searchProviders.enabled'
const DEFAULT_ENABLED = true

function hydrateIcons(providers: SearchProvider[]): SearchProvider[] {
  return providers.map((p) => ({
    ...p,
    icon: !p.isCustom
      ? BUILT_IN_ICONS[p.id]
      : p.hasIcon
        ? providerIconUrl(p)
        : undefined,
  }))
}

interface SearchProvidersStore {
  enabled: boolean
  setEnabled: (enabled: boolean) => Promise<void>
  providers: SearchProvider[]
  setProviderEnabled: (id: string, enabled: boolean) => Promise<void>
  addProvider: (name: string, url: string) => Promise<SearchProvider>
  updateProvider: (id: string, name: string, url: string) => Promise<SearchProvider>
  moveProvider: (id: string, direction: 'up' | 'down') => Promise<void>
  removeProvider: (id: string) => Promise<void>
  getProviderUrl: (id: string) => string | undefined
}

const useSearchProvidersStore = create<SearchProvidersStore>((set, get) => ({
  enabled: DEFAULT_ENABLED,
  setEnabled: async (enabled) => {
    if (get().enabled === enabled) return
    const prev = get().enabled
    set({ enabled })
    try {
      await settingsStore.set(ENABLED_KEY, enabled)
    } catch {
      set({ enabled: prev })
    }
  },
  providers: [],
  getProviderUrl: (id: string) => {
    if (!get().enabled) return undefined
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
      await setSearchProviderEnabled(id, enabled)
    } catch {
      set({ providers: prev })
    }
  },
  addProvider: async (name, url) => {
    const provider = await addSearchProvider(name, url)
    const hydrated = hydrateIcons([provider])[0]
    set((s) => ({ providers: [...s.providers, hydrated] }))
    return hydrated
  },
  updateProvider: async (id, name, url) => {
    const updated = await updateSearchProvider(id, name, url)
    const hydrated = hydrateIcons([updated])[0]
    set((s) => ({
      providers: s.providers.map((p) => (p.id === id ? hydrated : p)),
    }))
    return hydrated
  },
  moveProvider: async (id, direction) => {
    const prev = get().providers
    const index = prev.findIndex((p) => p.id === id)
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (index === -1 || targetIndex < 0 || targetIndex >= prev.length) return

    const list = [...prev]
    const [item] = list.splice(index, 1)
    list.splice(targetIndex, 0, item)

    set({ providers: list })
    try {
      await reorderSearchProviders(list.map((p) => p.id))
    } catch {
      set({ providers: prev })
    }
  },
  removeProvider: async (id) => {
    const target = get().providers.find((p) => p.id === id)
    if (!target || !target.isCustom) return
    const prev = get().providers
    set((s) => ({ providers: s.providers.filter((p) => p.id !== id) }))
    try {
      await deleteSearchProvider(id)
    } catch {
      set({ providers: prev })
    }
  },
}))

let syncActive = false

async function initSearchProvidersSettingsSync(): Promise<() => void> {
  if (syncActive) return () => {}
  syncActive = true

  try {
    const stored = await settingsStore.get<boolean>(ENABLED_KEY)
    if (typeof stored === 'boolean') {
      useSearchProvidersStore.setState({ enabled: stored })
    }
  } catch {}

  const unlistenSettings = await settingsStore.onKeyChange<boolean>(
    ENABLED_KEY,
    (value) => {
      if (typeof value === 'boolean') {
        useSearchProvidersStore.setState({ enabled: value })
      }
    },
  )

  const loadProviders = async () => {
    try {
      const providers = await listSearchProviders()
      useSearchProvidersStore.setState({ providers: hydrateIcons(providers) })
    } catch (err) {
      // TODO
    }
  }

  await loadProviders()
  const unlistenTauri = await listen(SEARCH_PROVIDERS_UPDATED_EVENT, loadProviders)

  return () => {
    unlistenSettings()
    unlistenTauri()
    syncActive = false
  }
}

export { useSearchProvidersStore, initSearchProvidersSettingsSync }
