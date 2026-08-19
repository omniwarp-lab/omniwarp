import { invoke } from '@tauri-apps/api/core'
import { Apps } from '@/features/apps/types.ts'

function discoverApps(): Promise<Apps> {
  return invoke('discover_apps')
}

function launchApp(id: string) {
  return invoke('launch_app', { id })
}

export { discoverApps, launchApp }
