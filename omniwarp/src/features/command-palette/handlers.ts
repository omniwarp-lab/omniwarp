import { launchApp } from '@/features/apps/commands.ts'

async function handleSelect(value: string) {
  const separator = value.indexOf(':')
  if (separator === -1) return

  const kind = value.slice(0, separator)
  const id = value.slice(separator + 1)

  switch (kind) {
    case 'app':
      await launchApp(id)
      break
  }
}

export { handleSelect }
