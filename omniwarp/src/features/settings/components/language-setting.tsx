import { LanguagesIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSettingsStore } from '@/features/settings/store'
import { isLanguageCode, LANGUAGES } from '@/features/settings/languages'

function LanguageSetting() {
  const { t } = useTranslation()
  const language = useSettingsStore((s) => s.language)
  const applyLanguage = useSettingsStore((s) => s.applyLanguage)

  return (
    <div className='flex items-center gap-3 rounded-lg p-2 transition-colors'>
      <LanguagesIcon className='size-5 text-white' />

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium leading-tight'>
          {t('settings.language')}
        </p>
        <bdi className='mt-1 truncate text-xs leading-tight text-muted-foreground'>
          {t('settings.languageDescription')}
        </bdi>
      </div>

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
    </div>
  )
}

export { LanguageSetting }
