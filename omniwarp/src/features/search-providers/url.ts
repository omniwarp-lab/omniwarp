const COMMON_QUERY_PARAMS = [
  'q',
  'query',
  'search_query',
  'search',
  'k',
  'keyword',
  'keywords',
  'text',
  'term',
  'terms',
  's',
  'wd',
  'word',
  'p',
  'searchTerm',
  'search_term',
  'field-keywords',
]

export function autoApplyQueryToUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (trimmed.includes('%s')) return trimmed.replace(/%s/g, '{query}')
  if (trimmed.includes('{query}')) return trimmed
  if (/%7Bquery%7D/i.test(trimmed)) return trimmed.replace(/%7Bquery%7D/gi, '{query}')

  let parsed: URL
  try {
    parsed = new URL(
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`,
    )
  } catch {
    return trimmed
  }

  const { searchParams, pathname } = parsed
  const keys = Array.from(searchParams.keys())
  if (keys.length === 0) return trimmed

  const param =
    COMMON_QUERY_PARAMS.find((p) => searchParams.has(p)) ??
    keys.find((k) => /query|search/i.test(k)) ??
    (/search|results|find|query/i.test(pathname) && keys.length === 1
      ? keys[0]
      : null)

  if (param) {
    searchParams.set(param, '{query}')
    return parsed.toString().replace(/%7Bquery%7D/gi, '{query}')
  }

  return trimmed
}
