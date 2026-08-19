import { discoverApps } from '@/features/apps/commands.ts'
import { useCommandStore } from '@/features/command-palette/store.ts'
import { appToCommandItem } from '@/features/command-palette/adapters.ts'
import { AppWindowIcon, Gamepad2Icon } from 'lucide-react'

async function registerAppsGroup(): Promise<void> {
  const apps = await discoverApps()

  useCommandStore.getState().addGroup({
    key: 'apps',
    order: 0,
    items: apps.map(appToCommandItem),
    subgroupFallbackIcons: {
      game: Gamepad2Icon,
      app: AppWindowIcon,
    },
  })
}

export { registerAppsGroup }
