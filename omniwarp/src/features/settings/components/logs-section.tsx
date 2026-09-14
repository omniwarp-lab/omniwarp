import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ClockIcon, FolderIcon, FolderOpenIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingRow } from '@/features/settings/components/setting-row'
import { SettingSelect } from '@/features/settings/components/setting-select'
import { openLogsDir } from '@/features/settings/commands'
import { showAppError } from '@/features/hud/errors'
import { getStoredLogCleanup, storeLogCleanup } from '@/features/settings/storage'
import { LogCleanupOption } from '@/features/settings/types'

function LogsSection() {
  const { t } = useTranslation()
  const [logCleanup, setLogCleanup] = useState<LogCleanupOption>('7days')

  useEffect(() => {
    let active = true
    getStoredLogCleanup().then((val) => {
      if (active) setLogCleanup(val)
    })
    return () => {
      active = false
    }
  }, [])

  const cleanupOptions: { value: LogCleanupOption; label: string }[] = [
    { value: '7days', label: t('settings.logs.options.7days') },
    { value: '30days', label: t('settings.logs.options.30days') },
    { value: 'never', label: t('settings.logs.options.never') },
  ]

  const handleOpenDir = async () => {
    try {
      await openLogsDir()
    } catch (err) {
      await showAppError(err)
    }
  }

  const handleCleanupChange = (option: LogCleanupOption) => {
    setLogCleanup(option)
    void storeLogCleanup(option)
  }

  return (
    <div className='divide-y divide-border overflow-hidden rounded-xl border border-border bg-card'>
      <SettingRow
        icon={FolderIcon}
        title={t('settings.logs.openDir')}
        description={t('settings.logs.openDirDescription')}
        control={
          <Button
            variant='outline'
            size='icon-sm'
            title={t('settings.logs.openDirButton')}
            aria-label={t('settings.logs.openDirButton')}
            onClick={handleOpenDir}
          >
            <FolderOpenIcon className='size-4' />
          </Button>
        }
      />
      <SettingRow
        icon={ClockIcon}
        title={t('settings.logs.cleanup')}
        description={t('settings.logs.cleanupDescription')}
        control={
          <SettingSelect
            value={logCleanup}
            options={cleanupOptions}
            onValueChange={handleCleanupChange}
          />
        }
      />
    </div>
  )
}

export { LogsSection }
