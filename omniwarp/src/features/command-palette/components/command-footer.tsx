import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { ArrowUpDown, CornerDownLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function CommandFooter() {
  const { t, i18n } = useTranslation()
  const dir = i18n.dir()

  return (
    <footer className='flex h-10 shrink-0 items-center justify-between border-t border-border bg-muted/40 px-4 text-xs text-muted-foreground'>
      <span className='flex items-center gap-1.5 font-medium'>OmniWarp</span>
      <div className='flex items-center gap-2 [&_bdi]:flex [&_bdi]:items-center [&_bdi:not([dir="rtl"])>*:first-child]:me-1 [&_bdi[dir="rtl"]>*:first-child]:ml-1'>
        <bdi>
          <Kbd>
            <ArrowUpDown className='size-4' />
          </Kbd>{' '}
          {t('commandPalette.hints.navigate')}
        </bdi>
        <bdi>
          <Kbd>
            <CornerDownLeft className='size-4' />
          </Kbd>{' '}
          {t('commandPalette.hints.open')}
        </bdi>
        <bdi dir={dir}>
          <KbdGroup dir='ltr' className='gap-0'>
            <Kbd>Alt</Kbd>
            <Kbd>A</Kbd>
          </KbdGroup>
          {t('commandPalette.hints.actions')}
        </bdi>
      </div>
    </footer>
  )
}
export { CommandFooter }
