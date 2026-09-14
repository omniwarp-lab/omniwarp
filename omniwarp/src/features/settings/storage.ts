import { LazyStore } from '@tauri-apps/plugin-store'
import { LanguageCode, LogCleanupOption } from '@/features/settings/types'
import { DEFAULT_LANGUAGE, isLanguageCode } from '@/features/settings/languages'

const SETTINGS_STORE_FILE = 'settings.json'
const LANGUAGE_STORAGE_KEY = 'language'
const LOG_CLEANUP_STORAGE_KEY = 'logCleanup'

const settingsStore = new LazyStore(SETTINGS_STORE_FILE, { autoSave: true })

async function getStoredLanguage(): Promise<LanguageCode> {
  try {
    const stored = await settingsStore.get<string>(LANGUAGE_STORAGE_KEY)
    return isLanguageCode(stored) ? stored : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

async function storeLanguage(language: LanguageCode): Promise<void> {
  await settingsStore.set(LANGUAGE_STORAGE_KEY, language)
}

function onStoredLanguageChange(
  callback: (language: LanguageCode) => void,
): Promise<() => void> {
  return settingsStore.onKeyChange<string>(LANGUAGE_STORAGE_KEY, (value) => {
    if (isLanguageCode(value)) {
      callback(value)
    }
  })
}

async function getStoredLogCleanup(): Promise<LogCleanupOption> {
  try {
    const stored = await settingsStore.get<LogCleanupOption>(LOG_CLEANUP_STORAGE_KEY)
    return stored === '30days' || stored === 'never' ? stored : '7days'
  } catch {
    return '7days'
  }
}

async function storeLogCleanup(option: LogCleanupOption): Promise<void> {
  await settingsStore.set(LOG_CLEANUP_STORAGE_KEY, option)
}

export {
  settingsStore,
  getStoredLanguage,
  storeLanguage,
  onStoredLanguageChange,
  getStoredLogCleanup,
  storeLogCleanup,
}
