import { focusApp, launchApp } from '@/features/apps/commands.ts'
import { copyText } from '@/features/clipboard/commands'
import { openSettings } from '@/features/settings/commands.ts'
import { toggleMicrophoneMute, toggleMute } from '@/features/sound/commands.ts'
import {
  lockScreen,
  restartSystem,
  shutdownSystem,
  sleepSystem,
} from '@/features/system/commands.ts'
import { isAppRunning } from '@/features/command-palette/selectors.ts'
import { showCopyHud } from '@/features/hud/commands'
import { showAppError } from '@/features/hud/errors'
import { searchWeb } from '@/features/search-providers/commands'
import { useSearchProvidersStore } from '@/features/search-providers/store'
import { useCommandStore } from '@/features/command-palette/store'
import i18n from '@/i18n'

async function handleSelect(value: string) {
  const separator = value.indexOf(':')
  if (separator === -1) return

  const kind = value.slice(0, separator)
  const id = value.slice(separator + 1)

  switch (kind) {
    case 'calculator': {
      try {
        await copyText(id)
        await showCopyHud(i18n.t('hud.copiedResult'))
      } catch (err) {
        await showAppError(err)
      }
      break
    }
    case 'search-providers': {
      const template = useSearchProvidersStore.getState().getProviderUrl(id)
      if (!template) return

      const query = useCommandStore.getState().query
      try {
        await searchWeb(
          template.replace(
            '{query}',
            encodeURIComponent(query.trim()),
          ),
        )
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
        } else if (id === 'sound.toggleMute') {
          await toggleMute()
        } else if (id === 'sound.toggleMicrophoneMute') {
          await toggleMicrophoneMute()
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
