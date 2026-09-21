import googleLogo from '@/assets/logos/google.png'
import duckduckgoLogo from '@/assets/logos/duckduckgo.png'
import type { SearchProvider, SearchProviderId } from './types'

const PROVIDER_IDS: readonly SearchProviderId[] = ['google', 'duckduckgo']

const BUILT_IN_PROVIDERS: readonly SearchProvider[] = [
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q={query}',
    icon: googleLogo,
    enabled: true,
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q={query}',
    icon: duckduckgoLogo,
    enabled: true,
  },
]

export { BUILT_IN_PROVIDERS, PROVIDER_IDS }
