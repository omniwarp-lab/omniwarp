import { invoke } from '@tauri-apps/api/core'
import { Apps } from '@/features/apps/types.ts'

function discoverApps(): Promise<Apps> {
  return invoke('discover_apps')
}

function launchApp(id: string, asAdmin = false): Promise<void> {
  return invoke('launch_app', { id, asAdmin })
}

function focusApp(id: string): Promise<boolean> {
  return invoke('focus_app', { id })
}

function openAppInExplorer(id: string): Promise<void> {
  return invoke('open_app_in_explorer', { id })
}

export { discoverApps, launchApp, focusApp, openAppInExplorer }
