'use client'

import { useFormContext } from 'react-hook-form'
import { useTranslation } from '@/lib/i18n/TranslationProvider'

interface FormFieldProps {
  name: string
  labelKey?: string
  label?: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'select' | 'textarea'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: { value: string; labelKey?: string; label?: string }[]
  autoFilled?: boolean
}

export function FormField({
  name,
  labelKey,
  label,
  type = 'text',
  placeholder,
  required,
  disabled,
  options,
  autoFilled,
}: FormFieldProps) {
  const { register, formState: { errors } } = useFormContext()
  const { t } = useTranslation()

  const displayLabel = labelKey ? t(labelKey) : label || name
  const error = errors[name]
  const errorMessage = error?.message as string | undefined

  const baseClasses = `w-full rounded border bg-white px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 dark:bg-neutral-800 dark:text-white ${
    error
      ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
      : 'border-neutral-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-neutral-700'
  } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {displayLabel}
          {required && <span className="ml-0.5 text-rose-400">*</span>}
        </label>
        {autoFilled && (
          <span className="rounded bg-cyan-50 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400">
            {t('upload.autoFilled')}
          </span>
        )}
      </div>

      {type === 'textarea' ? (
        <textarea
          {...register(name)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={baseClasses}
        />
      ) : type === 'select' ? (
        <select
          {...register(name)}
          disabled={disabled}
          className={baseClasses}
        >
          <option value="">{placeholder || `Select ${displayLabel}`}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.labelKey ? t(opt.labelKey) : opt.label || opt.value}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          {...register(name)}
          placeholder={placeholder}
          disabled={disabled}
          className={baseClasses}
        />
      )}

      {errorMessage && (
        <p className="mt-1 text-xs text-rose-500">{errorMessage}</p>
      )}
    </div>
  )
}
