import { LazyStore } from '@tauri-apps/plugin-store'
import { LanguageCode, LogCleanupOption } from '@/features/settings/types'
import { DEFAULT_LANGUAGE, isLanguageCode } from '@/features/settings/languages'

const SETTINGS_STORE_FILE = 'settings.json'
const LANGUAGE_STORAGE_KEY = 'language'
const LOG_CLEANUP_STORAGE_KEY = 'logCleanup'

const DEFAULT_LOG_CLEANUP: LogCleanupOption = '7days'

function isLogCleanupOption(value: unknown): value is LogCleanupOption {
  return value === '7days' || value === '30days' || value === 'never'
}

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
    const stored = await settingsStore.get<string>(LOG_CLEANUP_STORAGE_KEY)
    return isLogCleanupOption(stored) ? stored : DEFAULT_LOG_CLEANUP
  } catch {
    return DEFAULT_LOG_CLEANUP
  }
}

async function storeLogCleanup(option: LogCleanupOption): Promise<void> {
  await settingsStore.set(LOG_CLEANUP_STORAGE_KEY, option)
}

function onStoredLogCleanupChange(
  callback: (option: LogCleanupOption) => void,
): Promise<() => void> {
  return settingsStore.onKeyChange<string>(LOG_CLEANUP_STORAGE_KEY, (value) => {
    if (isLogCleanupOption(value)) {
      callback(value)
    }
  })
}

export {
  settingsStore,
  DEFAULT_LOG_CLEANUP,
  isLogCleanupOption,
  getStoredLanguage,
  storeLanguage,
  onStoredLanguageChange,
  getStoredLogCleanup,
  storeLogCleanup,
  onStoredLogCleanupChange,
}
