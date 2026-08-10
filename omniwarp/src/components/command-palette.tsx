import {
  Command,
  CommandList,
  CommandInput as CommandInputPrimitive,
  defaultFilter,
} from 'cmdk'
import { SearchIcon } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'

function CommandInput() {
  return (
    <div className='flex shrink-0 items-center gap-2.5 border-b border-border px-4'>
      <SearchIcon className='size-4 shrink-0 text-muted-foreground' />
      <CommandInputPrimitive
        autoFocus
        placeholder='Type a command or search…'
        className='h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground'
      />
    </div>
  )
}

function CommandFooter() {
  return (
    <footer className='flex h-10 shrink-0 items-center justify-between border-t border-border bg-muted/40 px-4 text-xs text-muted-foreground'>
      <span className='flex items-center gap-1.5 font-medium'>OmniWarp</span>
    </footer>
  )
}

function CommandPalette() {
  return (
    <Command
      filter={(_, s, k) => defaultFilter('', s, k)}
      className='h-full flex flex-col'
    >
      <CommandInput />
      <ScrollArea className='min-h-0 flex-1 p-2'>
        <CommandList />
      </ScrollArea>
      <CommandFooter />
    </Command>
  )
}

export { CommandPalette }
