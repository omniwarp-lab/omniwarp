import googleLogo from '@/assets/logos/google.png'
import duckduckgoLogo from '@/assets/logos/duckduckgo.png'
import type { CommandItem } from '@/features/command-palette/types'
import type { SearchProviderId } from '@/features/search-providers/types'

const SEARCH_PROVIDERS: readonly CommandItem[] = [
  {
    id: 'search-providers:google',
    label: 'Google',
    icon: { kind: 'image', src: googleLogo },
    subgroup: 'webSearch',
  },
  {
    id: 'search-providers:duckduckgo',
    label: 'DuckDuckGo',
    icon: { kind: 'image', src: duckduckgoLogo },
    subgroup: 'webSearch',
  },
]

const SEARCH_URLS: Record<SearchProviderId, string> = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
}

export { SEARCH_PROVIDERS, SEARCH_URLS }
