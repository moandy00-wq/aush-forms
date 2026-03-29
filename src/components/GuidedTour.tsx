'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X, Play, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface TourStep {
  targetId: string
  title: string
  description: string
  position: 'top' | 'bottom' | 'center'
  delay: number // ms to wait before advancing
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
  {
    targetId: '__cta',
    title: 'Ready to Start?',
    description: 'Create your first smart intake form in under 2 minutes. Pick a template, customize your brand, share your link.',
    position: 'top',
    delay: 0, // Final step — no auto-advance
  },
]

const TOUR_STORAGE_KEY = 'aush-forms-tour-seen'

export function GuidedTour() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [touring, setTouring] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [noteVisible, setNoteVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lenisRef = useRef<{ scrollTo: (target: HTMLElement, opts: { offset: number; duration: number }) => void } | null>(null)

  // Show prompt after a short delay on first visit
  useEffect(() => {
    const seen = localStorage.getItem(TOUR_STORAGE_KEY)
    if (seen) return

    const timer = setTimeout(() => setShowPrompt(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Get Lenis instance from window
  useEffect(() => {
    // Poll for Lenis on window (we'll expose it)
    const interval = setInterval(() => {
      if ((window as unknown as { __lenis?: typeof lenisRef.current }).__lenis) {
        lenisRef.current = (window as unknown as { __lenis: typeof lenisRef.current }).__lenis
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const scrollToSection = useCallback((targetId: string) => {
    let el: HTMLElement | null = null

    if (targetId === '__hero') {
      window.scrollTo({ top: 0 })
      return
    }

    el = document.getElementById(targetId)

    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -100, duration: 1.8 })
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // Trigger workflow animation
    if (targetId === 'how-it-works') {
      setTimeout(() => {
        window.dispatchEvent(new Event('workflow-tour-trigger'))
      }, 2000)
    }

    // Auto-demo orbital features: click 3 nodes sequentially
    if (targetId === 'features') {
      const nodesToShow = [0, 2, 5] // OCR Auto-Fill, Auto-Save, Mobile Ready
      let i = 0
      const showNext = () => {
        if (i >= nodesToShow.length) {
          // Deselect and resume rotation
          window.dispatchEvent(new CustomEvent('orbital-tour', { detail: { action: 'deselect' } }))
          return
        }
        window.dispatchEvent(new CustomEvent('orbital-tour', { detail: { action: 'select', nodeIndex: nodesToShow[i] } }))
        i++
        setTimeout(showNext, 1200)
      }
      setTimeout(showNext, 2200) // Wait for scroll
    }
  }, [])

  const startTour = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    setShowPrompt(false)
    setTouring(true)
    setCurrentStep(0)

    // Scroll to top first, then start
    window.scrollTo({ top: 0 })
    setTimeout(() => {
      setNoteVisible(true)
      // Auto-advance first step
      timerRef.current = setTimeout(() => advanceStep(0), tourSteps[0].delay)
    }, 800)
  }, [])

  const advanceStep = useCallback((fromStep: number) => {
    const nextStep = fromStep + 1
    if (nextStep >= tourSteps.length) return

    setNoteVisible(false)

    setTimeout(() => {
      setCurrentStep(nextStep)
      scrollToSection(tourSteps[nextStep].targetId)

      // Show note after scroll completes
      setTimeout(() => {
        setNoteVisible(true)

        // Auto-advance if this step has a delay
        if (tourSteps[nextStep].delay > 0) {
          timerRef.current = setTimeout(() => advanceStep(nextStep), tourSteps[nextStep].delay)
        }
      }, 2200) // Wait for scroll animation to finish
    }, 400) // Wait for note fade out
  }, [scrollToSection])

  const handleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    advanceStep(currentStep)
  }, [currentStep, advanceStep])

  const endTour = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setTouring(false)
    setNoteVisible(false)
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
  }, [])

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    setShowPrompt(false)
  }, [])

  const isLastStep = currentStep === tourSteps.length - 1
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
              {/* Gradient top bar */}
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
            {/* Subtle vignette overlay */}
            <motion.div
              className="pointer-events-none fixed inset-0 z-[90]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)',
              }}
            />

            {/* Progress bar at top */}
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

            {/* Skip button */}
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

            {/* Tour Note */}
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
                    {/* Gradient accent */}
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                              {currentStep + 1} / {tourSteps.length}
                            </span>
                          </div>
                          <h3 className="mt-2 font-[family-name:var(--font-display)] text-base font-bold text-white">{step.title}</h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{step.description}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        {/* Step dots */}
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

                        {/* Action button */}
                        {isLastStep ? (
                          <Link
                            href="/signup"
                            onClick={endTour}
                            className="flex items-center gap-2 rounded-sm bg-gradient-to-r from-cyan-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                          >
                            Create Your Form
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <button
                            onClick={handleNext}
                            className="flex items-center gap-1.5 rounded-sm bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-300 transition-all hover:bg-neutral-700 hover:text-white"
                          >
                            Next
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
