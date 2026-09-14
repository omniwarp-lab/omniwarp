import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useEffect, useState } from 'react'
import {
  MinusIcon,
  ScrollTextIcon,
  SlidersHorizontalIcon,
  XIcon,
} from 'lucide-react'
import { getVersion } from '@tauri-apps/api/app'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { GeneralSection } from '@/features/settings/components/general-section'
import { LogsSection } from '@/features/settings/components/logs-section'

const SECTIONS = [
  {
    id: 'general',
    titleKey: 'settings.sections.general',
    icon: SlidersHorizontalIcon,
    Component: GeneralSection,
  },
  {
    id: 'logs',
    titleKey: 'settings.sections.logs',
    icon: ScrollTextIcon,
    Component: LogsSection,
  },
] as const

function SettingsComponent() {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()
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

  useEffect(() => {
    let cancelled = false

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return
        const window = getCurrentWindow()
        void window.show().then(() => window.setFocus())
      })
    })

    return () => {
      cancelled = true
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
      dir={dir}
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

      <Tabs
        orientation='vertical'
        defaultValue='general'
        className='flex flex-1 flex-row overflow-hidden'
      >
        <aside className='flex w-45 shrink-0 flex-col border-e border-border bg-muted/20 p-2'>
          <TabsList className='flex w-full flex-col items-stretch gap-1'>
            {SECTIONS.map(({ id, titleKey, icon: Icon }) => (
              <TabsTab key={id} value={id} className='w-full'>
                <Icon className='size-4 shrink-0' />
                <span className='truncate'>{t(titleKey)}</span>
              </TabsTab>
            ))}
          </TabsList>
        </aside>

        <div className='w-130 flex-1 overflow-y-auto p-3'>
          {SECTIONS.map(({ id, Component }) => (
            <TabsPanel key={id} value={id}>
              <Component />
            </TabsPanel>
          ))}
        </div>
      </Tabs>

      <footer
        dir='ltr'
        className='flex h-8 shrink-0 items-center justify-between border-t border-border bg-muted/40 px-4 text-xs text-muted-foreground'
      >
        <span className='font-medium'>OmniWarp</span>
        {version !== null && <span className='tabular-nums'>v{version}</span>}
      </footer>
    </main>
  )
}

const Route = createFileRoute('/settings')({
  component: SettingsComponent,
})

export { Route }
