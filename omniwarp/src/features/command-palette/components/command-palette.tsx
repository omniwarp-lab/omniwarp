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
import { useTranslation } from 'react-i18next'

function CommandPalette() {
  const [query, setQuery] = useState('')
  const groups = useCommandStore((s) => s.groups)
  const { t } = useTranslation()

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

  type PaletteItem = (typeof flatItems)[number]

  type Section = {
    key: string
    heading: string
    items: PaletteItem[]
  }

  const sections = useMemo<Section[]>(() => {
    if (results) {
      return [
        {
          key: 'results',
          heading: 'commandPalette.groups.results',
          items: results,
        },
      ]
    }
    return groups.map((group) => ({
      key: group.key,
      heading: `commandPalette.groups.${group.key}`,
      items: group.items.map((item) => ({
        ...item,
        fallbackIcon: group.subgroupFallbackIcons[item.subgroup],
      })),
    }))
  }, [results, groups])

  return (
    <Command className='h-full flex flex-col' shouldFilter={false}>
      <CommandInput query={query} setQuery={setQuery} />
      <ScrollArea className='min-h-0 flex-1 p-2'>
        <CommandList>
          {sections.map((section) => (
            <CommandGroup key={section.key} heading={t(section.heading)}>
              {section.items.map((item) => (
                <CommandItem
                  key={item.id}
                  item={item}
                  fallbackIcon={item.fallbackIcon}
                  subgroup={t(`commandPalette.subgroups.${item.subgroup}`)}
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
