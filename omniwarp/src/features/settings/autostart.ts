import {
  disable,
  enable,
  isEnabled,
} from '@tauri-apps/plugin-autostart'

async function isAutostartEnabled(): Promise<boolean> {
  return isEnabled()
}

async function setAutostart(enabled: boolean): Promise<void> {
  if (enabled) {
    await enable()
  } else {
    await disable()
  }
}

export { isAutostartEnabled, setAutostart }
