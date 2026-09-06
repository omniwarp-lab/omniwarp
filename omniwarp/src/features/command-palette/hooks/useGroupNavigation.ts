import { useCallback, useRef } from 'react'
import { CommandSection } from '@/features/command-palette/types.ts'

interface UseGroupNavigationOptions {
  containerRef: React.RefObject<HTMLElement | null>
  viewportRef: React.RefObject<HTMLElement | null>
  sections: CommandSection[]
}

interface UseGroupNavigationReturn {
  handleKeyDown: (e: React.KeyboardEvent) => boolean
  getSelectedValue: () => string | null
  resetSelection: () => void
}

function useGroupNavigation({
  containerRef,
  viewportRef,
  sections,
}: UseGroupNavigationOptions): UseGroupNavigationReturn {
  const selectedIdRef = useRef<string | null>(null)

  const resetSelection = useCallback(() => {
    selectedIdRef.current = null
  }, [])

  const getSelectedValue = useCallback((): string | null => {
    return (
      selectedIdRef.current ??
      containerRef.current
        ?.querySelector<HTMLElement>('[cmdk-item][aria-selected="true"]')
        ?.getAttribute('data-value') ??
      null
    )
  }, [containerRef])

  const selectItem = useCallback(
    (itemId: string, isFirstSection = false) => {
      selectedIdRef.current = itemId
      const targetEl = containerRef.current?.querySelector<HTMLElement>(
        `[cmdk-item][data-value="${CSS.escape(itemId)}"]`,
      )
      if (!targetEl) return

      targetEl.dispatchEvent(
        new PointerEvent('pointermove', { bubbles: true }),
      )

      if (isFirstSection && viewportRef.current) {
        viewportRef.current.scrollTop = 0
      } else {
        const groupEl = targetEl.closest('[cmdk-group]')
        const headingEl = groupEl?.querySelector<HTMLElement>(
          '[cmdk-group-heading]',
        )
        headingEl?.scrollIntoView({ block: 'nearest' })
        targetEl.scrollIntoView({ block: 'nearest' })
      }
    },
    [containerRef, viewportRef],
  )

  const navigateGroup = useCallback(
    (direction: 'up' | 'down') => {
      const validSections = sections.filter((s) => s.items.length > 0)
      if (validSections.length === 0) return

      const selectedValue = getSelectedValue()

      const currentSectionIndex = validSections.findIndex((section) =>
        section.items.some((item) => item.id === selectedValue),
      )

      if (direction === 'down') {
        if (currentSectionIndex === -1) {
          const target = validSections[0]?.items[0]
          if (target) selectItem(target.id, true)
        } else if (currentSectionIndex < validSections.length - 1) {
          const targetIndex = currentSectionIndex + 1
          const target = validSections[targetIndex]?.items[0]
          if (target) selectItem(target.id, targetIndex === 0)
        }
      } else {
        if (currentSectionIndex === -1) {
          const target = validSections[0]?.items[0]
          if (target) selectItem(target.id, true)
        } else {
          const currentSection = validSections[currentSectionIndex]
          const currentItemIndex = currentSection.items.findIndex(
            (item) => item.id === selectedValue,
          )

          if (currentItemIndex > 0) {
            const target = currentSection.items[0]
            if (target) selectItem(target.id, currentSectionIndex === 0)
          } else if (currentSectionIndex > 0) {
            const targetIndex = currentSectionIndex - 1
            const target = validSections[targetIndex]?.items[0]
            if (target) selectItem(target.id, targetIndex === 0)
          }
        }
      }
    },
    [sections, getSelectedValue, selectItem],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): boolean => {
      if (
        e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey &&
        !e.metaKey &&
        (e.key === 'ArrowDown' || e.key === 'ArrowUp')
      ) {
        e.preventDefault()
        navigateGroup(e.key === 'ArrowDown' ? 'down' : 'up')
        return true
      }

      selectedIdRef.current = null
      return false
    },
    [navigateGroup],
  )

  return {
    handleKeyDown,
    getSelectedValue,
    resetSelection,
  }
}

export { useGroupNavigation }
