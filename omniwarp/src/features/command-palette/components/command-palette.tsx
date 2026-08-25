import { Command, CommandList } from 'cmdk'
import {
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/features/command-palette/components'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { useCommandStore } from '@/features/command-palette/store.ts'
import { useState } from 'react'
import { useCommandPaletteSections } from '@/features/command-palette/hooks/useCommandPaletteSections.ts'

function CommandPalette() {
  const [query, setQuery] = useState('')
  const groups = useCommandStore((s) => s.groups)
  const sections = useCommandPaletteSections(groups, query)

  return (
    <Command className='h-full flex flex-col' shouldFilter={false}>
      <CommandInput query={query} setQuery={setQuery} />
      <ScrollArea className='min-h-0 flex-1 p-2'>
        <CommandList>
          {sections.map((section) => (
            <CommandGroup key={section.key} heading={section.heading}>
              {section.items.map((item) => (
                <CommandItem key={item.id} item={item} />
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
