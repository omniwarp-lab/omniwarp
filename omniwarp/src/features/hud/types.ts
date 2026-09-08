type HudVariant = 'success' | 'error'

interface HudPayload {
  message: string
  variant: HudVariant
  description?: string
  icon?: string
}

export type { HudVariant, HudPayload }
