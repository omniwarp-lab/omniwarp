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
import { searchWeb } from '@/features/search-providers/commands'
import { SEARCH_URLS } from '@/features/search-providers/providers'
import { SearchProviderId } from '@/features/search-providers/types'
import { useCommandStore } from '@/features/command-palette/store'

async function handleSelect(value: string) {
  const separator = value.indexOf(':')
  if (separator === -1) return

  const kind = value.slice(0, separator)
  const id = value.slice(separator + 1)

  switch (kind) {
    case 'search-providers': {
      const query = useCommandStore.getState().query
      const base = SEARCH_URLS[id as SearchProviderId]
      try {
        await searchWeb(`${base}${encodeURIComponent(query.trim())}`)
      } catch (err) {
        await showAppError(err)
      }
      break
    }
    case 'app': {
      if (isAppRunning(id)) {
        try {
          await focusApp(id)
          return
        } catch {
          // If focusing fails, attempt to launch
        }
      }
      try {
        await launchApp(id)
      } catch (err) {
        await showAppError(err)
      }
      break
    }
    case 'commands':
      try {
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
      } catch (err) {
        await showAppError(err)
      }
      break
  }
}

export { handleSelect }
