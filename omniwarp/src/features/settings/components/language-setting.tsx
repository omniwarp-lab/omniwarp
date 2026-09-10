import { LanguagesIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SettingRow } from '@/features/settings/components/setting-row'
import { useSettingsStore } from '@/features/settings/store'
import { isLanguageCode, LANGUAGES } from '@/features/settings/languages'

function LanguageSetting() {
  const { t } = useTranslation()
  const language = useSettingsStore((s) => s.language)
  const applyLanguage = useSettingsStore((s) => s.applyLanguage)

  return (
    <SettingRow
      icon={LanguagesIcon}
      title={t('settings.language')}
      description={t('settings.languageDescription')}
      control={
        <Select
          value={language}
          onValueChange={(value) => {
            if (isLanguageCode(value)) void applyLanguage(value)
          }}
        >
          <SelectTrigger className='w-32 shrink-0' size='sm'>
            <SelectValue>
              {(value: unknown) =>
                LANGUAGES.find((option) => option.value === value)?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    />
  )
}

export { LanguageSetting }
