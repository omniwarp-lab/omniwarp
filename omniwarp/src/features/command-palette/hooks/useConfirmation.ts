import { useCallback, useState } from 'react'
import { PaletteItem } from '@/features/command-palette/types.ts'
import { handleSelect } from '@/features/command-palette/handlers.ts'
import { AudioDirection } from '@/features/sound/types'

interface UseConfirmationOptions {
  inputRef: React.RefObject<HTMLInputElement | null>
  onOpenConfirmation?: () => void
  onOpenVolume?: (direction: AudioDirection) => Promise<void>
}

interface UseConfirmationReturn {
  confirmingItem: PaletteItem | null
  handleItemSelect: (item: PaletteItem) => Promise<void>
  handleCloseConfirmation: () => void
  handleConfirmAction: () => Promise<void>
}

function useConfirmation({
  inputRef,
  onOpenConfirmation,
  onOpenVolume,
}: UseConfirmationOptions): UseConfirmationReturn {
  const [confirmingItem, setConfirmingItem] = useState<PaletteItem | null>(null)

  const handleCloseConfirmation = useCallback(() => {
    setConfirmingItem(null)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }, [inputRef])

  const handleItemSelect = useCallback(
    async (item: PaletteItem) => {
      if (item.id === 'commands:sound.setVolume') {
        await onOpenVolume?.('output')
        return
      }
      if (item.id === 'commands:sound.setMicrophoneVolume') {
        await onOpenVolume?.('input')
        return
      }
      if (item.destructive) {
        onOpenConfirmation?.()
        setConfirmingItem(item)
        return
      }
      await handleSelect(item.id)
    },
    [onOpenConfirmation, onOpenVolume],
  )

  const handleConfirmAction = useCallback(async () => {
    if (!confirmingItem) return
    const itemToRun = confirmingItem
    setConfirmingItem(null)
    await handleSelect(itemToRun.id)
  }, [confirmingItem])

  return {
    confirmingItem,
    handleItemSelect,
    handleCloseConfirmation,
    handleConfirmAction,
  }
}

export { useConfirmation }
