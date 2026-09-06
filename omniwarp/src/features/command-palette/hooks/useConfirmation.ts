import { useCallback, useState } from 'react'
import { PaletteItem } from '@/features/command-palette/types.ts'
import { handleSelect } from '@/features/command-palette/handlers.ts'

interface UseConfirmationOptions {
  inputRef: React.RefObject<HTMLInputElement | null>
  onOpenConfirmation?: () => void
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
      if (item.destructive) {
        onOpenConfirmation?.()
        setConfirmingItem(item)
        return
      }
      await handleSelect(item.id)
    },
    [onOpenConfirmation],
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
