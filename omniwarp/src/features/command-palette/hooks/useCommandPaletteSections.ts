import Fuse from 'fuse.js'
import {
  CommandGroup,
  CommandIcon,
  CommandItem,
} from '@/features/command-palette/types.ts'
import { useMemo } from 'react'

type PaletteItem = CommandItem & { fallbackIcon: CommandIcon }

type Section = {
  key: string
  heading: string
  items: PaletteItem[]
}

function withFallbackIcon(item: CommandItem, group: CommandGroup): PaletteItem {
  return { ...item, fallbackIcon: group.subgroupFallbackIcons[item.subgroup] }
}

function useCommandPaletteSections(groups: CommandGroup[], query: string) {
  const flatItems = useMemo(
    () =>
      groups.flatMap((group) =>
        group.items.map((item) => withFallbackIcon(item, group)),
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

  return useMemo<Section[]>(() => {
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
      items: group.items.map((item) => withFallbackIcon(item, group)),
    }))
  }, [results, groups])
}

export { useCommandPaletteSections }
