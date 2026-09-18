import { useEffect, useState } from 'react'
import { isAutostartEnabled, setAutostart } from '@/features/settings/autostart'

interface UseAutostartReturn {
  enabled: boolean
  loading: boolean
  toggle: (checked?: boolean) => Promise<void>
}

function useAutostart(): UseAutostartReturn {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    isAutostartEnabled()
      .then((val) => {
        if (active) {
          setEnabled(val)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const toggle = async (checked?: boolean) => {
    const next = checked ?? !enabled
    setEnabled(next)
    try {
      await setAutostart(next)
    } catch {
      setEnabled(!next)
    }
  }

  return { enabled, loading, toggle }
}

export { useAutostart }
