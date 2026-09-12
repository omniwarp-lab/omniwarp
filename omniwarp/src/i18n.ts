import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from './locales/en-US.json'
import faIR from './locales/fa-IR.json'
import { DEFAULT_LANGUAGE } from '@/features/settings/languages'

i18n.use(initReactI18next).init({
  resources: {
    'en-US': {
      translation: enUS,
    },
    'fa-IR': {
      translation: faIR,
    },
  },

  lng: DEFAULT_LANGUAGE,
  fallbackLng: 'en-US',

  interpolation: {
    escapeValue: false,
  },
})

export default i18n
