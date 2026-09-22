import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  fetchWebsiteTitle,
  previewSearchProviderIcon,
} from '@/features/search-providers/commands'
import { previewIconUrl } from '@/features/search-providers/providers'
import { useSearchProvidersStore } from '@/features/search-providers/store'
import { autoApplyQueryToUrl } from '@/features/search-providers/url'
import type { SearchProvider } from '@/features/search-providers/types'

interface AddSearchProviderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider?: SearchProvider | null
}

function AddSearchProviderDialog({
  open,
  onOpenChange,
  provider,
}: AddSearchProviderDialogProps) {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()
  const addProvider = useSearchProvidersStore((s) => s.addProvider)
  const updateProvider = useSearchProvidersStore((s) => s.updateProvider)

  const isEdit = Boolean(provider)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [isLoadingTitle, setIsLoadingTitle] = useState(false)
  const [isLoadingIcon, setIsLoadingIcon] = useState(false)
  const [previewKey, setPreviewKey] = useState<string | null>(null)
  const isNameManuallyEditedRef = useRef(false)
  const initialUrlRef = useRef('')
  const reqIdRef = useRef(0)

  useEffect(() => {
    if (!open) return
    setName(provider?.name ?? '')
    setUrl(provider?.url ?? '')
    initialUrlRef.current = provider?.url.trim() ?? ''
    isNameManuallyEditedRef.current = Boolean(provider)
    setIsLoadingTitle(false)
    setIsLoadingIcon(false)
    setPreviewKey(null)
    reqIdRef.current = 0
  }, [open, provider])

  useEffect(() => {
    const trimmed = url.trim()
    if (!trimmed || (isEdit && trimmed === initialUrlRef.current)) {
      setIsLoadingIcon(false)
      setPreviewKey(null)
      setIsLoadingTitle(false)
      return
    }

    const currentReqId = ++reqIdRef.current
    setIsLoadingIcon(true)
    if (!isNameManuallyEditedRef.current) {
      setIsLoadingTitle(true)
    }

    const timer = setTimeout(async () => {
      const [titleResult, iconResult] = await Promise.allSettled([
        !isNameManuallyEditedRef.current
          ? fetchWebsiteTitle(trimmed)
          : Promise.resolve(null),
        previewSearchProviderIcon(trimmed),
      ])

      if (reqIdRef.current !== currentReqId) return

      setIsLoadingTitle(false)
      setIsLoadingIcon(false)
      if (
        titleResult.status === 'fulfilled' &&
        titleResult.value &&
        !isNameManuallyEditedRef.current
      ) {
        setName(titleResult.value)
      }

      setPreviewKey(
        iconResult.status === 'fulfilled' && iconResult.value
          ? iconResult.value.key
          : null,
      )
    }, 400)

    return () => clearTimeout(timer)
  }, [url, isEdit])

  const handleClose = () => {
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

    if (provider) {
      await updateProvider(provider.id, name, url)
    } else {
      await addProvider(name, url)
    }
    handleClose()
  }

  const handleUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').trim()
    const transformed = autoApplyQueryToUrl(text)
    if (transformed !== text) {
      e.preventDefault()
      setUrl(transformed)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        dir={dir}
        className='sm:max-w-md gap-0 p-0 overflow-hidden'
      >
        <form onSubmit={handleSubmit} autoComplete='off'>
          <DialogHeader className='p-5 pb-3 gap-1.5 text-start'>
            <DialogTitle className='text-base font-semibold text-foreground tracking-tight'>
              {isEdit
                ? t('settings.searchProvidersTable.editProvider')
                : t('settings.searchProvidersTable.addProvider')}
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground leading-relaxed'>
              {isEdit
                ? t('settings.searchProvidersTable.editProviderDescription')
                : t('settings.searchProvidersTable.addProviderDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col gap-3.5 px-5 py-3'>
            {/* Read-only automatic icon preview */}
            <div
              dir='ltr'
              className='flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2'
            >
              <div className='flex size-5 shrink-0 items-center justify-center'>
                {isLoadingIcon ? (
                  <Loader2 className='size-4 animate-spin text-muted-foreground' />
                ) : previewKey ? (
                  <img
                    src={previewIconUrl(previewKey)}
                    alt=''
                    className='size-5 object-contain'
                  />
                ) : isEdit && provider?.icon ? (
                  <img
                    src={provider.icon}
                    alt=''
                    className='size-5 object-contain'
                  />
                ) : (
                  <Globe className='size-4 text-muted-foreground' />
                )}
              </div>
              <span
                dir='ltr'
                className={cn(
                  'text-xs font-medium truncate text-left',
                  name.trim() ? 'text-foreground' : 'text-muted-foreground/60',
                )}
              >
                {name.trim() ||
                  t('settings.searchProvidersTable.providerNamePlaceholder')}
              </span>
            </div>

            <div className='flex flex-col gap-1.5 text-start'>
              <label
                htmlFor='provider-name'
                className='text-xs font-medium text-foreground'
              >
                {t('settings.searchProvidersTable.name')}
              </label>
              <div className='relative'>
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
                  onChange={(e) => {
                    setName(e.target.value)
                    isNameManuallyEditedRef.current =
                      e.target.value.trim().length > 0
                  }}
                  className='h-9 w-full rounded-lg border border-border bg-background px-3 pe-8 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/20'
                />
                {isLoadingTitle && (
                  <div className='pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2'>
                    <Loader2 className='size-3.5 animate-spin text-muted-foreground' />
                  </div>
                )}
              </div>
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
                onPaste={handleUrlPaste}
                onChange={(e) => setUrl(e.target.value.replace(/%s/g, '{query}'))}
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
              {isEdit
                ? t('settings.searchProvidersTable.save')
                : t('settings.searchProvidersTable.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { AddSearchProviderDialog }
