import { create } from 'zustand/react'
import { settingsStore } from '@/features/settings/storage'
import type { AngleUnit, CalculatorActivationMode } from './types'

const ENABLED_KEY = 'calculator.enabled'
const DEFAULT_ENABLED = true

const ACTIVATION_MODE_KEY = 'calculator.activationMode'
const DEFAULT_ACTIVATION_MODE: CalculatorActivationMode = 'auto'

const THOUSAND_SEPARATOR_KEY = 'calculator.thousandSeparator'
const DEFAULT_THOUSAND_SEPARATOR = true

const ANGLE_UNIT_KEY = 'calculator.angleUnit'
const DEFAULT_ANGLE_UNIT: AngleUnit = 'rad'

function isActivationMode(value: unknown): value is CalculatorActivationMode {
  return value === 'auto' || value === 'requireEquals'
}

function isAngleUnit(value: unknown): value is AngleUnit {
  return value === 'rad' || value === 'deg'
}

interface CalculatorSettingsStore {
  enabled: boolean
  setEnabled: (enabled: boolean) => Promise<void>
  activationMode: CalculatorActivationMode
  setActivationMode: (mode: CalculatorActivationMode) => Promise<void>
  thousandSeparator: boolean
  setThousandSeparator: (enabled: boolean) => Promise<void>
  angleUnit: AngleUnit
  setAngleUnit: (unit: AngleUnit) => Promise<void>
}

const useCalculatorSettingsStore = create<CalculatorSettingsStore>(
  (set, get) => ({
    enabled: DEFAULT_ENABLED,
    setEnabled: async (enabled) => {
      if (get().enabled === enabled) return
      const prev = get().enabled
      set({ enabled })
      try {
        await settingsStore.set(ENABLED_KEY, enabled)
      } catch {
        set({ enabled: prev })
      }
    },
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
    thousandSeparator: DEFAULT_THOUSAND_SEPARATOR,
    setThousandSeparator: async (enabled) => {
      if (get().thousandSeparator === enabled) return
      const prev = get().thousandSeparator
      set({ thousandSeparator: enabled })
      try {
        await settingsStore.set(THOUSAND_SEPARATOR_KEY, enabled)
      } catch {
        set({ thousandSeparator: prev })
      }
    },
    angleUnit: DEFAULT_ANGLE_UNIT,
    setAngleUnit: async (unit) => {
      if (get().angleUnit === unit) return
      const prev = get().angleUnit
      set({ angleUnit: unit })
      try {
        await settingsStore.set(ANGLE_UNIT_KEY, unit)
      } catch {
        set({ angleUnit: prev })
      }
    },
  }),
)

let syncActive = false

async function initCalculatorSettingsSync(): Promise<() => void> {
  if (syncActive) return () => {}
  syncActive = true

  try {
    const storedEnabled = await settingsStore.get<boolean>(ENABLED_KEY)
    if (typeof storedEnabled === 'boolean') {
      useCalculatorSettingsStore.setState({ enabled: storedEnabled })
    }
  } catch {}

  try {
    const storedActivation =
      await settingsStore.get<string>(ACTIVATION_MODE_KEY)
    if (isActivationMode(storedActivation)) {
      useCalculatorSettingsStore.setState({
        activationMode: storedActivation,
      })
    }
  } catch {}

  try {
    const storedThousandSep =
      await settingsStore.get<boolean>(THOUSAND_SEPARATOR_KEY)
    if (typeof storedThousandSep === 'boolean') {
      useCalculatorSettingsStore.setState({
        thousandSeparator: storedThousandSep,
      })
    }
  } catch {}

  try {
    const storedAngle = await settingsStore.get<string>(ANGLE_UNIT_KEY)
    if (isAngleUnit(storedAngle)) {
      useCalculatorSettingsStore.setState({ angleUnit: storedAngle })
    }
  } catch {}

  const unlistenEnabled = await settingsStore.onKeyChange<boolean>(
    ENABLED_KEY,
    (value) => {
      if (typeof value === 'boolean') {
        useCalculatorSettingsStore.setState({ enabled: value })
      }
    },
  )

  const unlistenActivation = await settingsStore.onKeyChange<string>(
    ACTIVATION_MODE_KEY,
    (value) => {
      if (isActivationMode(value)) {
        useCalculatorSettingsStore.setState({ activationMode: value })
      }
    },
  )

  const unlistenThousandSep = await settingsStore.onKeyChange<boolean>(
    THOUSAND_SEPARATOR_KEY,
    (value) => {
      if (typeof value === 'boolean') {
        useCalculatorSettingsStore.setState({ thousandSeparator: value })
      }
    },
  )

  const unlistenAngle = await settingsStore.onKeyChange<string>(
    ANGLE_UNIT_KEY,
    (value) => {
      if (isAngleUnit(value)) {
        useCalculatorSettingsStore.setState({ angleUnit: value })
      }
    },
  )

  return () => {
    unlistenEnabled()
    unlistenActivation()
    unlistenThousandSep()
    unlistenAngle()
    syncActive = false
  }
}

export {
  useCalculatorSettingsStore,
  initCalculatorSettingsSync,
  isActivationMode,
  isAngleUnit,
  DEFAULT_ENABLED,
  DEFAULT_ANGLE_UNIT,
  DEFAULT_THOUSAND_SEPARATOR,
}
