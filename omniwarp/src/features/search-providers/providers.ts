import { convertFileSrc } from '@tauri-apps/api/core'
import googleLogo from '@/assets/logos/google.png'
import duckduckgoLogo from '@/assets/logos/duckduckgo.png'
import type { SearchProvider } from './types'

const BUILT_IN_ICONS: Record<string, string> = {
  google: googleLogo,
  duckduckgo: duckduckgoLogo,
}

const base = () => convertFileSrc('icon', 'provider-icon')
const providerIconUrl = (p: SearchProvider) =>
  `${base()}?id=${encodeURIComponent(p.id)}&v=${p.iconUpdatedAt ?? 0}`
const previewIconUrl = (key: string) =>
  `${base()}?preview=${encodeURIComponent(key)}`

export { BUILT_IN_ICONS, providerIconUrl, previewIconUrl }
