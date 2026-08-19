import { Command, CommandList } from 'cmdk'
import {
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/features/command-palette/components'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { useCommandStore } from '@/features/command-palette/store.ts'
import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'

function CommandPalette() {
  const [query, setQuery] = useState('')
  const groups = useCommandStore((s) => s.groups)

  const flatItems = useMemo(
    () =>
      groups.flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          fallbackIcon: group.subgroupFallbackIcons[item.subgroup],
        })),
      ),
    [groups],
  )

  const fuse = useMemo(
    () =>
      new Fuse(flatItems, {
        keys: ['label'],
        threshold: 0.2,
        ignoreLocation: true,
      }),
    [flatItems],
  )

  const results = useMemo(() => {
    if (!query.trim()) return null
    return fuse.search(query).map((r) => r.item)
  }, [query, fuse])

  return (
    <Command className='h-full flex flex-col' shouldFilter={false}>
      <CommandInput query={query} setQuery={setQuery} />
      <ScrollArea className='min-h-0 flex-1 p-2'>
        <CommandList>
          {results ? (
            <CommandGroup heading={'results'}>
              {results.map((item) => (
                <CommandItem
                  key={item.id}
                  item={item}
                  fallbackIcon={item.fallbackIcon}
                />
              ))}
            </CommandGroup>
          ) : (
            groups.map((group) => (
              <CommandGroup key={group.key} heading={group.key}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    item={item}
                    fallbackIcon={group.subgroupFallbackIcons[item.subgroup]}
                  />
                ))}
              </CommandGroup>
            ))
          )}
        </CommandList>
      </ScrollArea>
      <CommandFooter />
    </Command>
  )
}
export { CommandPalette }
