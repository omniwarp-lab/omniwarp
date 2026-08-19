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

export type { CommandGroup, CommandItem, CommandIcon }
