'use client'

import { TranslationProvider } from '@/lib/i18n/TranslationProvider'
import { FormWizard } from '@/components/FormWizard'
import { LanguageToggle } from '@/components/ui/LanguageToggle'
import type { Profile } from '@/lib/types'

interface Props {
  profile: Profile
}

export function PublicFormClient({ profile }: Props) {
  return (
    <TranslationProvider>
      <div className="min-h-dvh bg-white dark:bg-neutral-950">
        {/* Header */}
        <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              {profile.business_logo_url ? (
                <img src={profile.business_logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: profile.brand_color }}
                >
                  <span className="text-sm font-bold">{profile.business_name.charAt(0)}</span>
                </div>
              )}
              <span className="font-[family-name:var(--font-display)] text-lg font-bold text-neutral-950 dark:text-white">
                {profile.business_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
            </div>
          </div>
        </nav>

        {/* Form */}
        <div className="mx-auto max-w-2xl px-6 py-10">
          <FormWizard profile={profile} />
        </div>

        {/* Footer */}
        <div className="pb-8 text-center">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            Powered by <span className="font-semibold">Aush Forms</span>
          </p>
        </div>
      </div>
    </TranslationProvider>
  )
}
