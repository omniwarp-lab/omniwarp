import { invoke } from '@tauri-apps/api/core'
import { Apps } from '@/features/apps/types.ts'

function discoverApps(): Promise<Apps> {
  return invoke('discover_apps')
}

function launchApp(id: string): Promise<void> {
  return invoke('launch_app', { id })
}

function focusApp(id: string): Promise<boolean> {
  return invoke('focus_app', { id })
}

export { discoverApps, launchApp, focusApp }
