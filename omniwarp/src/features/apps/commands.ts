import { invoke } from '@tauri-apps/api/core'
import { Apps } from '@/features/apps/types.ts'

function discoverApps(): Promise<Apps> {
  return invoke('discover_apps')
}

function launchApp(id: string, asAdmin = false): Promise<void> {
  return invoke('launch_app', { id, asAdmin })
}

function focusApp(id: string): Promise<void> {
  return invoke('focus_app', { id })
}

function closeApp(id: string): Promise<void> {
  return invoke('close_app', { id })
}

function openAppInExplorer(id: string): Promise<void> {
  return invoke('open_app_in_explorer', { id })
}

function copyAppTargetPath(id: string): Promise<void> {
  return invoke('copy_app_target_path', { id })
}

export {
  discoverApps,
  launchApp,
  focusApp,
  closeApp,
  openAppInExplorer,
  copyAppTargetPath,
}
