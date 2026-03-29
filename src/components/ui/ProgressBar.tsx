'use client'

import { Check } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/TranslationProvider'
import type { StepConfig } from '@/lib/types'

interface ProgressBarProps {
  steps: StepConfig[]
  currentStep: number
  brandColor?: string
}

export function ProgressBar({ steps, currentStep, brandColor }: ProgressBarProps) {
  const { t } = useTranslation()

  return (
    <div>
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i < currentStep
                  ? 'text-white'
                  : i === currentStep
                  ? 'text-white'
                  : 'border border-neutral-300 text-neutral-400 dark:border-neutral-700'
              }`}
              style={
                i <= currentStep
                  ? { backgroundColor: brandColor || '#0891b2' }
                  : undefined
              }
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div
                className="h-px w-8 transition-all"
                style={
                  i < currentStep
                    ? { backgroundColor: brandColor || '#0891b2' }
                    : undefined
                }
              />
            )}
            {i >= currentStep && i < steps.length - 1 && (
              <div className="h-px w-8 bg-neutral-300 dark:bg-neutral-700" style={{ display: i < currentStep ? 'none' : undefined }} />
            )}
          </div>
        ))}
      </div>

      {/* Step label */}
      <p className="mt-3 text-center text-sm font-medium text-neutral-500">
        {t(steps[currentStep]?.titleKey || '')}
      </p>
    </div>
  )
}
