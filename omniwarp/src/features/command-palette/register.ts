import { discoverApps } from '@/features/apps/commands.ts'
import { useCommandStore } from '@/features/command-palette/store.ts'
import { appToCommandItem } from '@/features/command-palette/adapters.ts'
import {
  AppWindowIcon,
  BoltIcon,
  Gamepad2Icon,
  LockIcon,
  MoonIcon,
} from 'lucide-react'
import { initAppsSync } from '@/features/apps/sync.ts'

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

  void initAppsSync()
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
      {
        id: 'commands:system.lock',
        icon: LockIcon,
        subgroup: 'system',
        labelKey: 'system.lock',
      },
      {
        id: 'commands:system.sleep',
        icon: MoonIcon,
        subgroup: 'system',
        labelKey: 'system.sleep',
      },
    ],
    subgroupConfigs: {
      omniwarp: {
        gradient: 'bg-gradient-to-br from-[#40444c] to-[#282b31]',
        iconColor: '#fff',
      },
      system: {
        gradient: 'bg-gradient-to-br from-[#587B99] to-[#293C50]',
        iconColor: '#fff',
      },
    },
  })
}

export { registerAppsGroup, registerCommandsGroup }
