import { CommandInput as CommandInputPrimitive } from 'cmdk'
import { SearchIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import React from 'react'

interface CommandInputProps {
  query: string
  setQuery: (value: string) => void
  inputRef?: React.Ref<HTMLInputElement>
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

function CommandInput({
  query,
  setQuery,
  inputRef,
  onKeyDown,
}: CommandInputProps) {
  const { t } = useTranslation()

  return (
    <div className='flex shrink-0 items-center gap-2.5 border-b border-border px-4'>
      <SearchIcon className='size-4 shrink-0 text-muted-foreground' />
      <CommandInputPrimitive
        ref={inputRef}
        autoFocus
        placeholder={t('commandPalette.placeholder')}
        className='h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground'
        value={query}
        onValueChange={setQuery}
        onKeyDown={onKeyDown}
      />
    </div>
  )
}

export { CommandInput }
