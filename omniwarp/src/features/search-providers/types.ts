interface SearchProvider {
  id: string
  name: string
  url: string
  icon?: string
  hasIcon?: boolean
  iconUpdatedAt?: number | null
  isCustom?: boolean
  enabled: boolean
}

interface IconPreview {
  key: string
}

export type { SearchProvider, IconPreview }
