import { CommandItem as CommandItemPrimitive } from 'cmdk'
import type { PaletteItem } from '@/features/command-palette/types.ts'
import { handleSelect } from '@/features/command-palette/handlers.ts'
import { Calculator } from 'lucide-react'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface CalculatorHeroItemProps {
  item: PaletteItem
  onSelect?: (item: PaletteItem) => void
  onContextMenu?: (e: React.MouseEvent, item: PaletteItem) => void
}

function CalculatorHeroItem({
  item,
  onSelect,
  onContextMenu,
}: CalculatorHeroItemProps) {
  return (
    <CommandItemPrimitive
      value={item.id}
      className='group/hero relative my-1 flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-muted/30 p-3.5 outline-none select-none transition-colors aria-selected:border-border aria-selected:bg-accent aria-selected:text-accent-foreground'
      onSelect={() => {
        if (onSelect) {
          onSelect(item)
        } else {
          void handleSelect(item.id)
        }
      }}
      onContextMenu={
        onContextMenu
          ? (e) => {
              e.preventDefault()
              onContextMenu(e, item)
            }
          : undefined
      }
    >
      <div className='flex items-center justify-between gap-2 text-xs'>
        <span
          dir='ltr'
          className='tracking-wide text-muted-foreground group-aria-selected/hero:text-accent-foreground/70'
        >
          {item.expression && <InlineMath math={item.expression} />}
        </span>
      </div>

      <div className='mt-2.5 flex items-center justify-between gap-4'>
        <span
          dir='ltr'
          className='truncate text-3xl font-semibold tracking-tight text-foreground group-aria-selected/hero:text-accent-foreground'
        >
          {item.label}
        </span>
        <Calculator className='size-5 shrink-0 text-muted-foreground group-aria-selected/hero:text-accent-foreground/70' />
      </div>
    </CommandItemPrimitive>
  )
}

export { CalculatorHeroItem }
