import { discoverApps } from '@/features/apps/commands.ts'
import { useCommandStore } from '@/features/command-palette/store.ts'
import { appToCommandItem } from '@/features/command-palette/adapters.ts'
import { AppWindowIcon, BoltIcon, Gamepad2Icon } from 'lucide-react'

async function registerAppsGroup(): Promise<void> {
  const apps = await discoverApps()

  useCommandStore.getState().addGroup({
    key: 'apps',
    order: 1,
    items: apps.map(appToCommandItem),
    subgroupConfigs: {
      game: { fallbackIcon: Gamepad2Icon },
      app: { fallbackIcon: AppWindowIcon },
    },
  })
}

async function registerCommandsGroup(): Promise<void> {
  useCommandStore.getState().addGroup({
    key: 'commands',
    order: 0,
    items: [
      {
        id: 'commands:omniwarp.settings',
        icon: BoltIcon,
        subgroup: 'omniwarp',
        labelKey: 'omniwarp.settings',
      },
    ],
    subgroupConfigs: {
      omniwarp: {
        gradient: 'bg-gradient-to-br from-[#40444c] to-[#282b31]',
        iconColor: '#fff',
      },
    },
  })
}

export { registerAppsGroup, registerCommandsGroup }
