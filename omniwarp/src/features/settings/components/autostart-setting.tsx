import { PowerIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'
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
    <div className='flex items-center gap-3 rounded-lg p-2 transition-colors'>
      <PowerIcon className='size-5 text-white' />

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium leading-tight'>
          {t('settings.autostart')}
        </p>
        <bdi className='mt-1 truncate text-xs leading-tight text-muted-foreground'>
          {t('settings.autostartDescription')}
        </bdi>
      </div>

      <Switch
        disabled={loading}
        checked={enabled}
        onCheckedChange={handleCheckedChange}
      />
    </div>
  )
}

export { AutostartSetting }
