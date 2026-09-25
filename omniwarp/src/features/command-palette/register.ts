import { discoverApps } from '@/features/apps/commands.ts'
import { useCommandStore } from '@/features/command-palette/store.ts'
import { appToCommandItem } from '@/features/command-palette/adapters.ts'
import {
  AppWindowIcon,
  BoltIcon,
  Gamepad2Icon,
  LockIcon,
  MicIcon,
  MicOffIcon,
  MoonIcon,
  PowerIcon,
  RotateCwIcon,
  SkipForwardIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react'
import { initAppsSync } from '@/features/apps/sync.ts'
import { showAppError } from '@/features/hud/errors'

async function registerAppsGroup(): Promise<void> {
  try {
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
  } catch (err) {
    await showAppError(err)
  }
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
        id: 'commands:sound.setVolume',
        icon: Volume2Icon,
        subgroup: 'sound',
        labelKey: 'sound.setVolume',
      },
      {
        id: 'commands:sound.toggleMute',
        icon: VolumeXIcon,
        subgroup: 'sound',
        labelKey: 'sound.toggleMute',
      },
      {
        id: 'commands:sound.setMicrophoneVolume',
        icon: MicIcon,
        subgroup: 'sound',
        labelKey: 'sound.setMicrophoneVolume',
      },
      {
        id: 'commands:sound.toggleMicrophoneMute',
        icon: MicOffIcon,
        subgroup: 'sound',
        labelKey: 'sound.toggleMicrophoneMute',
      },
      {
        id: 'commands:system.nextTrack',
        icon: SkipForwardIcon,
        subgroup: 'system',
        labelKey: 'system.nextTrack',
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
      {
        id: 'commands:system.restart',
        icon: RotateCwIcon,
        subgroup: 'system',
        labelKey: 'system.restart',
        destructive: true,
        confirmationKey: 'commandPalette.confirmation.restart',
      },
      {
        id: 'commands:system.shutdown',
        icon: PowerIcon,
        subgroup: 'system',
        labelKey: 'system.shutdown',
        destructive: true,
        confirmationKey: 'commandPalette.confirmation.shutdown',
      },
    ],
    subgroupConfigs: {
      omniwarp: {
        gradient: 'bg-gradient-to-br from-[#40444c] to-[#282b31]',
        iconColor: '#fff',
      },
      sound: {
        gradient: 'bg-gradient-to-br from-slate-500 to-slate-700',
        iconColor: '#fff',
      },
      system: {
        gradient: 'bg-gradient-to-br from-zinc-500 to-zinc-700',
        iconColor: '#fff',
      },
    },
  })
}

export { registerAppsGroup, registerCommandsGroup }
