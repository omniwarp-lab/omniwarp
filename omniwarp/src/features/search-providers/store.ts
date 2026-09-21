import { create } from 'zustand/react'
import { settingsStore } from '@/features/settings/storage'
import { BUILT_IN_PROVIDERS, PROVIDER_IDS } from './providers'
import type { SearchProvider, SearchProviderId } from './types'

const CUSTOM_PROVIDERS_KEY = 'searchProviders.custom'
const storageKey = (id: string) => `searchProviders.${id}`

interface SearchProvidersStore {
  providers: SearchProvider[]
  setProviderEnabled: (id: string, enabled: boolean) => Promise<void>
  addProvider: (name: string, url: string) => Promise<SearchProvider>
  removeProvider: (id: string) => Promise<void>
  getProviderUrl: (id: string) => string | undefined
}

const useSearchProvidersStore = create<SearchProvidersStore>((set, get) => ({
  providers: [...BUILT_IN_PROVIDERS],
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
      if (PROVIDER_IDS.includes(id as SearchProviderId)) {
        await settingsStore.set(storageKey(id), enabled)
      } else {
        await settingsStore.set(
          CUSTOM_PROVIDERS_KEY,
          get().providers.filter((p) => p.isCustom),
        )
      }
    } catch {
      set({ providers: prev })
    }
  },
  addProvider: async (name, url) => {
    const newProvider: SearchProvider = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      url: url.trim(),
      enabled: true,
      isCustom: true,
    }
    const next = [...get().providers, newProvider]
    set({ providers: next })
    try {
      await settingsStore.set(
        CUSTOM_PROVIDERS_KEY,
        next.filter((p) => p.isCustom),
      )
    } catch {}
    return newProvider
  },
  removeProvider: async (id) => {
    const next = get().providers.filter((p) => p.id !== id)
    set({ providers: next })
    try {
      await settingsStore.set(
        CUSTOM_PROVIDERS_KEY,
        next.filter((p) => p.isCustom),
      )
    } catch {}
  },
}))

let syncActive = false

async function initSearchProvidersSettingsSync(): Promise<void> {
  if (syncActive) return
  syncActive = true

  for (const id of PROVIDER_IDS) {
    try {
      const stored = await settingsStore.get<boolean>(storageKey(id))
      if (typeof stored === 'boolean') {
        useSearchProvidersStore.setState((s) => ({
          providers: s.providers.map((p) =>
            p.id === id ? { ...p, enabled: stored } : p,
          ),
        }))
      }
    } catch {}
    void settingsStore.onKeyChange<boolean>(storageKey(id), (val) => {
      if (typeof val === 'boolean') {
        useSearchProvidersStore.setState((s) => ({
          providers: s.providers.map((p) =>
            p.id === id ? { ...p, enabled: val } : p,
          ),
        }))
      }
    })
  }

  const syncCustom = (list: SearchProvider[]) => {
    useSearchProvidersStore.setState((s) => {
      const builtIns = s.providers.filter((p) => !p.isCustom)
      const customs = list.map((p) => ({ ...p, isCustom: true }))
      return { providers: [...builtIns, ...customs] }
    })
  }

  try {
    const stored = await settingsStore.get<SearchProvider[]>(
      CUSTOM_PROVIDERS_KEY,
    )
    if (Array.isArray(stored)) syncCustom(stored)
  } catch {}

  void settingsStore.onKeyChange<SearchProvider[]>(
    CUSTOM_PROVIDERS_KEY,
    (val) => {
      if (Array.isArray(val)) syncCustom(val)
    },
  )
}

export { useSearchProvidersStore, initSearchProvidersSettingsSync }
