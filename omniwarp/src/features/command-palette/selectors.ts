import { useCommandStore } from '@/features/command-palette/store.ts'

function isAppRunning(appId: string): boolean {
  const groups = useCommandStore.getState().groups
  const appsGroup = groups.find((g) => g.key === 'apps')
  const item = appsGroup?.items.find((i) => i.id === `app:${appId}`)
  return Boolean(item?.isRunning)
}

export { isAppRunning }
