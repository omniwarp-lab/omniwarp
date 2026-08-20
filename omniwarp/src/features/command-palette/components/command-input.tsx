import { CommandInput as CommandInputPrimitive } from 'cmdk'
import { SearchIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function CommandInput({
  query,
  setQuery,
}: {
  query: string
  setQuery: (value: string) => void
}) {
  const { t } = useTranslation()

  return (
    <div className='flex shrink-0 items-center gap-2.5 border-b border-border px-4'>
      <SearchIcon className='size-4 shrink-0 text-muted-foreground' />
      <CommandInputPrimitive
        autoFocus
        placeholder={t('commandPalette.placeholder')}
        className='h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground'
        value={query}
        onValueChange={setQuery}
      />
    </div>
  )
}

export { CommandInput }
