interface SearchProvider {
  id: string
  name: string
  url: string
  icon?: string
  isCustom?: boolean
  enabled: boolean
}

export type { SearchProvider }
