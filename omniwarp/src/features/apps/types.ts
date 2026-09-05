type Apps = AppInfo[]

type AppKind = 'app' | 'game'

interface AppInfo {
  name: string
  id: string
  iconPath: string | null
  kind: AppKind
  pids: number[]
  canOpenInExplorer?: boolean
}

export type { Apps, AppKind, AppInfo }
