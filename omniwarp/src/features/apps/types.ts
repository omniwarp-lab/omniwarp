type Apps = AppInfo[]

type AppKind = 'app' | 'game'

interface AppInfo {
  name: string
  id: string
  iconPath: string | null
  kind: AppKind
}

export type { Apps, AppKind, AppInfo }
