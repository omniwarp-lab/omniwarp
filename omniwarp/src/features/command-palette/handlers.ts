import { launchApp } from '@/features/apps/commands.ts'
import { openSettings } from '@/features/settings/commands.ts'

async function handleSelect(value: string) {
  const separator = value.indexOf(':')
  if (separator === -1) return

  const kind = value.slice(0, separator)
  const id = value.slice(separator + 1)

  switch (kind) {
    case 'app':
      await launchApp(id)
      break
    case 'commands':
      if (id === 'omniwarp.settings') {
        await openSettings()
      }
      break
  }
}

export { handleSelect }
