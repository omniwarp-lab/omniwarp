import { createFileRoute } from '@tanstack/react-router'
import { HudComponent } from '@/features/hud/components/hud'

const Route = createFileRoute('/hud')({
  component: HudComponent,
})

export { Route }
