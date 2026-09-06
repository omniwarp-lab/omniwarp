import type { LucideIcon } from 'lucide-react'

interface CommandItemBase {
  id: string
  icon: CommandIcon
  subgroup: string
  isRunning?: boolean
  canOpenInExplorer?: boolean
  destructive?: boolean
  confirmationKey?: string
}

interface AppCommandItem extends CommandItemBase {
  label: string
  labelKey?: never
}

interface TranslatedCommandItem extends CommandItemBase {
  labelKey: string
  label?: never
}

type CommandItem = AppCommandItem | TranslatedCommandItem

interface ItemImage {
  kind: 'image'
  src: string
}

type CommandIcon = LucideIcon | ItemImage

interface SubgroupConfig {
  gradient?: string
  iconColor?: string
  fallbackIcon?: LucideIcon
}

interface CommandGroup {
  key: string
  order: number
  subgroupConfigs: Record<string, SubgroupConfig>
  items: CommandItem[]
}

type PaletteItem = Omit<CommandItem, 'label' | 'labelKey'> & {
  label: string
  subgroupConfig?: SubgroupConfig
}

type CommandSection = {
  key: string
  heading: string
  items: PaletteItem[]
}

export type {
  CommandGroup,
  CommandItem,
  PaletteItem,
  CommandIcon,
  SubgroupConfig,
  CommandSection,
}
