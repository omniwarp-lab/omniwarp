import { createFileRoute } from '@tanstack/react-router'
import { CommandPalette } from '@/features/command-palette/components'

function IndexComponent() {
  return <CommandPalette />
}

const Route = createFileRoute('/')({
  component: IndexComponent,
})

export { Route }
