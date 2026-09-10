import { useCallback, useEffect, useRef, useState } from 'react'
import { listen } from '@tauri-apps/api/event'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { AlertCircle, Copy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { HUD_MESSAGE_EVENT } from '@/features/hud/events'
import type { HudPayload } from '@/features/hud/types'

const HUD_DURATION_MS = 3000

function renderIcon(icon?: string) {
  if (icon === 'copy') {
    return <Copy className='size-4 shrink-0' />
  }
  return <AlertCircle className='size-4 shrink-0' />
}

function HudComponent() {
  const { i18n } = useTranslation()
  const dir = i18n.dir()
  const [payload, setPayload] = useState<HudPayload | null>(null)
  const [seq, setSeq] = useState(0)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleNewPayload = useCallback((newPayload: HudPayload) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setPayload(newPayload)
    setSeq((s) => s + 1)

    timerRef.current = setTimeout(() => {
      void getCurrentWindow().hide()
      setPayload(null)
    }, HUD_DURATION_MS)
  }, [])

  useEffect(() => {
    let active = true

    const unlistenPromise = listen<HudPayload>(HUD_MESSAGE_EVENT, (event) => {
      if (active) {
        handleNewPayload(event.payload)
      }
    })

    return () => {
      active = false
      if (timerRef.current) clearTimeout(timerRef.current)
      void unlistenPromise.then((unlisten) => unlisten())
    }
  }, [handleNewPayload])

  if (!payload?.message) {
    return null
  }

  const isSuccess = payload.variant === 'success'

  return (
    <div
      data-slot='hud-window'
      dir={dir}
      className='flex h-screen w-screen items-center justify-center bg-transparent p-2 select-none'
    >
      <div
        key={seq}
        role='status'
        aria-live='polite'
        className='flex h-full w-full cursor-default items-center gap-3 rounded-xl border border-border bg-card px-3 text-foreground shadow-none animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200'
      >
        <span className='relative flex size-9 shrink-0 items-center justify-center'>
          <svg
            viewBox='0 0 36 36'
            className='absolute inset-0 size-full -rotate-90'
          >
            <circle
              cx='18'
              cy='18'
              r='15.5'
              fill='none'
              strokeWidth='2.5'
              className='stroke-muted'
            />
            <circle
              cx='18'
              cy='18'
              r='15.5'
              fill='none'
              strokeWidth='2.5'
              strokeLinecap='round'
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={0}
              className={cn(
                'hud-ring',
                isSuccess ? 'stroke-emerald-500' : 'stroke-destructive',
              )}
              style={{ animationDuration: `${HUD_DURATION_MS}ms` }}
            />
          </svg>
          <span
            className={cn(
              isSuccess ? 'text-emerald-400' : 'text-destructive',
            )}
          >
            {renderIcon(payload.icon)}
          </span>
        </span>

        <div className='flex min-w-0 flex-1 flex-col justify-center gap-0.5 text-start'>
          <span className='truncate text-[13px] leading-snug font-medium'>
            {payload.message}
          </span>
          {payload.description && (
            <span className='truncate text-xs leading-snug text-muted-foreground'>
              {payload.description}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export { HudComponent }
