import { cn } from '@/lib/utils.ts'
import { convertFileSrc } from '@tauri-apps/api/core'
import {
  CommandIcon,
  SubgroupConfig,
} from '@/features/command-palette/types.ts'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'

function IconRenderer({
  icon: Icon,
  gradient,
  iconColor,
}: {
  icon: LucideIcon
  gradient?: string
  iconColor?: string
}) {
  if (!gradient && !iconColor) return <Icon className='size-6' />

  return (
    <div
      className={cn(
        'flex size-6 items-center justify-center rounded-md',
        gradient,
      )}
    >
      <Icon
        className='size-[calc(var(--spacing)*4.4)]'
        style={iconColor ? { color: iconColor } : undefined}
      />
    </div>
  )
}

function ImageIconRenderer({
  src,
  fallback: FallbackIcon,
}: {
  src: string
  fallback?: LucideIcon
}) {
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError || !src) {
    if (!FallbackIcon) return null
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

function CommandIconRenderer({
  icon,
  config,
}: {
  icon: CommandIcon
  config?: SubgroupConfig
}) {
  if ('kind' in icon)
    return <ImageIconRenderer src={icon.src} fallback={config?.fallbackIcon} />

  return (
    <IconRenderer
      icon={icon}
      gradient={config?.gradient}
      iconColor={config?.iconColor}
    />
  )
}

export { CommandIconRenderer }
