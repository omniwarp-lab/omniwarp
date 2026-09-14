import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguagesIcon, PowerIcon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { SettingRow } from '@/features/settings/components/setting-row'
import { SettingSelect } from '@/features/settings/components/setting-select'
import { useSettingsStore } from '@/features/settings/store'
import { isLanguageCode, LANGUAGES } from '@/features/settings/languages'
import { isAutostartEnabled, setAutostart } from '@/features/settings/autostart'

function GeneralSection() {
  const { t } = useTranslation()
  const language = useSettingsStore((s) => s.language)
  const applyLanguage = useSettingsStore((s) => s.applyLanguage)

  const [autostart, setAutostartState] = useState(false)
  const [autostartLoading, setAutostartLoading] = useState(true)

  useEffect(() => {
    let active = true
    isAutostartEnabled()
      .then((val) => {
        if (active) {
          setAutostartState(val)
          setAutostartLoading(false)
        }
      })
      .catch(() => {
        if (active) setAutostartLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleAutostartChange = async (checked: boolean) => {
    setAutostartState(checked)
    try {
      await setAutostart(checked)
    } catch {
      setAutostartState(!checked)
    }
  }

  return (
    <div className='divide-y divide-border overflow-hidden rounded-xl border border-border bg-card'>
      <SettingRow
        icon={LanguagesIcon}
        title={t('settings.language')}
        description={t('settings.languageDescription')}
        control={
          <SettingSelect
            value={language}
            options={LANGUAGES}
            onValueChange={(val) => {
              if (isLanguageCode(val)) void applyLanguage(val)
            }}
          />
        }
      />
      <SettingRow
        icon={PowerIcon}
        title={t('settings.autostart')}
        description={t('settings.autostartDescription')}
        control={
          <Switch
            disabled={autostartLoading}
            checked={autostart}
            onCheckedChange={handleAutostartChange}
          />
        }
      />
    </div>
  )
}

export { GeneralSection }
