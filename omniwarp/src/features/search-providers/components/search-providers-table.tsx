import { useMemo } from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  SEARCH_PROVIDERS,
  SEARCH_URLS,
  getSearchProviderId,
} from '@/features/search-providers/providers'
import { useSearchProvidersStore } from '@/features/search-providers/store'
import type { CommandItem } from '@/features/command-palette/types'
import { cn } from '@/lib/utils'

const COLUMN_STYLES: Record<string, string> = {
  icon: 'w-10 pl-3.5 pr-1',
  name: 'w-32 px-3',
  url: 'px-3',
  actions: 'w-14 pr-3.5 pl-1 text-right',
}

function SearchProvidersTable() {
  const { t } = useTranslation()
  const searchProviders = useSearchProvidersStore((s) => s.providers)
  const setProviderEnabled = useSearchProvidersStore(
    (s) => s.setProviderEnabled,
  )

  const columns = useMemo<ColumnDef<CommandItem>[]>(
    () => [
      {
        id: 'icon',
        cell: ({ row }) => (
          <img
            src={'src' in row.original.icon ? row.original.icon.src : ''}
            alt=''
            className='size-5 shrink-0 object-contain'
          />
        ),
      },
      {
        id: 'name',
        header: () => t('settings.searchProvidersTable.name'),
        cell: ({ row }) => (
          <span className='text-[13px] font-medium text-foreground whitespace-nowrap'>
            {row.original.label}
          </span>
        ),
      },
      {
        id: 'url',
        header: () => t('settings.searchProvidersTable.urlTemplate'),
        cell: ({ row }) => (
          <span
            className='block truncate font-mono text-xs text-muted-foreground'
            title={SEARCH_URLS[getSearchProviderId(row.original.id)]}
          >
            {SEARCH_URLS[getSearchProviderId(row.original.id)]}
          </span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const providerId = getSearchProviderId(row.original.id)
          const isEnabled = searchProviders[providerId]
          const label = isEnabled
            ? t('settings.searchProvidersTable.hideFromSearch')
            : t('settings.searchProvidersTable.showInSearch')

          return (
            <div className='flex justify-end'>
              <button
                type='button'
                onClick={() =>
                  void setProviderEnabled(providerId, !isEnabled)
                }
                title={label}
                aria-label={label}
                className='group flex size-8 items-center justify-center rounded-lg text-muted-foreground/70 transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95'
              >
                {isEnabled ? (
                  <Eye className='size-4 text-foreground/80 transition-colors group-hover:text-foreground' />
                ) : (
                  <EyeOff className='size-4 text-muted-foreground/40 transition-colors group-hover:text-foreground' />
                )}
              </button>
            </div>
          )
        },
      },
    ],
    [searchProviders, setProviderEnabled, t],
  )

  const table = useReactTable({
    data: SEARCH_PROVIDERS as CommandItem[],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div
      dir='ltr'
      className='overflow-hidden rounded-xl border border-border bg-card'
    >
      <table className='w-full border-collapse text-left text-xs'>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className='border-b border-border bg-muted/40'
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'py-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase',
                    COLUMN_STYLES[header.id],
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className='divide-y divide-border'>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                'transition-colors hover:bg-muted/30',
                !searchProviders[getSearchProviderId(row.original.id)] &&
                  'opacity-50',
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn(
                    'py-2.5 align-middle',
                    COLUMN_STYLES[cell.column.id],
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { SearchProvidersTable }
