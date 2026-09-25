import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftRight,
  ArrowUpDown,
  Mic,
  MicOff,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { setMicrophoneVolume, setVolume } from '@/features/sound/commands'
import { AudioDirection } from '@/features/sound/types'

interface VolumeDialogProps {
  initialVolume: number
  direction?: AudioDirection
  onClose: () => void
}

const getAcceleratedStep = (count: number): number => {
  if (count < 3) return 1
  if (count < 8) return 2
  if (count < 16) return 3
  return 5
}

function VolumeDialog({
  initialVolume,
  direction = 'output',
  onClose,
}: VolumeDialogProps) {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()

  const normalizedInitial = Math.max(
    0,
    Math.min(100, Math.round(initialVolume)),
  )
  const [volume, setVolumeState] = useState(normalizedInitial)
  const [isDragging, setIsDragging] = useState(false)

  const currentVolumeRef = useRef(normalizedInitial)
  const trackRef = useRef<HTMLDivElement>(null)
  const repeatCountRef = useRef(0)
  const lastKeyRef = useRef<string | null>(null)
  const targetVolumeRef = useRef<number | null>(null)
  const isSyncingRef = useRef(false)

  const syncVolumeToBackend = async () => {
    if (isSyncingRef.current) return
    isSyncingRef.current = true
    while (targetVolumeRef.current !== null) {
      const val = targetVolumeRef.current
      targetVolumeRef.current = null
      try {
        if (direction === 'input') {
          await setMicrophoneVolume(val)
        } else {
          await setVolume(val)
        }
      } catch {
        // noop
      }
    }
    isSyncingRef.current = false
  }

  useEffect(() => {
    trackRef.current?.focus()
  }, [])

  const updateVolume = (nextVal: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(nextVal)))
    currentVolumeRef.current = clamped
    setVolumeState(clamped)
    targetVolumeRef.current = clamped
    void syncVolumeToBackend()
  }

  const calcVolumeFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    updateVolume(pct)
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    calcVolumeFromPointer(e)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) calcVolumeFromPointer(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      repeatCountRef.current = 0
      lastKeyRef.current = null
      updateVolume(currentVolumeRef.current + (e.key === 'ArrowUp' ? 5 : -5))
      return
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      if (!e.repeat || lastKeyRef.current !== e.key) {
        repeatCountRef.current = 0
        lastKeyRef.current = e.key
      } else {
        repeatCountRef.current += 1
      }
      const step = getAcceleratedStep(repeatCountRef.current)
      const delta = e.key === 'ArrowRight' ? step : -step
      updateVolume(currentVolumeRef.current + delta)
      return
    }

    if (e.key === 'Home') {
      e.preventDefault()
      updateVolume(0)
      return
    }

    if (e.key === 'End') {
      e.preventDefault()
      updateVolume(100)
      return
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      repeatCountRef.current = 0
      lastKeyRef.current = null
    }
  }

  const IconComponent =
    direction === 'input'
      ? volume === 0
        ? MicOff
        : Mic
      : volume === 0
        ? VolumeX
        : volume < 50
          ? Volume1
          : Volume2

  const title =
    direction === 'input'
      ? t('sound.setMicrophoneVolume')
      : t('sound.setVolume')

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        dir={dir}
        className='sm:max-w-sm gap-0 p-0 overflow-hidden'
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        <DialogHeader dir={dir} className='p-5 pb-4 gap-2 text-start'>
          <DialogTitle className='flex items-center justify-between text-sm font-semibold text-foreground tracking-tight'>
            <div className='flex items-center gap-2.5'>
              <div className='flex size-6 shrink-0 items-center justify-center text-muted-foreground'>
                <IconComponent className='size-4' />
              </div>
              <span>{title}</span>
            </div>

            <span className='text-sm font-mono font-semibold tabular-nums text-muted-foreground'>
              {volume}%
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Slim Capsule Track (always LTR) */}
        <div dir='ltr' className='px-5 pb-5 pt-0'>
          <div
            ref={trackRef}
            dir='ltr'
            role='slider'
            aria-valuenow={volume}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setIsDragging(false)}
            onPointerCancel={() => setIsDragging(false)}
            className='relative h-7 w-full rounded-lg bg-muted/60 p-0.5 select-none cursor-pointer border border-border focus:outline-none'
          >
            {/* Filled bar with smooth transition */}
            <div
              className={`h-full rounded-[6px] bg-primary shadow-xs ${
                isDragging
                  ? 'transition-none'
                  : 'transition-[width] duration-75 ease-out'
              }`}
              style={{ width: `${volume}%` }}
            />

            {/* Subtle step tick marks (25%, 50%, 75%) */}
            <div className='pointer-events-none absolute inset-0 flex items-center justify-between px-[25%]'>
              <div className='h-1.5 w-0.5 bg-foreground/15 rounded-full' />
              <div className='h-1.5 w-0.5 bg-foreground/15 rounded-full' />
              <div className='h-1.5 w-0.5 bg-foreground/15 rounded-full' />
            </div>
          </div>
        </div>

        {/* Footer matching actions-popup (always LTR layout with smart dir for hints) */}
        <div
          dir='ltr'
          className='flex items-center justify-between border-t border-border/50 bg-muted/20 px-3.5 py-2 text-xs text-muted-foreground'
        >
          {/* Left side: Back */}
          <span dir={dir} className='inline-flex items-center gap-1.5'>
            <Kbd dir='ltr'>Esc</Kbd>
            <span>{t('commandPalette.hints.back')}</span>
          </span>

          {/* Right side: Adjust */}
          <span dir={dir} className='inline-flex items-center gap-1.5'>
            <KbdGroup dir='ltr'>
              <Kbd>
                <ArrowLeftRight className='size-4' />
              </Kbd>
              <Kbd>
                <ArrowUpDown className='size-4' />
              </Kbd>
            </KbdGroup>
            <span>{t('sound.adjustVolume')}</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { VolumeDialog }
