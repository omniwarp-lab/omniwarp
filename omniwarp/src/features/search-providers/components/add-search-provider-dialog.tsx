import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSearchProvidersStore } from '@/features/search-providers/store'

interface AddSearchProviderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AddSearchProviderDialog({
  open,
  onOpenChange,
}: AddSearchProviderDialogProps) {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()
  const addProvider = useSearchProvidersStore((s) => s.addProvider)

  const [name, setName] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (open) {
      setName('')
      setUrl('')
    }
  }, [open])

  const handleClose = () => {
    setName('')
    setUrl('')
    onOpenChange(false)
  }

  const canSubmit = Boolean(
    name.trim() &&
      /^https?:\/\/\S+/i.test(url.trim()) &&
      url.includes('{query}'),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    await addProvider(name, url)
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent dir={dir} className='sm:max-w-md gap-0 p-0 overflow-hidden'>
        <form onSubmit={handleSubmit} autoComplete='off'>
          <DialogHeader className='p-5 pb-3 gap-1.5 text-start'>
            <DialogTitle className='text-base font-semibold text-foreground tracking-tight'>
              {t('settings.searchProvidersTable.addProvider')}
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground leading-relaxed'>
              {t('settings.searchProvidersTable.addProviderDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-3.5 px-5 py-3'>
            <div className='flex flex-col gap-1.5 text-start'>
              <label
                htmlFor='provider-name'
                className='text-xs font-medium text-foreground'
              >
                {t('settings.searchProvidersTable.name')}
              </label>
              <input
                id='provider-name'
                type='text'
                autoFocus
                autoComplete='off'
                spellCheck={false}
                placeholder={t(
                  'settings.searchProvidersTable.providerNamePlaceholder',
                )}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='h-9 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/20'
              />
            </div>

            <div className='flex flex-col gap-1.5 text-start'>
              <label
                htmlFor='provider-url'
                className='text-xs font-medium text-foreground'
              >
                {t('settings.searchProvidersTable.urlTemplate')}
              </label>
              <input
                id='provider-url'
                type='text'
                dir='ltr'
                autoComplete='off'
                spellCheck={false}
                placeholder='https://github.com/search?q={query}'
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className='h-9 w-full rounded-lg border border-border bg-background px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/20'
              />
              <span className='text-[11px] text-muted-foreground'>
                {t('settings.searchProvidersTable.urlTemplateHint')}
              </span>
            </div>
          </div>

          <DialogFooter className='border-t border-border/50 bg-muted/20 px-5 py-3 flex items-center justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleClose}
            >
              {t('settings.searchProvidersTable.cancel')}
            </Button>
            <Button type='submit' size='sm' disabled={!canSubmit}>
              {t('settings.searchProvidersTable.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { AddSearchProviderDialog }