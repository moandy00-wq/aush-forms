'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import en from './en.json'
import es from './es.json'

type Locale = 'en' | 'es'
type Translations = Record<string, string>

const dictionaries: Record<Locale, Translations> = { en, es }
const STORAGE_KEY = 'aush-forms-locale'

interface I18nContextType {
  locale: Locale
  t: (key: string) => string
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  t: (k) => k,
  setLocale: () => {},
})

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && (saved === 'en' || saved === 'es')) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(STORAGE_KEY, newLocale)
  }, [])

  const t = useCallback(
    (key: string) => dictionaries[locale][key] ?? key,
    [locale]
  )

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  return useContext(I18nContext)
}
