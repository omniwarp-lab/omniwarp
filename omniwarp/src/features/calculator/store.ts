import { create } from 'zustand/react'
import { settingsStore } from '@/features/settings/storage'
import type { CalculatorActivationMode } from './types'

const ACTIVATION_MODE_KEY = 'calculator.activationMode'
const DEFAULT_ACTIVATION_MODE: CalculatorActivationMode = 'auto'

function isActivationMode(value: unknown): value is CalculatorActivationMode {
  return value === 'auto' || value === 'requireEquals'
}

interface CalculatorSettingsStore {
  activationMode: CalculatorActivationMode
  setActivationMode: (mode: CalculatorActivationMode) => Promise<void>
}

const useCalculatorSettingsStore = create<CalculatorSettingsStore>(
  (set, get) => ({
    activationMode: DEFAULT_ACTIVATION_MODE,
    setActivationMode: async (mode) => {
      if (get().activationMode === mode) return
      const prev = get().activationMode
      set({ activationMode: mode })
      try {
        await settingsStore.set(ACTIVATION_MODE_KEY, mode)
      } catch {
        set({ activationMode: prev })
      }
    },
  }),
)

let syncActive = false

async function initCalculatorSettingsSync(): Promise<() => void> {
  if (syncActive) return () => {}
  syncActive = true

  try {
    const stored = await settingsStore.get<string>(ACTIVATION_MODE_KEY)
    if (isActivationMode(stored)) {
      useCalculatorSettingsStore.setState({ activationMode: stored })
    }
  } catch {}

  const unlisten = await settingsStore.onKeyChange<string>(
    ACTIVATION_MODE_KEY,
    (value) => {
      if (isActivationMode(value)) {
        useCalculatorSettingsStore.setState({ activationMode: value })
      }
    },
  )

  return () => {
    unlisten()
    syncActive = false
  }
}

export {
  useCalculatorSettingsStore,
  initCalculatorSettingsSync,
  isActivationMode,
}
