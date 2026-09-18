import { create } from 'zustand/react'
import i18n from '@/i18n'
import { LanguageCode, LogCleanupOption } from '@/features/settings/types'
import { DEFAULT_LANGUAGE } from '@/features/settings/languages'
import {
  DEFAULT_LOG_CLEANUP,
  storeLanguage,
  storeLogCleanup,
} from '@/features/settings/storage'

interface SettingsStore {
  language: LanguageCode
  applyLanguage: (language: LanguageCode) => Promise<void>
  logCleanup: LogCleanupOption
  setLogCleanup: (option: LogCleanupOption) => Promise<void>
}

const useSettingsStore = create<SettingsStore>((set, get) => ({
  language: DEFAULT_LANGUAGE,
  applyLanguage: async (language) => {
    if (get().language === language) return
    const previous = get().language
    set({ language })
    try {
      await storeLanguage(language)
      await i18n.changeLanguage(language)
    } catch {
      set({ language: previous })
    }
  },
  logCleanup: DEFAULT_LOG_CLEANUP,
  setLogCleanup: async (option) => {
    if (get().logCleanup === option) return
    const previous = get().logCleanup
    set({ logCleanup: option })
    try {
      await storeLogCleanup(option)
    } catch {
      set({ logCleanup: previous })
    }
  },
}))

export { useSettingsStore }
