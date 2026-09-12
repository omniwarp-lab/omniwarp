import { create } from 'zustand/react'
import i18n from '@/i18n'
import { LanguageCode } from '@/features/settings/types'
import { DEFAULT_LANGUAGE } from '@/features/settings/languages'
import { storeLanguage } from '@/features/settings/storage'

interface SettingsStore {
  language: LanguageCode
  applyLanguage: (language: LanguageCode) => Promise<void>
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
}))

export { useSettingsStore }
