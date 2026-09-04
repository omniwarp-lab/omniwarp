import { Command, CommandList } from 'cmdk'
import {
  ActionsPopup,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/features/command-palette/components'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { useCommandStore } from '@/features/command-palette/store.ts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCommandPaletteSections } from '@/features/command-palette/hooks/useCommandPaletteSections.ts'
import { PaletteItem } from '@/features/command-palette/types'
import { getCurrentWindow } from '@tauri-apps/api/window'

function CommandPalette() {
  const [query, setQuery] = useState('')
  const [activeItem, setActiveItem] = useState<PaletteItem | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const groups = useCommandStore((s) => s.groups)
  const sections = useCommandPaletteSections(groups, query)

  const flatItems = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections],
  )

  useEffect(() => {
    const focusInput = () => {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }

    const unlisten = getCurrentWindow().onFocusChanged(
      ({ payload: focused }) => {
        if (focused) {
          focusInput()
        }
      },
    )

    window.addEventListener('focus', focusInput)

    return () => {
      void unlisten.then((fn) => fn())
      window.removeEventListener('focus', focusInput)
    }
  }, [])

  const resolveActiveItem = (): PaletteItem | null => {
    const selectedEl = containerRef.current?.querySelector<HTMLElement>(
      '[cmdk-item][aria-selected="true"]',
    )
    const selectedValue = selectedEl?.getAttribute('data-value')
    if (selectedValue) {
      const found = flatItems.find((item) => item.id === selectedValue)
      if (found) return found
    }
    return flatItems[0] ?? null
  }

  const handleCloseActions = () => {
    setActiveItem(null)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  const handleToggleActions = () => {
    if (activeItem) {
      handleCloseActions()
    } else {
      const target = resolveActiveItem()
      if (target) {
        setActiveItem(target)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey && e.key.toLowerCase() === 'a') {
      e.preventDefault()
      handleToggleActions()
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      if (activeItem) {
        handleCloseActions()
      } else if (query) {
        setQuery('')
      } else {
        void getCurrentWindow().hide()
      }
      return
    }
  }

  return (
    <div ref={containerRef} className='relative h-full flex flex-col'>
      <Command
        className='h-full flex flex-col'
        shouldFilter={false}
        vimBindings={false}
        onKeyDown={handleKeyDown}
      >
        <CommandInput
          inputRef={inputRef}
          query={query}
          setQuery={setQuery}
          onKeyDown={handleKeyDown}
        />
        <ScrollArea className='min-h-0 flex-1 p-2'>
          <CommandList>
            {sections.map((section) => (
              <CommandGroup key={section.key} heading={section.heading}>
                {section.items.map((item) => (
                  <CommandItem
                    key={item.id}
                    item={item}
                    onContextMenu={(_e, targetItem) =>
                      setActiveItem(targetItem)
                    }
                  />
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </ScrollArea>
        <CommandFooter />
      </Command>

      {activeItem && (
        <ActionsPopup item={activeItem} onClose={handleCloseActions} />
      )}
    </div>
  )
}
export { CommandPalette }
