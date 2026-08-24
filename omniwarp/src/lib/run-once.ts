const ranKeys = new Set<string>()

function runOnce(key: string, fn: () => void | Promise<void>): void {
  if (ranKeys.has(key)) return
  ranKeys.add(key)
  fn()
}

export { runOnce }
