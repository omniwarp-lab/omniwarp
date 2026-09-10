import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useEffect, useState } from 'react'
import { MinusIcon, XIcon } from 'lucide-react'
import { getVersion } from '@tauri-apps/api/app'
import { LanguageSetting } from '@/features/settings/components/language-setting'
import { AutostartSetting } from '@/features/settings/components/autostart-setting'

function SettingsComponent() {
  const { t } = useTranslation()
  const appWindow = getCurrentWindow()
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    getVersion()
      .then((v) => {
        if (active) setVersion(v)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  function handleMinimize(): void {
    void appWindow.minimize()
  }

  function handleClose(): void {
    void appWindow.close()
  }

  return (
    <main
      dir='ltr'
      className='flex h-screen flex-col overflow-hidden bg-background'
    >
      <header
        data-tauri-drag-region
        className='flex h-12 shrink-0 items-center gap-2 border-b border-border px-3'
      >
        <h1
          data-tauri-drag-region
          className='min-w-0 flex-1 cursor-default truncate text-[13px] font-semibold tracking-normal'
        >
          {t('omniwarp.settings')}
        </h1>

        <div className='flex shrink-0 items-center gap-1'>
          <button
            type='button'
            onClick={handleMinimize}
            title={t('settings.minimize')}
            aria-label={t('settings.minimize')}
            className='flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95'
          >
            <MinusIcon className='size-4' />
          </button>
          <button
            type='button'
            onClick={handleClose}
            title={t('settings.close')}
            aria-label={t('settings.close')}
            className='flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-all outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95'
          >
            <XIcon className='size-4' />
          </button>
        </div>
      </header>

      <div className='flex-1 p-3'>
        <div className='divide-y divide-border overflow-hidden rounded-xl border border-border bg-card'>
          <LanguageSetting />
          <AutostartSetting />
        </div>
      </div>

      <footer className='flex h-8 shrink-0 items-center justify-between border-t border-border bg-muted/40 px-4 text-xs text-muted-foreground'>
        <span className='font-medium'>OmniWarp</span>
        {version !== null && (
          <span className='tabular-nums'>v{version}</span>
        )}
      </footer>
    </main>
  )
}

const Route = createFileRoute('/settings')({
  component: SettingsComponent,
})

export { Route }
