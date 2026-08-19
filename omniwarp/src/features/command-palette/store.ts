import { create } from 'zustand/react'
import { CommandGroup } from '@/features/command-palette/types.ts'

interface CommandStore {
  groups: CommandGroup[]
  addGroup: (group: CommandGroup) => void
}

const useCommandStore = create<CommandStore>((set) => ({
  groups: [],

  addGroup: (group) =>
    set(({ groups }) => ({
      groups: [...groups, group].sort((a, b) => a.order - b.order),
    })),
}))

export { useCommandStore }
