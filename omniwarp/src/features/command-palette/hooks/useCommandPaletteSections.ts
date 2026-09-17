import Fuse from 'fuse.js'
import {
  CommandGroup,
  CommandSection,
} from '@/features/command-palette/types.ts'
import { useMemo } from 'react'
import { toPaletteItem } from '@/features/command-palette/adapters.ts'
import { useTranslation } from 'react-i18next'
import { SEARCH_PROVIDERS } from '@/features/search-providers/providers'
import { calculate } from '@/features/calculator/calculate'
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
    if (!query.trim()) return null
    return fuse.search(query).map((r) => r.item)
  }, [query, fuse])

  const calcResult = useMemo(() => calculate(query), [query])

  return useMemo(() => {
    const trimmed = query.trim()
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

    const calculatorSection: CommandSection | null = calcResult.show
      ? {
          key: 'calculator',
          heading: t('commandPalette.groups.calculator'),
          items: [
            {
              id: `calculator:${calcResult.result}`,
              label: calcResult.result,
              expression: trimmed.endsWith('=') ? trimmed : `${trimmed} =`,
              subgroup: '',
              icon: Calculator,
            },
          ],
        }
      : null

    const baseWithCalculator = calculatorSection
      ? [calculatorSection, ...base]
      : base

    if (!trimmed) return baseWithCalculator

    return [
      ...baseWithCalculator,
      {
        key: 'search-providers',
        heading: t('commandPalette.groups.searchProviders'),
        items: SEARCH_PROVIDERS.map((item) =>
          toPaletteItem(item, SEARCH_PROVIDERS_GROUP, t),
        ),
      },
    ]
  }, [results, groups, t, query, calcResult])
}

export { useCommandPaletteSections }
