import { Kbd } from '@/components/ui/kbd.tsx'
import { ArrowUpDown, CornerDownLeft } from 'lucide-react'

function CommandFooter() {
  return (
    <footer className='flex h-10 shrink-0 items-center justify-between border-t border-border bg-muted/40 px-4 text-xs text-muted-foreground'>
      <span className='flex items-center gap-1.5 font-medium'>OmniWarp</span>
      <div className='flex items-center gap-2 [&_kbd]:me-1 [&_bdi]:flex [&_bdi]:items-center'>
        <bdi>
          <Kbd>
            <ArrowUpDown className='size-4' />
          </Kbd>{' '}
          navigate
        </bdi>
        <bdi>
          <Kbd>
            <CornerDownLeft className='size-4' />
          </Kbd>{' '}
          open
        </bdi>
      </div>
    </footer>
  )
}
export { CommandFooter }
