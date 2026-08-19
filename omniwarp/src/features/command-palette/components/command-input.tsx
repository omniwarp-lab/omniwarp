import { CommandInput as CommandInputPrimitive } from 'cmdk'
import { SearchIcon } from 'lucide-react'

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

export { CommandInput }
