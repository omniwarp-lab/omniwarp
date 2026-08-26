import { create } from 'zustand/react'
import { emit } from '@tauri-apps/api/event'
import i18n from '@/i18n'
import { syncTrayLabels } from '@/features/tray/commands'
import { LanguageCode } from '@/features/settings/types'
import { getStoredLanguage, storeLanguage } from '@/features/settings/languages'
import { LANGUAGE_CHANGED_EVENT } from '@/features/settings/events'

interface SettingsStore {
  language: LanguageCode
  applyLanguage: (language: LanguageCode) => Promise<void>
}

const useSettingsStore = create<SettingsStore>((set, get) => ({
  language: getStoredLanguage(),
  applyLanguage: async (language) => {
    if (get().language === language) return
    const previous = get().language
    set({ language })
    try {
      storeLanguage(language)
      await i18n.changeLanguage(language)
      await syncTrayLabels()
      await emit(LANGUAGE_CHANGED_EVENT, { language })
    } catch (err) {
      set({ language: previous })
    }
  },
}))

export { useSettingsStore }
