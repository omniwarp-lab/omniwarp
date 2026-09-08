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
    return <Copy className='size-4 shrink-0 block stroke-[2.5]' />
  }
  return <AlertCircle className='size-4 shrink-0 block stroke-[2.5]' />
}

function HudComponent() {
  const { i18n } = useTranslation()
  const dir = i18n.dir()
  const [payload, setPayload] = useState<HudPayload | null>(null)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleNewPayload = useCallback((newPayload: HudPayload) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setPayload(newPayload)

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

  const variant = payload.variant

  return (
    <div
      data-slot='hud-window'
      dir={dir}
      className='flex h-screen w-screen items-center justify-center p-2 bg-transparent select-none'
    >
      <div
        role='status'
        aria-live='polite'
        className='group relative flex h-full w-full cursor-default items-center gap-3 overflow-hidden rounded-2xl border border-white/[0.12] bg-gradient-to-b from-[#232428] via-[#1b1c20] to-[#151619] px-3.5 py-2 text-foreground animate-in fade-in-0 duration-150'
      >
        {/* Icon Badge */}
        <div
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors',
            variant === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
              : 'border-rose-500/35 bg-rose-500/15 text-rose-400',
          )}
        >
          {renderIcon(payload.icon)}
        </div>

        {/* Message and optional description */}
        <div className='flex min-w-0 flex-1 flex-col justify-center gap-0.5 text-start'>
          <span className='truncate text-xs font-semibold tracking-[-0.01em] text-zinc-100 leading-tight'>
            {payload.message}
          </span>
          {payload.description && (
            <span className='truncate text-[10px] text-zinc-400 leading-tight'>
              {payload.description}
            </span>
          )}
        </div>

        {/* Countdown progress drain line */}
        <div className='absolute bottom-0 inset-x-0 h-0.5 bg-white/4 overflow-hidden rounded-b-2xl'>
          <div
            key={payload.message}
            className={cn(
              'h-full transition-transform',
              dir === 'rtl' ? 'origin-right' : 'origin-left',
              variant === 'success'
                ? 'bg-linear-to-r from-emerald-500 to-emerald-400'
                : 'bg-linear-to-r from-rose-500 to-red-400',
            )}
            style={{
              animation: `hud-drain ${HUD_DURATION_MS}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export { HudComponent }
