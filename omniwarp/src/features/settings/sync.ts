import i18n from '@/i18n'
import { LanguageCode } from '@/features/settings/types'
import {
  getStoredLanguage,
  getStoredLogCleanup,
  onStoredLanguageChange,
  onStoredLogCleanupChange,
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

  const initialLogCleanup = await getStoredLogCleanup()
  useSettingsStore.setState({ logCleanup: initialLogCleanup })

  const unlistenLanguage = await onStoredLanguageChange((language) => {
    applyRemoteLanguage(language)
  })

  const unlistenLogCleanup = await onStoredLogCleanupChange((option) => {
    useSettingsStore.setState({ logCleanup: option })
  })

  return () => {
    unlistenLanguage()
    unlistenLogCleanup()
    syncActive = false
  }
}

export { initLanguageSync }
