import { focusApp, launchApp } from '@/features/apps/commands.ts'
import { openSettings } from '@/features/settings/commands.ts'
import { lockScreen } from '@/features/system/commands.ts'
import { isAppRunning } from '@/features/command-palette/selectors.ts'

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
      await launchApp(id)
      break
    }
    case 'commands':
      if (id === 'omniwarp.settings') {
        await openSettings()
      } else if (id === 'system.lock') {
        await lockScreen()
      }
      break
  }
}

export { handleSelect }
