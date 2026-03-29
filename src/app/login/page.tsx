'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Fingerprint, Loader2 } from 'lucide-react'

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const slideIn = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="flex min-h-dvh">
      {/* Left — Branding panel */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={slideIn}
        className="relative hidden w-[45%] overflow-hidden bg-gradient-to-br from-cyan-950 via-[#0a1628] to-neutral-950 lg:flex lg:flex-col lg:justify-between"
      >
        <div className="dot-grid absolute inset-0 opacity-60" />
        <div className="relative z-10 p-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-cyan-500">
              <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-white">Aush Forms</span>
          </Link>
        </div>

        <div className="relative z-10 p-10">
          <div className="max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Welcome Back</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-white">
              Your intake pipeline,<br />always running.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              Sign in to manage your forms, review submissions, and keep your client onboarding seamless.
            </p>
          </div>

          {/* Decorative card stack */}
          <div className="mt-10 space-y-3">
            {['Sarah Chen — Financial Planning', 'Marcus Rivera — New Patient', 'Amanda Foster — Case Review'].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded border border-white/5 bg-white/[0.03] px-4 py-3 backdrop-blur-sm"
                style={{ opacity: 1 - i * 0.2 }}
              >
                <div className="h-2 w-2 rounded-full bg-cyan-400" style={{ animationDelay: `${i * 0.3}s` }} />
                <span className="text-xs text-neutral-300">{item}</span>
                <span className="ml-auto text-[10px] text-neutral-500">Just now</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient orb */}
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
      </motion.div>

      {/* Right — Form */}
      <div className="flex flex-1 flex-col justify-center px-6 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-[380px]">
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeIn}>
            <Link href="/" className="mb-10 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>
          </motion.div>

          <motion.div custom={1} initial="hidden" animate="visible" variants={fadeIn} className="flex h-11 w-11 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800">
            <Fingerprint className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          </motion.div>

          <motion.h1 custom={2} initial="hidden" animate="visible" variants={fadeIn} className="mt-5 font-[family-name:var(--font-display)] text-[26px] font-bold tracking-tight">Sign in</motion.h1>
          <motion.p custom={3} initial="hidden" animate="visible" variants={fadeIn} className="mt-1.5 text-sm text-neutral-500">Enter your credentials to access your dashboard.</motion.p>

          <motion.form custom={4} initial="hidden" animate="visible" variants={fadeIn} onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full rounded border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:bg-neutral-900"
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
                className="w-full rounded border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:bg-neutral-900"
              />
            </div>

            {error && (
              <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/20 dark:bg-rose-500/5">
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-sm bg-cyan-600 py-3 text-sm font-semibold text-white transition-all hover:bg-cyan-500 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Continue'}
              </span>
            </button>
          </motion.form>

          <motion.div custom={5} initial="hidden" animate="visible" variants={fadeIn}>
            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
              <span className="text-xs text-neutral-400">or</span>
              <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            </div>

            <p className="mt-6 text-center text-sm text-neutral-500">
              New to Aush Forms?{' '}
              <Link href="/signup" className="font-semibold text-cyan-600 transition-colors hover:text-cyan-500">Create an account</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
