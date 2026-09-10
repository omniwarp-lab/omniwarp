import { PowerIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { SettingRow } from '@/features/settings/components/setting-row'
import { isAutostartEnabled, setAutostart } from '@/features/settings/autostart'

function AutostartSetting() {
  const { t } = useTranslation()
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    isAutostartEnabled()
      .then((val) => {
        if (active) {
          setEnabled(val)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleCheckedChange = async (checked: boolean) => {
    setEnabled(checked)
    try {
      await setAutostart(checked)
    } catch {
      setEnabled(!checked)
    }
  }

  return (
    <SettingRow
      icon={PowerIcon}
      title={t('settings.autostart')}
      description={t('settings.autostartDescription')}
      control={
        <Switch
          disabled={loading}
          checked={enabled}
          onCheckedChange={handleCheckedChange}
        />
      }
    />
  )
}

export { AutostartSetting }
