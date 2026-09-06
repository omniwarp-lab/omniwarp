import { useTranslation } from 'react-i18next'
import { CornerDownLeft } from 'lucide-react'
import { PaletteItem } from '@/features/command-palette/types'
import { Kbd } from '@/components/ui/kbd'
import { Button } from '@/components/ui/button'
import { CommandIconRenderer } from '@/features/command-palette/components/icon-renderer'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ConfirmationDialogProps {
  item: PaletteItem
  onClose: () => void
  onConfirm: () => Promise<void> | void
}

function ConfirmationDialog({
  item,
  onClose,
  onConfirm,
}: ConfirmationDialogProps) {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      void onConfirm()
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        dir={dir}
        className='sm:max-w-sm gap-0 p-0 overflow-hidden'
        onKeyDown={handleKeyDown}
      >
        <DialogHeader dir={dir} className='p-5 pb-4 gap-2 text-start'>
          <DialogTitle className='flex items-center gap-2.5 text-sm font-semibold text-foreground tracking-tight'>
            <div className='flex size-6 shrink-0 items-center justify-center'>
              <CommandIconRenderer
                icon={item.icon}
                config={item.subgroupConfig}
                isRunning={item.isRunning}
              />
            </div>
            <span>{item.label}</span>
          </DialogTitle>
          {item.confirmationKey && (
            <DialogDescription className='text-xs text-muted-foreground leading-relaxed'>
              {t(item.confirmationKey)}
            </DialogDescription>
          )}
        </DialogHeader>

        <DialogFooter
          dir={dir}
          className='border-t border-border/50 bg-muted/20 px-4 py-3 flex items-center justify-end gap-2.5 sm:flex-row sm:justify-end'
        >
          <Button
            type='button'
            variant='outline'
            size='sm'
            tabIndex={-1}
            onClick={onClose}
          >
            <bdi dir={dir} className='inline-flex items-center gap-1.5'>
              <Kbd dir='ltr' className='bg-white/10'>
                Esc
              </Kbd>
              <span>{t('commandPalette.confirmation.cancel')}</span>
            </bdi>
          </Button>

          <Button
            type='button'
            variant='destructive'
            size='sm'
            tabIndex={-1}
            onClick={() => void onConfirm()}
          >
            <bdi dir={dir} className='inline-flex items-center gap-1.5'>
              <Kbd
                dir='ltr'
                className='bg-destructive/10 text-destructive border border-destructive/25'
              >
                <CornerDownLeft className='size-3.5' />
              </Kbd>
              <span>{item.label}</span>
            </bdi>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ConfirmationDialog }
