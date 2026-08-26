import { LanguageCode, LanguageOption } from '@/features/settings/types'

const LANGUAGES: readonly LanguageOption[] = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'fa-IR', label: 'فارسی (ایران)' },
]

const DEFAULT_LANGUAGE: LanguageCode = 'en-US'
const LANGUAGE_STORAGE_KEY = 'omniwarp.language'

function isLanguageCode(value: unknown): value is LanguageCode {
  return LANGUAGES.some((language) => language.value === value)
}

function getStoredLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguageCode(stored) ? stored : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

function storeLanguage(language: LanguageCode): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
}

export {
  LANGUAGES,
  DEFAULT_LANGUAGE,
  isLanguageCode,
  getStoredLanguage,
  storeLanguage,
}
