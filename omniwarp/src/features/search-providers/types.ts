type SearchProviderId = 'google' | 'duckduckgo'

interface SearchProvider {
  id: string
  name: string
  url: string
  icon?: string
  isCustom?: boolean
  enabled: boolean
}

export type { SearchProviderId, SearchProvider }
