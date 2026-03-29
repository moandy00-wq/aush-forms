'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X, Play, Sparkles, Rocket, Compass } from 'lucide-react'
import Link from 'next/link'

interface TourStep {
  targetId: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'center'
  delay: number
}

const tourSteps: TourStep[] = [
  {
    targetId: '__hero',
    title: 'Welcome to Aush Forms',
    description: 'This is where your clients\' first impression begins. A clean, professional landing page that builds trust instantly.',
    position: 'center',
    delay: 4000,
  },
  {
    targetId: 'how-it-works',
    title: 'The Workflow',
    description: 'Five simple steps — from picking a template to receiving submissions. Watch each step light up as the workflow plays out.',
    position: 'top',
    delay: 5000,
  },
  {
    targetId: 'templates',
    title: 'Industry Templates',
    description: 'Financial, Medical, Legal, or General — each template comes pre-loaded with the right fields. Clients see a form tailored to your business.',
    position: 'top',
    delay: 4500,
  },
  {
    targetId: 'features',
    title: 'Powerful Features',
    description: 'OCR document scanning, auto-save, PDF generation, multi-language support, notifications — everything built in. Watch the orbit showcase each one.',
    position: 'top',
    delay: 7000,
  },
  {
    targetId: '__testimonials',
    title: 'Real Results',
    description: 'Businesses are cutting intake time from 20 minutes to 5. Your clients fill forms faster, you get data instantly.',
    position: 'top',
    delay: 4000,
  },
]

const TOUR_STORAGE_KEY = 'aush-forms-tour-seen'

