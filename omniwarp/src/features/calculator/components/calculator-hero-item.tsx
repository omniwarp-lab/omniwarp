import { CommandItem as CommandItemPrimitive } from 'cmdk'
import type { PaletteItem } from '@/features/command-palette/types'
import { handleSelect } from '@/features/command-palette/handlers'
import { CommandIconRenderer } from '@/features/command-palette/components/icon-renderer'
import { KatexRenderer } from './katex-renderer'

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
      className='group group/item flex cursor-pointer items-center gap-3 rounded-md px-3 py-3 text-sm outline-none select-none aria-selected:bg-accent aria-selected:text-accent-foreground'
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
      <CommandIconRenderer icon={item.icon} />

      <span className='flex min-w-0 flex-1 flex-col justify-center gap-0.5 antialiased'>
        {item.expression && (
          <KatexRenderer
            expression={item.expression}
            className='truncate text-xs font-normal text-muted-foreground leading-none'
          />
        )}
        <span className='truncate text-lg font-semibold tracking-tight leading-tight'>
          {item.label}
        </span>
      </span>
    </CommandItemPrimitive>
  )
}

export { CalculatorHeroItem }
export type { CalculatorHeroItemProps }
