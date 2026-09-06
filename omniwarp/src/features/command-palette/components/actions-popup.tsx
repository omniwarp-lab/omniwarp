import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowUpDown,
  Copy,
  CornerDownLeft,
  Folder,
  Search,
  Shield,
  XCircleIcon,
} from 'lucide-react'
import { PaletteItem } from '@/features/command-palette/types'
import { Kbd } from '@/components/ui/kbd'
import { handleSelect } from '@/features/command-palette/handlers'
import { CommandIconRenderer } from '@/features/command-palette/components/icon-renderer'
import { cn } from '@/lib/utils'
import {
  closeApp,
  copyAppTargetPath,
  launchApp,
  openAppInExplorer,
} from '@/features/apps/commands'

interface ActionsPopupProps {
  item: PaletteItem
  onClose: () => void
}

interface ActionEntry {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  execute: () => Promise<void> | void
}

function ActionsPopup({ item, onClose }: ActionsPopupProps) {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const isAppItem = Boolean(item.id.startsWith('app:'))

  const actions: ActionEntry[] = useMemo(() => {
    const list: ActionEntry[] = [
      {
        id: 'open',
        label: t('commandPalette.actions.open'),
        icon: CornerDownLeft,
        execute: async () => {
          onClose()
          await handleSelect(item.id)
        },
      },
    ]

    if (isAppItem) {
      list.push({
        id: 'run-as-admin',
        label: t('commandPalette.actions.runAsAdmin'),
        icon: Shield,
        execute: async () => {
          onClose()
          const rawId = item.id.slice(4)
          await launchApp(rawId, true)
        },
      })

      if (item.canOpenInExplorer) {
        list.push(
          {
            id: 'show-in-explorer',
            label: t('commandPalette.actions.showInExplorer'),
            icon: Folder,
            execute: async () => {
              onClose()
              const rawId = item.id.slice(4)
              await openAppInExplorer(rawId)
            },
          },
          {
            id: 'copy-path',
            label: t('commandPalette.actions.copyPath'),
            icon: Copy,
            execute: async () => {
              onClose()
              const rawId = item.id.slice(4)
              await copyAppTargetPath(rawId)
            },
          },
        )
      }

      if (item.isRunning) {
        list.push({
          id: 'close-app',
          label: t('commandPalette.actions.close'),
          icon: XCircleIcon,
          execute: async () => {
            onClose()
            const rawId = item.id.slice(4)
            await closeApp(rawId)
          },
        })
      }
    }

    return list
  }, [item, isAppItem, t, onClose])

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return actions
    return actions.filter((a) => a.label.toLowerCase().includes(q))
  }, [actions, query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (filteredActions.length > 0) {
        setActiveIndex((prev) => (prev + 1) % filteredActions.length)
      }
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (filteredActions.length > 0) {
        setActiveIndex((prev) =>
          prev === 0 ? filteredActions.length - 1 : prev - 1,
        )
      }
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredActions[activeIndex]) {
        void filteredActions[activeIndex].execute()
      }
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      if (query) {
        setQuery('')
      } else {
        onClose()
      }
      return
    }

    if (e.altKey && (e.key.toLowerCase() === 'a' || e.code === 'KeyA')) {
      e.preventDefault()
      onClose()
      return
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Subtle backdrop scrim to dismiss */}
      <div
        className='fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in-0 duration-150'
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault()
          onClose()
        }}
      />

      {/* Centered Modal Card */}
      <div
        data-slot='actions-popup'
        className='animate-in fade-in-0 zoom-in-95 duration-150 relative z-10 flex w-88 max-w-[90vw] flex-col overflow-hidden rounded-2xl border border-border/80 bg-popover/95 text-popover-foreground shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl outline-none select-none'
      >
        {/* Selected Item Header */}
        <div className='flex items-center gap-3 px-4 pt-3.5 pb-3 border-b border-border/50'>
          <div className='flex size-7 shrink-0 items-center justify-center'>
            <CommandIconRenderer
              icon={item.icon}
              config={item.subgroupConfig}
              isRunning={item.isRunning}
            />
          </div>
          <div className='flex min-w-0 flex-1 flex-col justify-center'>
            <span className='truncate text-xs font-semibold leading-tight text-foreground'>
              {item.label}
            </span>
            {item.subgroup && (
              <span className='truncate text-[10px] text-muted-foreground leading-tight'>
                {item.subgroup}
              </span>
            )}
          </div>
          <span className='shrink-0 rounded-full border border-border/60 bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground'>
            {t('commandPalette.actions.heading')}
          </span>
        </div>

        {/* Action Search Input */}
        <div className='px-3 pt-2.5 pb-1.5'>
          <div className='flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs transition-colors focus-within:border-border focus-within:bg-muted/70'>
            <Search className='size-3.5 shrink-0 text-muted-foreground' />
            <input
              ref={inputRef}
              type='text'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('commandPalette.actions.placeholder')}
              className='h-5 w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/70'
            />
          </div>
        </div>

        {/* Actions List */}
        <div className='flex max-h-60 flex-col gap-0.5 p-2 overflow-y-auto'>
          {filteredActions.length === 0 ? (
            <div className='py-6 text-center text-xs text-muted-foreground'>
              {t('commandPalette.actions.noResults')}
            </div>
          ) : (
            filteredActions.map((action, index) => {
              const Icon = action.icon
              const isSelected = index === activeIndex

              return (
                <button
                  key={action.id}
                  type='button'
                  onClick={() => void action.execute()}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    'group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-xs transition-colors outline-none select-none',
                    isSelected
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-foreground hover:bg-accent/40',
                  )}
                >
                  <div className='flex min-w-0 items-center gap-2.5'>
                    <div
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-md transition-colors',
                        isSelected
                          ? 'text-accent-foreground'
                          : 'text-muted-foreground group-hover:text-foreground',
                      )}
                    >
                      <Icon className='size-3.5' />
                    </div>
                    <span className='truncate'>{action.label}</span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Micro Footer Hints: Back on the left (physical left), Run & Navigate on the right (physical right) */}
        <div className='flex items-center justify-between border-t border-border/50 bg-muted/20 px-3.5 py-2 text-xs text-muted-foreground'>
          {/* Left side: Back */}
          <span dir={dir} className='inline-flex items-center gap-1.5'>
            <Kbd dir='ltr'>Esc</Kbd>
            <span>{t('commandPalette.hints.back')}</span>
          </span>

          {/* Right side: Navigate & Run */}
          <div className='flex items-center gap-2.5'>
            <span dir={dir} className='inline-flex items-center gap-1.5'>
              <Kbd dir='ltr'>
                <ArrowUpDown className='size-4' />
              </Kbd>
              <span>{t('commandPalette.hints.navigate')}</span>
            </span>
            <span dir={dir} className='inline-flex items-center gap-1.5'>
              <Kbd dir='ltr'>
                <CornerDownLeft className='size-4' />
              </Kbd>
              <span>{t('commandPalette.hints.run')}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export { ActionsPopup }
