'use client'

import { useTranslation } from '@/lib/i18n/TranslationProvider'

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation()

  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
      <button
        onClick={() => setLocale('en')}
        className={`px-2.5 py-1.5 text-xs font-medium transition-all ${
          locale === 'en'
            ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400'
            : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
        }`}
      >
        EN
      </button>
      <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-700" />
      <button
        onClick={() => setLocale('es')}
        className={`px-2.5 py-1.5 text-xs font-medium transition-all ${
          locale === 'es'
            ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400'
            : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
        }`}
      >
        ES
      </button>
    </div>
  )
}
