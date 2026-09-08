import { invoke } from '@tauri-apps/api/core'
import type { HudPayload } from '@/features/hud/types'

type ShowHudOptions = Partial<Omit<HudPayload, 'message'>>

function showHud(message: string, options?: ShowHudOptions): Promise<void> {
  return invoke<void>('show_hud', {
    payload: { message, variant: 'error', ...options },
  }).catch(() => {})
}

function showCopyHud(message: string): Promise<void> {
  return showHud(message, { icon: 'copy', variant: 'success' })
}

export { showHud, showCopyHud }
export type { ShowHudOptions }
