import { listen } from '@tauri-apps/api/event'
import { useCommandStore } from '@/features/command-palette/store'
import {
  APPS_RUNNING_UPDATED_EVENT,
  RunningAppsPayload,
} from '@/features/apps/events'

let syncActive = false

async function initAppsSync(): Promise<() => void> {
  if (syncActive) return () => {}
  syncActive = true

  const unlisten = await listen<RunningAppsPayload>(
    APPS_RUNNING_UPDATED_EVENT,
    (event) => {
      useCommandStore.getState().updateRunningApps(event.payload)
    },
  )

  return () => {
    unlisten()
    syncActive = false
  }
}

export { initAppsSync }
