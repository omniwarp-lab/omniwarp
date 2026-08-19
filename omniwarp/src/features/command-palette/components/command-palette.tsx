import { Command, CommandList } from 'cmdk'
import {
  CommandFooter,
  CommandInput,
} from '@/features/command-palette/components'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'

function CommandPalette() {
  return (
    <Command className='h-full flex flex-col'>
      <CommandInput />
      <ScrollArea className='min-h-0 flex-1 p-2'>
        <CommandList />
      </ScrollArea>
      <CommandFooter />
    </Command>
  )
}
export { CommandPalette }
