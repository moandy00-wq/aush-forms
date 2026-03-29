'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Copy, Check, ExternalLink, LayoutDashboard, Settings, Share2 } from 'lucide-react'

const TOUR_KEY = 'aush-dashboard-tour-seen'

interface TourStep {
  targetSelector: string
  title: string
  description: string
  icon: React.ElementType
  delay: number
}

const steps: TourStep[] = [
  {
    targetSelector: '[data-tour="stats"]',
    title: 'Your Command Center',
    description: 'Track every submission at a glance — total count, unread inbox, and weekly activity. These numbers update in real time as clients submit forms.',
    icon: LayoutDashboard,
    delay: 5000,
  },
  {
    targetSelector: '[data-tour="submissions"]',
    title: 'Submission Inbox',
    description: 'Every client submission lands here. Unread ones get a cyan pulse. Click any row to see the full form data, uploaded documents, and download the branded PDF.',
    icon: LayoutDashboard,
    delay: 5500,
  },
  {
    targetSelector: '[data-tour="nav-settings"]',
    title: 'Settings & Branding',
    description: 'Change your business name, brand color, form URL, and toggle which fields appear on your form. Your public form updates instantly when you save.',
    icon: Settings,
    delay: 5000,
  },
]

interface DashboardTourProps {
  slug: string
}

