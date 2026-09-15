import Fuse from 'fuse.js'
import {
  CommandGroup,
  CommandSection,
} from '@/features/command-palette/types.ts'
import { useMemo } from 'react'
import { toPaletteItem } from '@/features/command-palette/adapters.ts'
import { useTranslation } from 'react-i18next'
import { SEARCH_PROVIDERS } from '@/features/search-providers/providers'
import { evaluateCalculator } from '@/features/calculator/evaluator.ts'
import { Calculator } from 'lucide-react'

const SEARCH_PROVIDERS_GROUP: CommandGroup = {
  key: 'search-providers',
  order: 2,
  subgroupConfigs: {},
  items: [...SEARCH_PROVIDERS],
}

function useCommandPaletteSections(
  groups: CommandGroup[],
  query: string,
): CommandSection[] {
  const { t } = useTranslation()
  const trimmed = query.trim()
  const hasEqualPrefix = trimmed.startsWith('=')

  const flatItems = useMemo(
    () =>
      groups.flatMap((group) =>
        group.items.map((item) => toPaletteItem(item, group, t)),
      ),
    [groups, t],
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
    if (hasEqualPrefix || !trimmed) return null
    return fuse.search(query).map((r) => r.item)
  }, [query, fuse, hasEqualPrefix, trimmed])

  return useMemo(() => {
    const calcResult = evaluateCalculator(query)
    const calcSection: CommandSection[] =
      calcResult !== null
        ? [
            {
              key: 'calculator',
              heading: t('commandPalette.groups.calculator'),
              items: [
                {
                  id: `calc:${calcResult}`,
                  label: calcResult,
                  expression: `${trimmed.replace(/^=\s*/, '')} =`,
                  subgroup: t('commandPalette.subgroups.calculator'),
                  icon: Calculator,
                  subgroupConfig: {
                    gradient: 'bg-gradient-to-br from-[#40444c] to-[#282b31]',
                    iconColor: '#fff',
                  },
                },
              ],
            },
          ]
        : []

    if (hasEqualPrefix) {
      return calcSection
    }

    const base: CommandSection[] = results
      ? results.length === 0
        ? []
        : [
            {
              key: 'results',
              heading: t('commandPalette.groups.results'),
              items: results,
            },
          ]
      : groups
          .map((group) => ({
            key: group.key,
            heading: t(`commandPalette.groups.${group.key}`),
            items: group.items.map((item) => toPaletteItem(item, group, t)),
          }))
          .filter((section) => section.items.length > 0)

    if (!trimmed) return base

    return [
      ...calcSection,
      ...base,
      {
        key: 'search-providers',
        heading: t('commandPalette.groups.searchProviders'),
        items: SEARCH_PROVIDERS.map((item) =>
          toPaletteItem(item, SEARCH_PROVIDERS_GROUP, t),
        ),
      },
    ]
  }, [query, hasEqualPrefix, results, groups, t, trimmed])
}

export { useCommandPaletteSections }
