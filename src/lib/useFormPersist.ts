'use client'

import { useEffect, useCallback, useRef } from 'react'
import type { UseFormReturn } from 'react-hook-form'

const EXPIRY_DAYS = 7

interface PersistData {
  values: Record<string, unknown>
  step: number
  timestamp: number
}

export function useFormPersist(
  methods: UseFormReturn<Record<string, unknown>>,
  storageKey: string,
  currentStep: number,
  setStep: (step: number) => void
) {
  const { watch, reset } = methods
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedRef = useRef(false)

  // Restore on mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    if (typeof window === 'undefined') return

    const saved = localStorage.getItem(storageKey)
    if (!saved) return

    try {
      const parsed: PersistData = JSON.parse(saved)

      // Check expiry
      const daysSaved = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24)
      if (daysSaved > EXPIRY_DAYS) {
        localStorage.removeItem(storageKey)
        return
      }

      // Restore form values (exclude any file-like data)
      const cleanValues: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(parsed.values)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          cleanValues[key] = value
        }
      }

      reset(cleanValues, { keepDefaultValues: true })

      if (parsed.step > 0) {
        setStep(parsed.step)
      }
    } catch {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey, reset, setStep])

  // Auto-save on change (debounced)
  useEffect(() => {
    const subscription = watch((values) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(() => {
        if (typeof window === 'undefined') return

        // Only save serializable values
        const cleanValues: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(values)) {
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            cleanValues[key] = value
          }
        }

        const data: PersistData = {
          values: cleanValues,
          step: currentStep,
          timestamp: Date.now(),
        }

        localStorage.setItem(storageKey, JSON.stringify(data))
      }, 1000)
    })

    return () => {
      subscription.unsubscribe()
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [watch, storageKey, currentStep])

  const clearSaved = useCallback(() => {
    localStorage.removeItem(storageKey)
  }, [storageKey])

  return { clearSaved }
}
