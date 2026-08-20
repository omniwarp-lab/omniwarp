import { CommandItem as CommandItemPrimitive } from 'cmdk'
import type {
  CommandIcon,
  CommandItem as CommandItemType,
} from '@/features/command-palette/types'
import { handleSelect } from '@/features/command-palette/handlers.ts'
import { IconRenderer } from '@/features/command-palette/components/icon-renderer.tsx'

function CommandItem({
  item,
  fallbackIcon,
  subgroup,
}: {
  item: CommandItemType
  fallbackIcon: CommandIcon
  subgroup: string
}) {
  return (
    <CommandItemPrimitive
      value={item.id}
      className='group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm outline-none select-none aria-selected:bg-accent aria-selected:text-accent-foreground'
      onSelect={handleSelect}
    >
      <IconRenderer src={item.icon} fallback={fallbackIcon} />

      <span className='flex min-w-0 flex-1 flex-row justify-between antialiased'>
        <span className='truncate tracking-normall font-medium leading-tight'>
          {item.label}
        </span>
        <span className='truncate tracking-normall font-medium leading-tight text-muted-foreground'>
          {subgroup}
        </span>
      </span>
    </CommandItemPrimitive>
  )
}

export { CommandItem }
