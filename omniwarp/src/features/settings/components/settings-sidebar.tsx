import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

interface SettingsTab {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
}

interface SettingsSidebarProps {
  tabs: readonly SettingsTab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

function SettingsSidebar({
  tabs,
  activeTab,
  onTabChange,
  className,
}: SettingsSidebarProps) {
  return (
    <aside
      className={cn(
        'flex w-[180px] shrink-0 flex-col gap-1 border-r border-border bg-muted/20 p-2',
        className,
      )}
    >
      <nav className='flex flex-col gap-1' aria-label='Settings'>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type='button'
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all outline-none',
                isActive
                  ? 'bg-muted font-semibold text-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-[0.98]',
                'focus-visible:ring-2 focus-visible:ring-ring/50',
              )}
            >
              <Icon className='size-4 shrink-0' />
              <span className='truncate'>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export { SettingsSidebar }
export type { SettingsTab }
