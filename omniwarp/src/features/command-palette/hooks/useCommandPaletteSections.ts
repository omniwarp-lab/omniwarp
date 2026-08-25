import Fuse from 'fuse.js'
import {
  CommandGroup,
  CommandSection,
} from '@/features/command-palette/types.ts'
import { useMemo } from 'react'
import { toPaletteItem } from '@/features/command-palette/adapters.ts'
import { useTranslation } from 'react-i18next'

function useCommandPaletteSections(
  groups: CommandGroup[],
  query: string,
): CommandSection[] {
  const { t } = useTranslation()

  const flatItems = useMemo(
    () =>
      groups.flatMap((group) =>
        group.items.map((item) => toPaletteItem(item, group, t)),
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

  return useMemo(() => {
    if (results) {
      return [
        {
          key: 'results',
          heading: t('commandPalette.groups.results'),
          items: results,
        },
      ]
    }
    return groups.map((group) => ({
      key: group.key,
      heading: t(`commandPalette.groups.${group.key}`),
      items: group.items.map((item) => toPaletteItem(item, group, t)),
    }))
  }, [results, groups])
}

export { useCommandPaletteSections }
