import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useEffect, useState } from 'react'
import {
  CalculatorIcon,
  DraftingCompassIcon,
  EqualIcon,
  FolderIcon,
  FolderOpenIcon,
  GlobeIcon,
  HashIcon,
  LanguagesIcon,
  MinusIcon,
  PowerIcon,
  ScrollTextIcon,
  SlidersHorizontalIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'
import { getVersion } from '@tauri-apps/api/app'
import {
  SettingsList,
  SettingsSidebar,
  type SettingItemConfig,
  type SettingsTab,
} from '@/features/settings/components'
import { useSettingsStore } from '@/features/settings/store'
import { isLanguageCode, LANGUAGES } from '@/features/settings/languages'
import { isLogCleanupOption } from '@/features/settings/storage'
import { useAutostart } from '@/features/settings/hooks/useAutostart'
import { openLogsDir } from '@/features/settings/commands'
import { showAppError } from '@/features/hud/errors'
import {
  isActivationMode,
  isAngleUnit,
  useCalculatorSettingsStore,
} from '@/features/calculator/store'
import { SearchProvidersTable } from '@/features/search-providers/components/search-providers-table'

function SettingsComponent() {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()
  const appWindow = getCurrentWindow()
  const [version, setVersion] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  const language = useSettingsStore((s) => s.language)
  const applyLanguage = useSettingsStore((s) => s.applyLanguage)
  const logCleanup = useSettingsStore((s) => s.logCleanup)
  const setLogCleanup = useSettingsStore((s) => s.setLogCleanup)
  const autostart = useAutostart()
  const enabled = useCalculatorSettingsStore((s) => s.enabled)
  const setEnabled = useCalculatorSettingsStore((s) => s.setEnabled)
  const activationMode = useCalculatorSettingsStore((s) => s.activationMode)
  const setActivationMode = useCalculatorSettingsStore(
    (s) => s.setActivationMode,
  )
  const thousandSeparator = useCalculatorSettingsStore(
    (s) => s.thousandSeparator,
  )
  const setThousandSeparator = useCalculatorSettingsStore(
    (s) => s.setThousandSeparator,
  )
  const angleUnit = useCalculatorSettingsStore((s) => s.angleUnit)
  const setAngleUnit = useCalculatorSettingsStore((s) => s.setAngleUnit)

  const tabs: readonly SettingsTab[] = [
    {
      id: 'general',
      label: t('settings.general'),
      icon: SlidersHorizontalIcon,
    },
    {
      id: 'calculator',
      label: t('settings.calculator'),
      icon: CalculatorIcon,
    },
    {
      id: 'searchProviders',
      label: t('settings.searchProviders'),
      icon: GlobeIcon,
    },
    {
      id: 'logs',
      label: t('settings.logs'),
      icon: ScrollTextIcon,
    },
  ]

  const generalSettings: SettingItemConfig[] = [
    {
      id: 'language',
      icon: LanguagesIcon,
      title: t('settings.language'),
      description: t('settings.languageDescription'),
      type: 'select',
      value: language,
      options: LANGUAGES,
      onChange: (value) => {
        if (isLanguageCode(value)) void applyLanguage(value)
      },
    },
    {
      id: 'autostart',
      icon: PowerIcon,
      title: t('settings.autostart'),
      description: t('settings.autostartDescription'),
      type: 'switch',
      checked: autostart.enabled,
      disabled: autostart.loading,
      onChange: autostart.toggle,
    },
  ]

  const activationModes = [
    { value: 'auto', label: t('settings.activationModes.auto') },
    {
      value: 'requireEquals',
      label: t('settings.activationModes.requireEquals'),
    },
  ] as const

  const angleUnits = [
    { value: 'rad', label: t('settings.angleUnits.rad') },
    { value: 'deg', label: t('settings.angleUnits.deg') },
  ] as const

  const calculatorSettings: SettingItemConfig[] = [
    {
      id: 'enabled',
      icon: CalculatorIcon,
      title: t('settings.enableCalculator'),
      description: t('settings.enableCalculatorDescription'),
      type: 'switch',
      checked: enabled,
      onChange: (checked) => void setEnabled(checked),
    },
    {
      id: 'activationMode',
      icon: EqualIcon,
      title: t('settings.activationMode'),
      description: t('settings.activationModeDescription'),
      type: 'select',
      value: activationMode,
      options: activationModes,
      disabled: !enabled,
      onChange: (value) => {
        if (isActivationMode(value)) void setActivationMode(value)
      },
    },
    {
      id: 'thousandsSeparator',
      icon: HashIcon,
      title: t('settings.thousandsSeparator'),
      description: t('settings.thousandsSeparatorDescription'),
      type: 'switch',
      checked: thousandSeparator,
      disabled: !enabled,
      onChange: (checked) => void setThousandSeparator(checked),
    },
    {
      id: 'angleUnit',
      icon: DraftingCompassIcon,
      title: t('settings.angleUnit'),
      description: t('settings.angleUnitDescription'),
      type: 'select',
      value: angleUnit,
      options: angleUnits,
      disabled: !enabled,
      onChange: (value) => {
        if (isAngleUnit(value)) void setAngleUnit(value)
      },
    },
  ]

  const cleanupOptions = [
    { value: '7days', label: t('settings.cleanupOptions.7days') },
    { value: '30days', label: t('settings.cleanupOptions.30days') },
    { value: 'never', label: t('settings.cleanupOptions.never') },
  ] as const

  const logsSettings: SettingItemConfig[] = [
    {
      id: 'openDir',
      icon: FolderIcon,
      title: t('settings.openDir'),
      description: t('settings.openDirDescription'),
      type: 'button',
      buttonIcon: FolderOpenIcon,
      ariaLabel: t('settings.open'),
      onClick: () => {
        openLogsDir().catch((err) => {
          void showAppError(err)
        })
      },
    },
    {
      id: 'cleanup',
      icon: Trash2Icon,
      title: t('settings.cleanup'),
      description: t('settings.cleanupDescription'),
      type: 'select',
      value: logCleanup,
      options: cleanupOptions,
      onChange: (value) => {
        if (isLogCleanupOption(value)) void setLogCleanup(value)
      },
    },
  ]

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

      <div dir={dir} className='flex flex-1 overflow-hidden'>
        <SettingsSidebar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className='flex-1 overflow-y-auto p-3'>
          {activeTab === 'general' && <SettingsList items={generalSettings} />}
          {activeTab === 'calculator' && (
            <SettingsList items={calculatorSettings} />
          )}
          {activeTab === 'searchProviders' && <SearchProvidersTable />}
          {activeTab === 'logs' && <SettingsList items={logsSettings} />}
        </div>
      </div>

      <footer className='flex h-8 shrink-0 items-center justify-between border-t border-border bg-muted/40 px-4 text-xs text-muted-foreground'>
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
