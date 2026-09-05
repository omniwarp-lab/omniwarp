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
    <main className='flex h-screen flex-col overflow-hidden bg-background'>
      <header
        data-tauri-drag-region
        className='flex h-11 shrink-0 items-center gap-2.5 border-b border-border pl-3 pr-0'
      >
        <h1
          data-tauri-drag-region
          className='min-w-0 flex-1 cursor-default truncate text-sm font-medium tracking-normal'
        >
          {t('omniwarp.settings')}
        </h1>

        <div className='flex h-full shrink-0 items-center'>
          <button
            type='button'
            onClick={handleMinimize}
            className='flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
          >
            <MinusIcon className='size-4' />
          </button>
          <button
            type='button'
            onClick={handleClose}
            className='flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground'
          >
            <XIcon className='size-4' />
          </button>
        </div>
      </header>

      <div className='flex-1 p-1.5 flex flex-col gap-1'>
        <LanguageSetting />
        <AutostartSetting />
      </div>

      <footer className='flex h-8 shrink-0 items-center justify-between border-t border-border bg-muted/40 px-4 text-xs text-muted-foreground'>
        <span className='font-medium'>OmniWarp</span>
        {version !== null && <span>v{version}</span>}
      </footer>
    </main>
  )
}

const Route = createFileRoute('/settings')({
  component: SettingsComponent,
})

export { Route }
