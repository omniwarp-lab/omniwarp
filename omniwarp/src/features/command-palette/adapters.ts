import {
  CommandGroup,
  CommandItem,
  PaletteItem,
} from '@/features/command-palette/types.ts'
import { AppInfo } from '@/features/apps/types.ts'
import { TFunction } from 'i18next'

function appToCommandItem(app: AppInfo): CommandItem {
  return {
    id: `app:${app.id}`,
    label: app.name,
    subgroup: app.kind,
    icon: { kind: 'image', src: app.iconPath ? app.iconPath : '' },
  }
}

function toPaletteItem(
  item: CommandItem,
  group: CommandGroup,
  t: TFunction,
): PaletteItem {
  return {
    id: item.id,
    icon: item.icon,
    subgroupConfig: group.subgroupConfigs[item.subgroup],
    subgroup: t(`commandPalette.subgroups.${item.subgroup}`),
    label: item.labelKey !== undefined ? t(item.labelKey) : item.label,
  }
}

export { appToCommandItem, toPaletteItem }
