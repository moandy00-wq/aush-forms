'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { templates } from '@/lib/templates'
import type { Profile, FieldConfig } from '@/lib/types'
import { Check, Palette, Save } from 'lucide-react'

const presetColors = [
  '#0891b2', '#0d9488', '#059669', '#2563eb', '#7c3aed',
  '#db2777', '#ea580c', '#d97706', '#65a30d', '#475569',
]

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [businessName, setBusinessName] = useState('')
  const [slug, setSlug] = useState('')
  const [notificationEmail, setNotificationEmail] = useState('')
  const [brandColor, setBrandColor] = useState('#0891b2')
  const [fieldConfig, setFieldConfig] = useState<Record<string, FieldConfig>>({})

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
        setBusinessName(data.business_name)
        setSlug(data.slug)
        setNotificationEmail(data.notification_email)
        setBrandColor(data.brand_color)
        setFieldConfig(data.field_config as Record<string, FieldConfig>)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    setSaved(false)

    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName,
        slug,
        notificationEmail,
        template: profile.template,
        brandColor,
        fieldConfig,
      }),
    })

    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="px-8 py-8">
      <div className="max-w-2xl">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-neutral-950 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage your business profile and form configuration.</p>

        <div className="mt-8 space-y-6">
          {/* Business Info */}
          <div className="rounded border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Business Information</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Form URL</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">/f/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="flex-1 rounded border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">Notification Email</label>
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  className="w-full rounded border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="rounded border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-950 dark:text-white">
              <Palette className="h-4 w-4" />
              Brand Color
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
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

          {/* Field Config */}
          <div className="rounded border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="text-sm font-semibold text-neutral-950 dark:text-white">Form Fields</h2>
            <p className="mt-1 text-xs text-neutral-500">Toggle fields on/off and set required status.</p>
            <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
              {Object.entries(fieldConfig).map(([field, config]) => (
                <div key={field} className="flex items-center justify-between rounded-sm px-2 py-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800">
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

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-sm bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-cyan-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
