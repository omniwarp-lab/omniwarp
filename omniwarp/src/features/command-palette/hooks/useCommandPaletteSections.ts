import Fuse from 'fuse.js'
import {
  CommandGroup,
  CommandSection,
} from '@/features/command-palette/types.ts'
import { useMemo } from 'react'
import { toPaletteItem } from '@/features/command-palette/adapters.ts'
import { useTranslation } from 'react-i18next'
import { useSearchProvidersStore } from '@/features/search-providers/store'
import { calculate } from '@/features/calculator/calculate'
import { useCalculatorSettingsStore } from '@/features/calculator/store'
import { Calculator, Globe } from 'lucide-react'

const SEARCH_PROVIDERS_GROUP: CommandGroup = {
  key: 'search-providers',
  order: 2,
  subgroupConfigs: {},
  items: [],
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

  const enabled = useCalculatorSettingsStore((s) => s.enabled)
  const activationMode = useCalculatorSettingsStore((s) => s.activationMode)
  const thousandSeparator = useCalculatorSettingsStore(
    (s) => s.thousandSeparator,
  )
  const angleUnit = useCalculatorSettingsStore((s) => s.angleUnit)
  const calcResult = useMemo(
    () =>
      enabled
        ? calculate(
            query,
            undefined,
            activationMode,
            angleUnit,
            thousandSeparator,
          )
        : ({ show: false } as const),
    [enabled, query, activationMode, angleUnit, thousandSeparator],
  )

  const providers = useSearchProvidersStore((s) => s.providers)
  const searchProvidersEnabled = useSearchProvidersStore((s) => s.enabled)

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
              expression: calcResult.latex,
              subgroup: '',
              icon: Calculator,
            },
          ],
        }
      : null

    const baseWithCalculator = calculatorSection
      ? [calculatorSection, ...base]
      : base

    if (!trimmed || !searchProvidersEnabled) return baseWithCalculator

    const activeProviders = providers.filter((p) => p.enabled)
    if (activeProviders.length === 0) return baseWithCalculator

    return [
      ...baseWithCalculator,
      {
        key: 'search-providers',
        heading: t('commandPalette.groups.searchProviders'),
        items: activeProviders.map((p) =>
          toPaletteItem(
            {
              id: `search-providers:${p.id}`,
              label: p.name,
              icon: p.icon ? { kind: 'image', src: p.icon } : Globe,
              subgroup: 'webSearch',
            },
            SEARCH_PROVIDERS_GROUP,
            t,
          ),
        ),
      },
    ]
  }, [
    results,
    groups,
    t,
    query,
    calcResult,
    providers,
    searchProvidersEnabled,
  ])
}

export { useCommandPaletteSections }