export function GuidedTour() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [touring, setTouring] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [noteVisible, setNoteVisible] = useState(false)
  const [showFinale, setShowFinale] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lenisRef = useRef<{ scrollTo: (target: HTMLElement, opts: { offset: number; duration: number }) => void } | null>(null)

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_STORAGE_KEY)
    if (seen) return
    const timer = setTimeout(() => setShowPrompt(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as unknown as { __lenis?: typeof lenisRef.current }).__lenis) {
        lenisRef.current = (window as unknown as { __lenis: typeof lenisRef.current }).__lenis
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const scrollToSection = useCallback((targetId: string) => {
    if (targetId === '__hero') {
      window.scrollTo({ top: 0 })
      return
    }

    const el = document.getElementById(targetId)

    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -100, duration: 1.8 })
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    if (targetId === 'how-it-works') {
      setTimeout(() => {
        window.dispatchEvent(new Event('workflow-tour-trigger'))
      }, 2000)
    }

    if (targetId === 'features') {
      const nodesToShow = [0, 2, 5]
      let i = 0
      const showNext = () => {
        if (i >= nodesToShow.length) {
          window.dispatchEvent(new CustomEvent('orbital-tour', { detail: { action: 'deselect' } }))
          return
        }
        window.dispatchEvent(new CustomEvent('orbital-tour', { detail: { action: 'select', nodeIndex: nodesToShow[i] } }))
        i++
        setTimeout(showNext, 1200)
      }
      setTimeout(showNext, 2200)
    }
  }, [])

  const startTour = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    setShowPrompt(false)
    setTouring(true)
    setCurrentStep(0)

    window.scrollTo({ top: 0 })
    setTimeout(() => {
      setNoteVisible(true)
      timerRef.current = setTimeout(() => advanceStep(0), tourSteps[0].delay)
    }, 800)
  }, [])

  const advanceStep = useCallback((fromStep: number) => {
    const nextStep = fromStep + 1

    // If we've gone through all steps, show the finale
    if (nextStep >= tourSteps.length) {
      setNoteVisible(false)
      setTimeout(() => {
        setTouring(false)
        setShowFinale(true)
      }, 500)
      return
    }

    setNoteVisible(false)

    setTimeout(() => {
      setCurrentStep(nextStep)
      scrollToSection(tourSteps[nextStep].targetId)

      setTimeout(() => {
        setNoteVisible(true)
        if (tourSteps[nextStep].delay > 0) {
          timerRef.current = setTimeout(() => advanceStep(nextStep), tourSteps[nextStep].delay)
        }
      }, 2200)
    }, 400)
  }, [scrollToSection])

  const handleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    advanceStep(currentStep)
  }, [currentStep, advanceStep])

  const endTour = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setTouring(false)
    setNoteVisible(false)
    setShowFinale(false)
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
  }, [])

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    setShowPrompt(false)
  }, [])

  const step = tourSteps[currentStep]

  return (
    <>
      {/* ── Initial Prompt ── */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="mx-6 w-full max-w-md overflow-hidden rounded border border-neutral-800 bg-[#111] shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-600" />

              <div className="p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded bg-gradient-to-br from-cyan-500 to-teal-500">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>

                <h2 className="mt-5 font-[family-name:var(--font-display)] text-xl font-bold text-white">
                  Want a quick tour?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  We&apos;ll walk you through how Aush Forms works in 30 seconds. Sit back and watch — it&apos;s like a short movie.
                </p>

                <div className="mt-7 flex flex-col gap-2.5">
                  <button
                    onClick={startTour}
                    className="group flex w-full items-center justify-center gap-2.5 rounded-sm bg-gradient-to-r from-cyan-600 to-teal-600 py-3.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                  >
                    <Play className="h-4 w-4" />
                    Take the Tour
                  </button>
                  <button
                    onClick={dismissPrompt}
                    className="w-full rounded-sm border border-neutral-800 py-3 text-sm font-medium text-neutral-500 transition-all hover:border-neutral-700 hover:text-neutral-300"
                  >
                    Skip, I&apos;ll explore myself
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tour Overlay ── */}
      <AnimatePresence>
        {touring && (
          <>
            <motion.div
              className="pointer-events-none fixed inset-0 z-[90]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
              }}
            />

            <motion.div
              className="fixed left-0 right-0 top-0 z-[101] h-1 bg-neutral-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400"
                animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </motion.div>

            <motion.button
              onClick={endTour}
              className="fixed right-6 top-5 z-[101] flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/90 px-3 py-1.5 text-[11px] font-medium text-neutral-400 backdrop-blur-sm transition-all hover:border-neutral-700 hover:text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              <X className="h-3 w-3" />
              Skip Tour
            </motion.button>

            <AnimatePresence mode="wait">
              {noteVisible && step && (
                <motion.div
                  key={currentStep}
                  className="fixed bottom-8 left-1/2 z-[101] w-full max-w-lg -translate-x-1/2 px-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className="overflow-hidden rounded border border-neutral-800 bg-[#111]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

                    <div className="p-5">
                      <div className="flex-1">
                        <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                          {currentStep + 1} / {tourSteps.length}
                        </span>
                        <h3 className="mt-2 font-[family-name:var(--font-display)] text-base font-bold text-white">{step.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{step.description}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {tourSteps.map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === currentStep
                                  ? 'w-6 bg-cyan-500'
                                  : i < currentStep
                                  ? 'w-1.5 bg-cyan-500/40'
                                  : 'w-1.5 bg-neutral-700'
                              }`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={handleNext}
                          className="flex items-center gap-1.5 rounded-sm bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white"
                        >
                          Next
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

      {/* ── Tour Finale — fullscreen CTA ── */}
      <AnimatePresence>
        {showFinale && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Blurred backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />

            <motion.div
              className="relative mx-6 w-full max-w-lg overflow-hidden rounded border border-neutral-800 bg-[#0d0d0d] shadow-2xl shadow-cyan-500/5"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Top gradient bar */}
              <div className="h-1 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500" />

              <div className="p-8 sm:p-10 text-center">
                {/* Animated checkmark */}
                <motion.div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 12 }}
                >
                  <motion.svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </motion.svg>
                </motion.div>

                <motion.h2
                  className="mt-6 font-[family-name:var(--font-display)] text-2xl font-bold text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  You&apos;ve seen it all
                </motion.h2>
                <motion.p
                  className="mt-2.5 text-sm leading-relaxed text-neutral-400"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Smart intake forms with OCR, auto-save, branded PDFs, and instant notifications. Your clients fill forms in minutes — you get the data instantly.
                </motion.p>

                <motion.div
                  className="mt-8 flex flex-col gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Link
                    href="/signup"
                    onClick={endTour}
                    className="shimmer-line group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-sm bg-gradient-to-r from-cyan-600 to-teal-600 py-4 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                  >
                    <Rocket className="relative z-10 h-4 w-4" />
                    <span className="relative z-10">Create Your Form — Free</span>
                  </Link>
                  <button
                    onClick={endTour}
                    className="group flex w-full items-center justify-center gap-2 rounded-sm border border-neutral-800 py-3.5 text-sm font-medium text-neutral-500 transition-all hover:border-neutral-600 hover:text-neutral-300"
                  >
                    <Compass className="h-4 w-4" />
                    Keep Exploring
                  </button>
                </motion.div>

                {/* Trust micro-copy */}
                <motion.p
                  className="mt-5 text-[11px] text-neutral-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  No credit card required. Set up in under 2 minutes.
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
