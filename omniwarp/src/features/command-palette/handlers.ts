import { focusApp, launchApp } from '@/features/apps/commands.ts'
import { openSettings } from '@/features/settings/commands.ts'
import {
  lockScreen,
  restartSystem,
  shutdownSystem,
  sleepSystem,
} from '@/features/system/commands.ts'
import { isAppRunning } from '@/features/command-palette/selectors.ts'
import { showAppError } from '@/features/hud/errors'

async function handleSelect(value: string) {
  const separator = value.indexOf(':')
  if (separator === -1) return

  const kind = value.slice(0, separator)
  const id = value.slice(separator + 1)

  switch (kind) {
    case 'app': {
      if (isAppRunning(id)) {
        const focused = await focusApp(id)
        if (focused) return
      }
      try {
        await launchApp(id)
      } catch (err) {
        await showAppError(err)
      }
      break
    }
    case 'commands':
      if (id === 'omniwarp.settings') {
        await openSettings()
      } else if (id === 'system.lock') {
        await lockScreen()
      } else if (id === 'system.sleep') {
        await sleepSystem()
      } else if (id === 'system.restart') {
        await restartSystem()
      } else if (id === 'system.shutdown') {
        await shutdownSystem()
      }
      break
  }
}

export { handleSelect }
