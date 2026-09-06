import { CommandEmpty as CommandEmptyPrimitive } from 'cmdk'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

function CommandEmpty({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <CommandEmptyPrimitive
      className={cn(
        'py-6 text-center text-sm text-muted-foreground',
        className,
      )}
    >
      {children}
    </CommandEmptyPrimitive>
  )
}

export { CommandEmpty }
