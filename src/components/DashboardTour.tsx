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
  zoom: number
  delay: number
}

const steps: TourStep[] = [
  {
    targetSelector: '[data-tour="stats"]',
    title: 'Your Command Center',
    description: 'Track every submission at a glance — total count, unread inbox, and weekly activity. These numbers update in real time as clients submit forms.',
    icon: LayoutDashboard,
    zoom: 1.3,
    delay: 5000,
  },
  {
    targetSelector: '[data-tour="submissions"]',
    title: 'Submission Inbox',
    description: 'Every client submission lands here. Unread ones get a cyan pulse. Click any row to see the full form data, uploaded documents, and download the branded PDF.',
    icon: LayoutDashboard,
    zoom: 1.2,
    delay: 5500,
  },
  {
    targetSelector: '[data-tour="nav-settings"]',
    title: 'Settings & Branding',
    description: 'Change your business name, brand color, form URL, and toggle which fields appear on your form. Your public form updates instantly when you save.',
    icon: Settings,
    zoom: 1.6,
    delay: 5000,
  },
  {
    targetSelector: '[data-tour="form-link"]',
    title: 'Your Shareable Link',
    description: 'This is the link you give to clients. They visit it, fill out your branded form, upload documents, and submit — you get notified instantly.',
    icon: ExternalLink,
    zoom: 1.8,
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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-start on first visit
  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return
    const timer = setTimeout(() => {
      setShowIntro(true)
      localStorage.setItem(TOUR_KEY, 'true')
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Start the tour after intro
  const startTour = useCallback(() => {
    setShowIntro(false)
    setActive(true)
    // Small delay then zoom to first step
    setTimeout(() => advanceToStep(0), 600)
  }, [])

  function advanceToStep(stepIndex: number) {
    if (stepIndex >= steps.length) {
      // End tour, show finale
      setCurrentStep(-1)
      resetZoom()
      setTimeout(() => {
        setActive(false)
        setShowFinale(true)
      }, 500)
      return
    }

    setCurrentStep(stepIndex)
    zoomToElement(steps[stepIndex]!)

    // Auto-advance
    timerRef.current = setTimeout(() => advanceToStep(stepIndex + 1), steps[stepIndex]!.delay)
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
    resetZoom()
    localStorage.setItem(TOUR_KEY, 'true')
  }, [])

  function zoomToElement(step: TourStep) {
    const el = document.querySelector(step.targetSelector) as HTMLElement | null
    const wrapper = document.querySelector('[data-tour-wrapper]') as HTMLElement | null
    if (!el || !wrapper) return

    const rect = el.getBoundingClientRect()
    const wrapperRect = wrapper.getBoundingClientRect()

    // Calculate center of target relative to wrapper
    const targetCenterX = rect.left + rect.width / 2 - wrapperRect.left
    const targetCenterY = rect.top + rect.height / 2 - wrapperRect.top

    // Calculate translation to center the target on screen
    const screenCenterX = window.innerWidth / 2
    const screenCenterY = window.innerHeight / 2

    const translateX = screenCenterX - targetCenterX * step.zoom
    const translateY = screenCenterY - targetCenterY * step.zoom

    wrapper.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)'
    wrapper.style.transformOrigin = '0 0'
    wrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${step.zoom})`
  }

  function resetZoom() {
    const wrapper = document.querySelector('[data-tour-wrapper]') as HTMLElement | null
    if (!wrapper) return
    wrapper.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
    wrapper.style.transform = 'translate(0, 0) scale(1)'
  }

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
                Let me give you a quick walkthrough of everything at your fingertips. This&apos;ll take about 20 seconds.
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

      {/* ── Active tour overlay ── */}
      <AnimatePresence>
        {active && (
          <>
            {/* Subtle vignette — lets zoomed content show through */}
            <motion.div
              className="pointer-events-none fixed inset-0 z-[150]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ background: 'radial-gradient(ellipse 50% 45% at 50% 45%, transparent 0%, rgba(0,0,0,0.4) 100%)' }}
            />

            {/* Progress */}
            <motion.div
              className="fixed left-0 right-0 top-0 z-[201] h-1 bg-neutral-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400"
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>

            {/* Skip */}
            <motion.button
              onClick={endTour}
              className="fixed right-6 top-5 z-[201] rounded-full border border-neutral-700 bg-neutral-900/90 px-3 py-1.5 text-[11px] font-medium text-neutral-400 backdrop-blur-sm transition-all hover:text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Skip Tour
            </motion.button>

            {/* Tour card */}
            <AnimatePresence mode="wait">
              {step && (
                <motion.div
                  key={currentStep}
                  className="fixed bottom-8 left-1/2 z-[201] w-full max-w-md -translate-x-1/2 px-6"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="overflow-hidden rounded border border-neutral-800 bg-[#0d0d0d]/95 shadow-2xl backdrop-blur-xl">
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-cyan-500/10">
                          <step.icon className="h-4 w-4 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold text-cyan-400">
                            {currentStep + 1} / {steps.length}
                          </span>
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
          </>
        )}
      </AnimatePresence>

      {/* ── Finale — Share your link ── */}
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

                {/* Link display + copy */}
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
