import { create } from 'zustand/react'
import { CommandGroup } from '@/features/command-palette/types.ts'

interface CommandStore {
  groups: CommandGroup[]
  addGroup: (group: CommandGroup) => void
  updateRunningApps: (runningMap: Record<string, number[]>) => void
}

const useCommandStore = create<CommandStore>((set) => ({
  groups: [],

  addGroup: (group) =>
    set(({ groups }) => ({
      groups: [...groups, group].sort((a, b) => a.order - b.order),
    })),

  updateRunningApps: (runningMap) =>
    set(({ groups }) => {
      let changed = false
      const newGroups = groups.map((group) => {
        if (group.key !== 'apps') return group
        const newItems = group.items.map((item) => {
          const rawId = item.id.startsWith('app:') ? item.id.slice(4) : item.id
          const pids = runningMap[rawId]
          const isRunning = Boolean(pids && pids.length > 0)
          if (item.isRunning === isRunning) return item
          changed = true
          return { ...item, isRunning }
        })
        return changed ? { ...group, items: newItems } : group
      })
      return changed ? { groups: newGroups } : {}
    }),
}))

export { useCommandStore }
