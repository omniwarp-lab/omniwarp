type LanguageCode = 'en-US' | 'fa-IR'

interface LanguageOption {
  value: LanguageCode
  label: string
}

type LogCleanupOption = '7days' | '30days' | 'never'

export type { LanguageCode, LanguageOption, LogCleanupOption }
