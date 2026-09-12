import { createFileRoute } from '@tanstack/react-router'
import { TrayMenu } from '@/features/tray/components/tray-menu'

const Route = createFileRoute('/tray')({
  component: TrayMenu,
})

export { Route }
