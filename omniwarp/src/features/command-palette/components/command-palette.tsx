import { Command, CommandList } from 'cmdk'
import {
  ActionsPopup,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/features/command-palette/components'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { useCommandStore } from '@/features/command-palette/store.ts'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCommandPaletteSections } from '@/features/command-palette/hooks/useCommandPaletteSections.ts'
import { useGroupNavigation } from '@/features/command-palette/hooks/useGroupNavigation.ts'
import { PaletteItem } from '@/features/command-palette/types'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useTranslation } from 'react-i18next'

function CommandPalette() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [activeItem, setActiveItem] = useState<PaletteItem | null>(null)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  const groups = useCommandStore((s) => s.groups)
  const sections = useCommandPaletteSections(groups, query)

  const flatItems = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections],
  )

  const {
    handleKeyDown: handleGroupNavigationKeyDown,
    getSelectedValue,
    resetSelection,
  } = useGroupNavigation({
    containerRef,
    viewportRef,
    sections,
  })

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

  useEffect(() => {
    resetSelection()
    if (!query) {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = 0
      }

      const firstItem =
        containerRef.current?.querySelector<HTMLElement>('[cmdk-item]')
      firstItem?.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true }),
      )
    }
  }, [query, resetSelection])

  const resolveActiveItem = (): PaletteItem | null => {
    const selectedValue = getSelectedValue()
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
      setIsShortcutsOpen(false)
      const target = resolveActiveItem()
      if (target) {
        setActiveItem(target)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.defaultPrevented) return

    if (e.altKey && (e.key.toLowerCase() === 'a' || e.code === 'KeyA')) {
      e.preventDefault()
      handleToggleActions()
      return
    }

    if (
      e.ctrlKey &&
      !e.altKey &&
      !e.metaKey &&
      (e.key === '/' || e.key === '?' || e.code === 'Slash')
    ) {
      e.preventDefault()
      setIsShortcutsOpen((prev) => !prev)
      return
    }

    if (e.key === 'Escape') {
      e.preventDefault()
      if (isShortcutsOpen) {
        setIsShortcutsOpen(false)
      } else if (activeItem) {
        handleCloseActions()
      } else if (query) {
        setQuery('')
      } else {
        void getCurrentWindow().hide()
      }
      return
    }

    if (activeItem) return

    if (handleGroupNavigationKeyDown(e)) {
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
        <ScrollArea viewportRef={viewportRef} className='min-h-0 flex-1 p-2'>
          <CommandList>
            <CommandEmpty>{t('commandPalette.noResults')}</CommandEmpty>
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
        <CommandFooter
          open={isShortcutsOpen}
          onOpenChange={setIsShortcutsOpen}
        />
      </Command>

      {activeItem && (
        <ActionsPopup item={activeItem} onClose={handleCloseActions} />
      )}
    </div>
  )
}
export { CommandPalette }
