import { cn } from '@/lib/utils.ts'
import { convertFileSrc } from '@tauri-apps/api/core'
import {
  CommandIcon,
  SubgroupConfig,
} from '@/features/command-palette/types.ts'
import { Avatar, AvatarBadge } from '@/components/ui/avatar'
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
  isRunning,
}: {
  icon: CommandIcon
  config?: SubgroupConfig
  isRunning?: boolean
}) {
  if ('kind' in icon)
    return (
      <Avatar
        size='sm'
        className='size-6 rounded-none bg-transparent after:hidden'
      >
        <ImageIconRenderer src={icon.src} fallback={config?.fallbackIcon} />
        {isRunning && (
          <AvatarBadge className='size-1.5 group-aria-selected/item:ring-accent bg-emerald-500' />
        )}
      </Avatar>
    )

  return (
    <IconRenderer
      icon={icon}
      gradient={config?.gradient}
      iconColor={config?.iconColor}
    />
  )
}

export { CommandIconRenderer }
