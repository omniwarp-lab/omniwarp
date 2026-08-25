import { createFileRoute } from '@tanstack/react-router'
import { CommandPalette } from '@/features/command-palette/components'
import { useEffect } from 'react'
import { runOnce } from '@/lib/run-once.ts'
import {
  registerAppsGroup,
  registerCommandsGroup,
} from '@/features/command-palette/register.ts'

function IndexComponent() {
  useEffect(() => {
    runOnce('commands', registerCommandsGroup)
    runOnce('apps', registerAppsGroup)
  }, [])

  return <CommandPalette />
}

const Route = createFileRoute('/')({
  component: IndexComponent,
})

export { Route }
