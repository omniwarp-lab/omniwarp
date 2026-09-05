import * as React from 'react'
import { Switch as SwitchPrimitive } from '@base-ui/react/switch'

import { cn } from '@/lib/utils'

function SwitchThumb({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Thumb>) {
  return (
    <SwitchPrimitive.Thumb
      data-slot='switch-thumb'
      className={cn(
        'pointer-events-none block size-4 rounded-full bg-background ring-0 shadow-xs transition-transform',
        'data-checked:translate-x-4 data-unchecked:translate-x-0',
        'rtl:data-checked:-translate-x-4 rtl:data-unchecked:translate-x-0',
        className,
      )}
      {...props}
    />
  )
}

function Switch({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot='switch'
      className={cn(
        'peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent shadow-xs transition-all outline-none cursor-pointer',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        'disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50',
        'data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80',
        className,
      )}
      {...props}
    >
      {children ?? <SwitchThumb />}
    </SwitchPrimitive.Root>
  )
}

export { Switch, SwitchThumb }
