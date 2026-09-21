import { create } from 'zustand/react'
import { settingsStore } from '@/features/settings/storage'
import type { SearchProviderId } from './types'

const PROVIDER_IDS: readonly SearchProviderId[] = ['google', 'duckduckgo']
const storageKey = (id: SearchProviderId) => `searchProviders.${id}`

interface SearchProvidersStore {
  providers: Record<SearchProviderId, boolean>
  setProviderEnabled: (id: SearchProviderId, enabled: boolean) => Promise<void>
}

const useSearchProvidersStore = create<SearchProvidersStore>((set, get) => ({
  providers: { google: true, duckduckgo: true },
  setProviderEnabled: async (id, enabled) => {
    if (get().providers[id] === enabled) return
    const prev = get().providers[id]
    set((s) => ({ providers: { ...s.providers, [id]: enabled } }))
    try {
      await settingsStore.set(storageKey(id), enabled)
    } catch {
      set((s) => ({ providers: { ...s.providers, [id]: prev } }))
    }
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
          providers: { ...s.providers, [id]: stored },
        }))
      }
    } catch {}
    void settingsStore.onKeyChange<boolean>(storageKey(id), (val) => {
      if (typeof val === 'boolean') {
        useSearchProvidersStore.setState((s) => ({
          providers: { ...s.providers, [id]: val },
        }))
      }
    })
  }
}

export { useSearchProvidersStore, initSearchProvidersSettingsSync }
