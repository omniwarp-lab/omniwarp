import { cn } from '@/lib/utils.ts'
import { convertFileSrc } from '@tauri-apps/api/core'
import { CommandIcon } from '@/features/command-palette/types.ts'
import { useState } from 'react'

function IconRenderer({
  src,
  fallback: FallbackIcon,
}: {
  src: string
  fallback: CommandIcon
}) {
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    return <FallbackIcon className='size-6' />
  }

  return (
    <img
      src={convertFileSrc(src)}
      className={cn('size-6', loading ? 'opacity-0' : 'opacity-100')}
      decoding='async'
      onError={() => setHasError(true)}
      onLoad={() => setLoading(false)}
    />
  )
}

export { IconRenderer }