export function DashboardTour({ slug }: DashboardTourProps) {
  const [active, setActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [showIntro, setShowIntro] = useState(false)
  const [showFinale, setShowFinale] = useState(false)
  const [copied, setCopied] = useState(false)
  const [clonedHtml, setClonedHtml] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return
    const timer = setTimeout(() => {
      setShowIntro(true)
      localStorage.setItem(TOUR_KEY, 'true')
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const startTour = useCallback(() => {
    setShowIntro(false)
    setActive(true)
    setTimeout(() => advanceToStep(0), 600)
  }, [])

  function captureElement(selector: string) {
    const el = document.querySelector(selector) as HTMLElement | null
    if (!el) { setClonedHtml(''); return }
    setClonedHtml(el.outerHTML)
  }

  function advanceToStep(stepIndex: number) {
    if (stepIndex >= steps.length) {
      setCurrentStep(-1)
      setClonedHtml('')
      setTimeout(() => {
        setActive(false)
        setShowFinale(true)
      }, 400)
      return
    }

    // Brief gap between steps
    if (stepIndex > 0) {
      setClonedHtml('')
      setTimeout(() => {
        setCurrentStep(stepIndex)
        captureElement(steps[stepIndex]!.targetSelector)
        timerRef.current = setTimeout(() => advanceToStep(stepIndex + 1), steps[stepIndex]!.delay)
      }, 300)
    } else {
      setCurrentStep(stepIndex)
      captureElement(steps[stepIndex]!.targetSelector)
      timerRef.current = setTimeout(() => advanceToStep(stepIndex + 1), steps[stepIndex]!.delay)
    }
  }

  const handleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    advanceToStep(currentStep + 1)
  }, [currentStep])

  const endTour = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setActive(false)
    setShowIntro(false)
    setShowFinale(false)
    setCurrentStep(-1)
    setClonedHtml('')
    localStorage.setItem(TOUR_KEY, 'true')
  }, [])

  function copyLink() {
    const link = `${window.location.origin}/f/${slug}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const step = currentStep >= 0 ? steps[currentStep] : null

  return (
    <>
      {/* ── Intro splash ── */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />
            <motion.div
              className="relative mx-6 w-full max-w-md text-center"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 12 }}
              >
                <LayoutDashboard className="h-8 w-8 text-white" />
              </motion.div>
              <motion.h2
                className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Welcome to your dashboard
              </motion.h2>
              <motion.p
                className="mt-3 text-sm leading-relaxed text-neutral-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                Let me give you a quick walkthrough of everything at your fingertips. This&apos;ll take about 15 seconds.
              </motion.p>
              <motion.button
                onClick={startTour}
                className="shimmer-line relative mt-8 inline-flex items-center gap-2.5 overflow-hidden rounded-sm bg-gradient-to-r from-cyan-600 to-teal-600 px-8 py-4 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <span className="relative z-10">Show Me Around</span>
                <ArrowRight className="relative z-10 h-4 w-4" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active tour: blurred bg + cloned element centered ── */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />

            {/* Progress */}
            <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-neutral-900">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400"
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Skip */}
            <button
              onClick={endTour}
              className="absolute right-6 top-5 z-10 rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-1.5 text-[11px] font-medium text-neutral-400 transition-all hover:text-white"
            >
              Skip Tour
            </button>

            {/* Cloned element display */}
            <AnimatePresence mode="wait">
              {clonedHtml && (
                <motion.div
                  key={currentStep}
                  className="relative z-10 mx-6 w-full max-w-3xl"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Cloned element rendered as static snapshot */}
                  <div
                    className="rounded border border-cyan-500/20 bg-[#0d0d0d] p-4 sm:p-6 shadow-2xl shadow-cyan-500/5 pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: clonedHtml }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tour description card */}
            <AnimatePresence mode="wait">
              {step && (
                <motion.div
                  key={`desc-${currentStep}`}
                  className="relative z-10 mx-6 mt-6 w-full max-w-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  <div className="overflow-hidden rounded border border-neutral-800 bg-[#0d0d0d]/95 backdrop-blur-xl">
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-cyan-500/10">
                          <step.icon className="h-4 w-4 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-cyan-400">{currentStep + 1} / {steps.length}</span>
                          <h3 className="mt-1 font-[family-name:var(--font-display)] text-base font-bold text-white">{step.title}</h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{step.description}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {steps.map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === currentStep ? 'w-6 bg-cyan-500' : i < currentStep ? 'w-1.5 bg-cyan-500/40' : 'w-1.5 bg-neutral-700'
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          onClick={handleNext}
                          className="flex items-center gap-1.5 rounded-sm bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white"
                        >
                          {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Finale ── */}
      <AnimatePresence>
        {showFinale && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />
            <motion.div
              className="relative mx-6 w-full max-w-lg overflow-hidden rounded border border-neutral-800 bg-[#0d0d0d] shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500" />
              <div className="p-8 sm:p-10 text-center">
                <motion.div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 12 }}
                >
                  <Share2 className="h-8 w-8 text-white" />
                </motion.div>
                <motion.h2
                  className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  You&apos;re all set up
                </motion.h2>
                <motion.p
                  className="mt-2.5 text-sm leading-relaxed text-neutral-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Share your form link with clients to start receiving submissions. Drop it in an email, text, or embed it on your website.
                </motion.p>
                <motion.div
                  className="mt-6 flex items-center gap-2 rounded border border-neutral-800 bg-neutral-900 px-4 py-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <p className="flex-1 truncate text-left font-mono text-sm font-semibold text-cyan-400">
                    {typeof window !== 'undefined' ? window.location.host : ''}/f/{slug}
                  </p>
                  <button
                    onClick={copyLink}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-neutral-800 transition-all hover:bg-neutral-700"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-neutral-400" />}
                  </button>
                </motion.div>
                <motion.div
                  className="mt-6 flex flex-col gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <a
                    href={`/f/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shimmer-line group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-sm bg-gradient-to-r from-cyan-600 to-teal-600 py-3.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                  >
                    <ExternalLink className="relative z-10 h-4 w-4" />
                    <span className="relative z-10">Preview Your Form</span>
                  </a>
                  <button
                    onClick={endTour}
                    className="w-full rounded-sm border border-neutral-800 py-3 text-sm font-medium text-neutral-500 transition-all hover:border-neutral-600 hover:text-neutral-300"
                  >
                    Go to Dashboard
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
