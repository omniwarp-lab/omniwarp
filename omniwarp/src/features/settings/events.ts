const LANGUAGE_CHANGED_EVENT = 'omniwarp://language-changed'

interface LanguageChangedPayload {
  language: unknown
}

export { LANGUAGE_CHANGED_EVENT }
export type { LanguageChangedPayload }
