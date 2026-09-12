import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exitApp } from '@/features/tray/commands'
import { openSettings } from '@/features/settings/commands'

function TrayMenu() {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        e.preventDefault()
      }
      if (e.key === 'Escape') {
        void getCurrentWindow().hide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function handleOpenSettings() {
    await getCurrentWindow().hide()
    await openSettings()
  }

  async function handleQuit() {
    await exitApp()
  }

  return (
    <div
      data-slot='tray-window'
      dir={i18n.dir()}
      className='flex h-full w-full flex-col bg-card p-1 text-card-foreground select-none font-sans'
    >
      <div className='flex flex-col'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          tabIndex={-1}
          onClick={handleOpenSettings}
          className='h-8 w-full justify-start gap-2.5 px-2.5 text-[13px] font-medium text-foreground'
        >
          <Settings className='size-4 shrink-0 text-muted-foreground transition-colors group-hover/button:text-foreground' />
          <span className='min-w-0 flex-1 truncate text-start'>{t('tray.settings')}</span>
        </Button>
      </div>

      <div className='my-1 h-px w-full bg-border' />

      <div className='flex flex-col'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          tabIndex={-1}
          onClick={handleQuit}
          className='h-8 w-full justify-start gap-2.5 px-2.5 text-[13px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
        >
          <LogOut className='size-4 shrink-0 text-muted-foreground transition-colors group-hover/button:text-destructive' />
          <span className='min-w-0 flex-1 truncate text-start'>{t('tray.quit')}</span>
        </Button>
      </div>
    </div>
  )
}

export { TrayMenu }
