'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, UserPlus, Loader2, Check } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordChecks = [
    { label: 'At least 6 characters', valid: password.length >= 6 },
    { label: 'Passwords match', valid: password.length > 0 && password === confirmPassword },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    await supabase.auth.signInWithPassword({ email, password })
    window.location.href = '/setup'
  }

  return (
    <div className="flex min-h-dvh">
      {/* Left — Branding panel */}
      <div className="relative hidden w-[45%] overflow-hidden bg-gradient-to-br from-cyan-950 via-[#0a1628] to-neutral-950 lg:flex lg:flex-col lg:justify-between">
        <div className="dot-grid absolute inset-0 opacity-60" />
        <div className="relative z-10 p-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500">
              <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-white">Aush Forms</span>
          </Link>
        </div>

        <div className="relative z-10 p-10">
          <div className="max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Get Started</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-white">
              Build your intake<br />form in minutes.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              Choose a template, customize your branding, and share your link. Your clients fill out the form — you get the data instantly.
            </p>
          </div>

          {/* Feature pills */}
          <div className="mt-10 flex flex-wrap gap-2">
            {['OCR Auto-Fill', '4 Templates', 'PDF Export', 'Multi-Language', 'Dark Mode', 'Mobile Ready'].map((feature) => (
              <div key={feature} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-neutral-300">
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-teal-500/10 blur-[100px]" />
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 flex-col justify-center px-6 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-[380px]">
          <Link href="/" className="mb-10 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <UserPlus className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </div>

          <h1 className="mt-5 font-[family-name:var(--font-display)] text-[26px] font-bold tracking-tight">Create account</h1>
          <p className="mt-1.5 text-sm text-neutral-500">Start building smart intake forms for your business.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:bg-neutral-900"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:bg-neutral-900"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:bg-neutral-900"
              />
            </div>

            {/* Password checks */}
            <div className="space-y-1.5">
              {passwordChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-2">
                  <div className={`flex h-4 w-4 items-center justify-center rounded-full transition-all ${
                    check.valid ? 'bg-emerald-500' : 'border border-neutral-300 dark:border-neutral-700'
                  }`}>
                    {check.valid && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  <span className={`text-xs ${check.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/5">
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-600 py-3 text-sm font-semibold text-white transition-all hover:bg-cyan-500 disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Creating account...' : 'Create Account'}
              </span>
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            <span className="text-xs text-neutral-400">or</span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-cyan-600 transition-colors hover:text-cyan-500">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
