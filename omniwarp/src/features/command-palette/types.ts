import type { LucideIcon } from 'lucide-react'

interface CommandItem {
  id: string
  icon: string
  label: string
  subgroup: string
}

type CommandIcon = LucideIcon

interface CommandGroup {
  key: string
  order: number
  subgroupFallbackIcons: Record<string, CommandIcon>
  items: CommandItem[]
}

type PaletteItem = CommandItem & { fallbackIcon: CommandIcon }
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
  CommandSection,
}
