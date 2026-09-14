import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SettingRowProps {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
  control?: ReactNode
  className?: string
}

function SettingRow({
  icon: Icon,
  title,
  description,
  control,
  className,
}: SettingRowProps) {
  return (
    <div className={cn('flex items-center gap-3 px-3.5 py-3', className)}>
      <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground'>
        <Icon className='size-4' />
      </span>

      <div className='min-w-0 flex-1'>
        <p className='text-[13px] font-medium leading-snug'>{title}</p>
        <bdi
          title={description}
          className='mt-0.5 block truncate text-xs leading-snug text-muted-foreground'
        >
          {description}
        </bdi>
      </div>

      <div className='shrink-0'>{control}</div>
    </div>
  )
}

export { SettingRow }
