const APPS_RUNNING_UPDATED_EVENT = 'omniwarp://apps-running-updated'

type RunningAppsPayload = Record<string, number[]>

export { APPS_RUNNING_UPDATED_EVENT }
export type { RunningAppsPayload }
