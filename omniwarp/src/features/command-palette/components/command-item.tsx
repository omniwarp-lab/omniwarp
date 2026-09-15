import { CommandItem as CommandItemPrimitive } from 'cmdk'
import type { PaletteItem } from '@/features/command-palette/types'
import { handleSelect } from '@/features/command-palette/handlers.ts'
import { CommandIconRenderer } from '@/features/command-palette/components/icon-renderer.tsx'
import { CalculatorHeroItem } from '@/features/command-palette/components/calculator-hero-item.tsx'

interface CommandItemProps {
  item: PaletteItem
  onSelect?: (item: PaletteItem) => void
  onContextMenu?: (e: React.MouseEvent, item: PaletteItem) => void
}

function CommandItem({ item, onSelect, onContextMenu }: CommandItemProps) {
  if (item.id.startsWith('calc:')) {
    return (
      <CalculatorHeroItem
        item={item}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
      />
    )
  }

  return (
    <CommandItemPrimitive
      value={item.id}
      className='group group/item flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm outline-none select-none aria-selected:bg-accent aria-selected:text-accent-foreground'
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
      <CommandIconRenderer
        icon={item.icon}
        config={item.subgroupConfig}
        isRunning={item.isRunning}
      />

      <span className='flex min-w-0 flex-1 flex-row justify-between antialiased'>
        <span className='truncate tracking-normal font-medium leading-tight'>
          {item.label}
        </span>
        <span className='truncate tracking-normal font-medium leading-tight text-muted-foreground'>
          {item.subgroup}
        </span>
      </span>
    </CommandItemPrimitive>
  )
}

export { CommandItem }
