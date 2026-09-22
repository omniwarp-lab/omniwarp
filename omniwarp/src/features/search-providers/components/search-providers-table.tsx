import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Globe,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSearchProvidersStore } from '@/features/search-providers/store'
import { AddSearchProviderDialog } from '@/features/search-providers/components/add-search-provider-dialog'
import type { SearchProvider } from '@/features/search-providers/types'
import { cn } from '@/lib/utils'

const COLUMN_STYLES: Record<string, string> = {
  order: 'w-14 pl-3 pr-1',
  icon: 'w-8 px-1',
  name: 'w-32 px-3',
  url: 'px-3 truncate',
  actions: 'w-28 pr-3.5 pl-1 text-right',
}

function ProviderTableIcon({ src }: { src?: string }) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return <Globe className='size-4 text-muted-foreground shrink-0' />
  }

  return (
    <img
      src={src}
      alt=''
      className='size-5 shrink-0 object-contain'
      onError={() => setHasError(true)}
    />
  )
}

function SearchProvidersTable() {
  const { t } = useTranslation()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<SearchProvider | null>(null)

  const providers = useSearchProvidersStore((s) => s.providers)
  const setProviderEnabled = useSearchProvidersStore(
    (s) => s.setProviderEnabled,
  )
  const moveProvider = useSearchProvidersStore((s) => s.moveProvider)
  const removeProvider = useSearchProvidersStore((s) => s.removeProvider)

  const columns = useMemo<ColumnDef<SearchProvider>[]>(
    () => [
      {
        id: 'order',
        header: () => null,
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <button
              type='button'
              disabled={row.index === 0}
              onClick={() => void moveProvider(row.original.id, 'up')}
              title={t('settings.searchProvidersTable.moveUp')}
              aria-label={t('settings.searchProvidersTable.moveUp')}
              className='flex size-5.5 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-20 disabled:pointer-events-none'
            >
              <ChevronUp className='size-3.5' />
            </button>
            <button
              type='button'
              disabled={row.index === providers.length - 1}
              onClick={() => void moveProvider(row.original.id, 'down')}
              title={t('settings.searchProvidersTable.moveDown')}
              aria-label={t('settings.searchProvidersTable.moveDown')}
              className='flex size-5.5 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-20 disabled:pointer-events-none'
            >
              <ChevronDown className='size-3.5' />
            </button>
          </div>
        ),
      },
      {
        id: 'icon',
        cell: ({ row }) => <ProviderTableIcon src={row.original.icon} />,
      },
      {
        id: 'name',
        header: () => t('settings.searchProvidersTable.name'),
        cell: ({ row }) => (
          <span
            className='block truncate text-[13px] font-medium text-foreground'
            title={row.original.name}
          >
            {row.original.name}
          </span>
        ),
      },
      {
        id: 'url',
        header: () => t('settings.searchProvidersTable.urlTemplate'),
        cell: ({ row }) => (
          <span
            className='block truncate font-mono text-xs text-muted-foreground'
            title={row.original.url}
          >
            {row.original.url}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => (
          <div className='flex justify-end'>
            <button
              type='button'
              onClick={() => setIsAddOpen(true)}
              title={t('settings.searchProvidersTable.addProvider')}
              aria-label={t('settings.searchProvidersTable.addProvider')}
              className='group flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95'
            >
              <Plus className='size-4 text-foreground/80 transition-colors group-hover:text-foreground' />
            </button>
          </div>
        ),
        cell: ({ row }) => {
          const isEnabled = row.original.enabled
          const label = isEnabled
            ? t('settings.searchProvidersTable.hideFromSearch')
            : t('settings.searchProvidersTable.showInSearch')

          return (
            <div className='flex items-center justify-end gap-1.5'>
              <button
                type='button'
                onClick={() =>
                  void setProviderEnabled(row.original.id, !isEnabled)
                }
                title={label}
                aria-label={label}
                className='group flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95'
              >
                {isEnabled ? (
                  <Eye className='size-4 text-foreground/80 transition-colors group-hover:text-foreground' />
                ) : (
                  <EyeOff className='size-4 text-muted-foreground/70 transition-colors group-hover:text-foreground' />
                )}
              </button>
              {row.original.isCustom && (
                <>
                  <button
                    type='button'
                    onClick={() => setEditingProvider(row.original)}
                    title={t('settings.searchProvidersTable.editProvider')}
                    aria-label={t('settings.searchProvidersTable.editProvider')}
                    className='group flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95'
                  >
                    <Pencil className='size-3.5 transition-colors' />
                  </button>
                  <button
                    type='button'
                    onClick={() => void removeProvider(row.original.id)}
                    title={t('settings.searchProvidersTable.deleteProvider')}
                    aria-label={t('settings.searchProvidersTable.deleteProvider')}
                    className='group flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-all outline-none hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-95'
                  >
                    <Trash2 className='size-3.5 transition-colors' />
                  </button>
                </>
              )}
            </div>
          )
        },
      },
    ],
    [moveProvider, providers.length, removeProvider, setProviderEnabled, t],
  )

  const table = useReactTable({
    data: providers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
      <div
        dir='ltr'
        className='overflow-hidden rounded-xl border border-border bg-card'
      >
        <table className='w-full table-fixed border-collapse text-left text-xs'>
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
                      'py-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase',
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
                  !row.original.enabled && 'opacity-50',
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

      <AddSearchProviderDialog
        open={isAddOpen || Boolean(editingProvider)}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false)
            setEditingProvider(null)
          }
        }}
        provider={editingProvider}
      />
    </>
  )
}

export { SearchProvidersTable }
