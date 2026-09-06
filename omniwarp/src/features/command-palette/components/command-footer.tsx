import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { ArrowUpDown, CornerDownLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Popover } from '@base-ui/react/popover'

interface CommandFooterProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function CommandFooter({ open, onOpenChange }: CommandFooterProps) {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()

  return (
    <footer className='flex h-10 shrink-0 items-center justify-between border-t border-border bg-muted/40 px-4 text-xs text-muted-foreground'>
      <span className='flex items-center gap-1.5 font-medium'>OmniWarp</span>
      <div className='flex items-center gap-2'>
        <Popover.Root open={open} onOpenChange={onOpenChange}>
          <Popover.Trigger
            openOnHover
            delay={150}
            closeDelay={150}
            className='flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring'
            aria-label={t('commandPalette.hints.shortcuts')}
          >
            <bdi dir={dir} className='flex items-center gap-1.5'>
              <KbdGroup dir='ltr' className='gap-0'>
                <Kbd>Ctrl</Kbd>
                <Kbd>/</Kbd>
              </KbdGroup>
              <span>{t('commandPalette.hints.shortcuts')}</span>
            </bdi>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner
              side='top'
              align={dir === 'rtl' ? 'start' : 'end'}
              sideOffset={8}
              className='z-50'
            >
              <Popover.Popup className='data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-open:zoom-in-95 data-closed:zoom-out-95 duration-150 z-50 flex flex-col gap-2 rounded-xl border border-border/80 bg-popover/95 p-3 text-xs text-popover-foreground shadow-xl backdrop-blur-xl outline-none min-w-56 select-none'>
                <div className='flex items-center justify-between pb-1 border-b border-border/50 text-[10px] font-medium text-muted-foreground'>
                  <span>{t('commandPalette.hints.shortcuts')}</span>
                </div>
                <div className='flex flex-col gap-2 pt-0.5'>
                  <div className='flex items-center justify-between gap-4'>
                    <span className='text-xs text-muted-foreground'>
                      {t('commandPalette.hints.open')}
                    </span>
                    <bdi>
                      <Kbd>
                        <CornerDownLeft className='size-3.5' />
                      </Kbd>
                    </bdi>
                  </div>
                  <div className='flex items-center justify-between gap-4'>
                    <span className='text-xs text-muted-foreground'>
                      {t('commandPalette.hints.navigate')}
                    </span>
                    <bdi>
                      <Kbd>
                        <ArrowUpDown className='size-3.5' />
                      </Kbd>
                    </bdi>
                  </div>
                  <div className='flex items-center justify-between gap-4'>
                    <span className='text-xs text-muted-foreground'>
                      {t('commandPalette.hints.jumpGroups')}
                    </span>
                    <bdi dir={dir}>
                      <KbdGroup dir='ltr' className='gap-0'>
                        <Kbd>Ctrl</Kbd>
                        <Kbd>
                          <ArrowUpDown className='size-3.5' />
                        </Kbd>
                      </KbdGroup>
                    </bdi>
                  </div>
                  <div className='flex items-center justify-between gap-4'>
                    <span className='text-xs text-muted-foreground'>
                      {t('commandPalette.hints.actions')}
                    </span>
                    <bdi dir={dir}>
                      <KbdGroup dir='ltr' className='gap-0'>
                        <Kbd>Alt</Kbd>
                        <Kbd>A</Kbd>
                      </KbdGroup>
                    </bdi>
                  </div>
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </footer>
  )
}
export { CommandFooter }
