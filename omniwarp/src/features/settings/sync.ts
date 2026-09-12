import i18n from '@/i18n'
import { LanguageCode } from '@/features/settings/types'
import {
  getStoredLanguage,
  onStoredLanguageChange,
} from '@/features/settings/storage'
import { useSettingsStore } from '@/features/settings/store'

let syncActive = false

function applyRemoteLanguage(language: LanguageCode): void {
  if (useSettingsStore.getState().language === language) return
  useSettingsStore.setState({ language })
  void i18n.changeLanguage(language)
}

async function initLanguageSync(): Promise<() => void> {
  if (syncActive) {
    return () => {}
  }
  syncActive = true

  const initialLanguage = await getStoredLanguage()
  applyRemoteLanguage(initialLanguage)

  const unlisten = await onStoredLanguageChange((language) => {
    applyRemoteLanguage(language)
  })

  return () => {
    unlisten()
    syncActive = false
  }
}

export { initLanguageSync }
