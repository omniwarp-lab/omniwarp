import { Command, CommandList } from 'cmdk'
import {
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/features/command-palette/components'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { useCommandStore } from '@/features/command-palette/store.ts'

function CommandPalette() {
  const groups = useCommandStore((s) => s.groups)

  return (
    <Command className='h-full flex flex-col'>
      <CommandInput />
      <ScrollArea className='min-h-0 flex-1 p-2'>
        <CommandList>
          {groups.map((group) => (
            <CommandGroup key={group.key} heading={group.key}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.id}
                  item={item}
                  fallbackIcon={group.subgroupFallbackIcons[item.subgroup]}
                />
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </ScrollArea>
      <CommandFooter />
    </Command>
  )
}
export { CommandPalette }
