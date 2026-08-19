import { CommandItem } from '@/features/command-palette/types.ts'
import { AppInfo } from '@/features/apps/types.ts'

function appToCommandItem(app: AppInfo): CommandItem {
  return {
    id: `app:${app.id}`,
    label: app.name,
    subgroup: app.kind,
    icon: app.iconPath ? app.iconPath : '',
  }
}

export { appToCommandItem }
