'use client'

import { useState } from 'react'
import { templates } from '@/lib/templates'
import type { TemplateId, FieldConfig } from '@/lib/types'
import { DollarSign, Heart, Scale, FileText, Check, ArrowLeft, ArrowRight, Palette } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign className="h-6 w-6" />,
  Heart: <Heart className="h-6 w-6" />,
  Scale: <Scale className="h-6 w-6" />,
  FileText: <FileText className="h-6 w-6" />,
}

const steps = ['Business Info', 'Template', 'Customize', 'Preview']

const presetColors = [
  '#0891b2', '#0d9488', '#059669', '#2563eb', '#7c3aed',
  '#db2777', '#ea580c', '#d97706', '#65a30d', '#475569',
]

export default function SetupPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugError, setSlugError] = useState<string | null>(null)

  // Form state
  const [businessName, setBusinessName] = useState('')
  const [slug, setSlug] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [template, setTemplate] = useState<TemplateId>('financial')
  const [brandColor, setBrandColor] = useState('#0891b2')
  const [fieldConfig, setFieldConfig] = useState<Record<string, FieldConfig>>({ ...templates.financial.defaultFieldConfig })

  // Initialize field config when template changes
  function selectTemplate(id: TemplateId) {
    setTemplate(id)
    setFieldConfig({ ...templates[id].defaultFieldConfig })
  }

  function validateSlug(val: string) {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlug(clean)
    setSlugError(clean.length > 0 && clean.length < 3 ? 'At least 3 characters' : null)
  }

  function toggleField(field: string) {
    setFieldConfig((prev) => ({
      ...prev,
      [field]: { ...prev[field], enabled: !prev[field]?.enabled },
    }))
  }

  function toggleRequired(field: string) {
    setFieldConfig((prev) => ({
      ...prev,
      [field]: { ...prev[field], required: !prev[field]?.required },
    }))
  }

  const canNext = () => {
    if (step === 0) return businessName.trim().length >= 2 && slug.length >= 3 && !slugError
    if (step === 1) return !!template
    return true
  }

  async function handleSubmit() {
    setError(null)
    setLoading(true)

    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName,
        slug,
        notificationEmail,
        template,
        brandColor,
        fieldConfig,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      setLoading(false)
      return
    }

    await new Promise((r) => setTimeout(r, 500))
    window.location.href = '/dashboard'
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100/40 blur-[120px] dark:bg-cyan-500/5" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <span className="font-[family-name:var(--font-display)] text-xl font-bold">Aush Forms Setup</span>
        </div>

        {/* Progress */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i <= step
                  ? 'bg-gradient-to-br from-cyan-400 to-teal-500 text-white'
                  : 'border border-neutral-300 text-neutral-400 dark:border-neutral-700'
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-6 transition-all ${i < step ? 'bg-cyan-500' : 'bg-neutral-300 dark:bg-neutral-700'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="mb-6 text-center text-sm font-medium text-neutral-500">{steps[step]}</p>

        {/* Card */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">

          {/* Step 1: Business Info */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Tell us about your business</h2>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Business Name *</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Acme Financial Services"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Your Form URL *</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">aushforms.com/f/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => validateSlug(e.target.value)}
                    placeholder="my-business"
                    className="flex-1 rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
                {slugError && <p className="mt-1 text-xs text-rose-500">{slugError}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Notification Email</label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="notifications@company.com"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
                <p className="mt-1 text-xs text-neutral-400">We&apos;ll notify you here when a new form is submitted.</p>
              </div>
            </div>
          )}

          {/* Step 2: Template */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Choose a template</h2>
              <p className="text-sm text-neutral-500">Pick the one that best fits your business.</p>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(templates).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTemplate(t.id)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      template === t.id
                        ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-500/20 dark:bg-cyan-500/5'
                        : 'border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      template === t.id
                        ? 'bg-cyan-500 text-white'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                    }`}>
                      {iconMap[t.iconName]}
                    </div>
                    <p className="mt-3 text-sm font-semibold">{t.name}</p>
                    <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Customize */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Customize your form</h2>

              {/* Brand Color */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Palette className="h-4 w-4" />
                  Brand Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBrandColor(color)}
                      className={`h-8 w-8 rounded-full transition-all ${
                        brandColor === color ? 'ring-2 ring-offset-2 ring-neutral-400 dark:ring-offset-neutral-900' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Field Toggles */}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Form Fields</label>
                <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                  {Object.entries(fieldConfig).map(([field, config]) => (
                    <div key={field} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleField(field)}
                          className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${
                            config.enabled
                              ? 'border-cyan-500 bg-cyan-500 text-white'
                              : 'border-neutral-300 dark:border-neutral-600'
                          }`}
                        >
                          {config.enabled && <Check className="h-3 w-3" />}
                        </button>
                        <span className="text-sm">{field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}</span>
                      </div>
                      {config.enabled && (
                        <button
                          onClick={() => toggleRequired(field)}
                          className={`rounded px-2 py-0.5 text-xs font-medium transition-all ${
                            config.required
                              ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400'
                              : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                          }`}
                        >
                          {config.required ? 'Required' : 'Optional'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: brandColor }}>
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">You&apos;re all set!</h2>
              <p className="text-sm text-neutral-500">Share this link with your clients:</p>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                <p className="font-mono text-sm font-semibold" style={{ color: brandColor }}>
                  {typeof window !== 'undefined' ? window.location.host : ''}/f/{slug}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-left dark:border-neutral-700 dark:bg-neutral-800">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Summary</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-neutral-500">Business:</span> {businessName}</p>
                  <p><span className="text-neutral-500">Template:</span> {templates[template]?.name}</p>
                  <p><span className="text-neutral-500">Fields:</span> {Object.values(fieldConfig).filter((f) => f.enabled).length} enabled</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">{error}</p>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className="flex items-center gap-1 rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: brandColor }}
              >
                {loading ? 'Setting up...' : 'Go to Dashboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
