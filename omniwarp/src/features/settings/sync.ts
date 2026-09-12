import { listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import i18n from '@/i18n'
import { syncTrayLabels } from '@/features/tray/commands'
import { LanguageCode } from '@/features/settings/types'
import { isLanguageCode } from '@/features/settings/languages'
import { getStoredLanguage } from '@/features/settings/storage'
import { useSettingsStore } from '@/features/settings/store'
import {
  LANGUAGE_CHANGED_EVENT,
  LanguageChangedPayload,
} from '@/features/settings/events'

let syncActive = false

function applyRemoteLanguage(language: LanguageCode): void {
  if (useSettingsStore.getState().language === language) return
  useSettingsStore.setState({ language })
  void i18n.changeLanguage(language)
  void syncTrayLabels()
}

async function initLanguageSync(): Promise<() => void> {
  if (syncActive) {
    console.warn('initLanguageSync: already active, ignoring duplicate init')
    return () => {}
  }
  syncActive = true

  const initialLanguage = await getStoredLanguage()
  applyRemoteLanguage(initialLanguage)

  const unlistenFocus = await getCurrentWindow().onFocusChanged(
    async ({ payload: focused }) => {
      if (!focused) return
      const stored = await getStoredLanguage()
      applyRemoteLanguage(stored)
    },
  )

  const unlistenEvent = await listen<LanguageChangedPayload>(
    LANGUAGE_CHANGED_EVENT,
    (event) => {
      const { language } = event.payload
      if (!isLanguageCode(language)) return
      applyRemoteLanguage(language)
    },
  )

  return () => {
    unlistenFocus()
    unlistenEvent()
    syncActive = false
  }
}

export { initLanguageSync }
