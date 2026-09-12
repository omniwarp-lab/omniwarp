import { LanguageCode, LanguageOption } from '@/features/settings/types'

const LANGUAGES: readonly LanguageOption[] = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'fa-IR', label: 'فارسی (ایران)' },
]

const DEFAULT_LANGUAGE: LanguageCode = 'en-US'

function isLanguageCode(value: unknown): value is LanguageCode {
  return LANGUAGES.some((language) => language.value === value)
}

export { LANGUAGES, DEFAULT_LANGUAGE, isLanguageCode }
