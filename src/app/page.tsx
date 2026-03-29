'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { GuidedTour } from '@/components/GuidedTour'
import { AnimatedGridBackground } from '@/components/ui/AnimatedGridBackground'
import { FloatingShapes } from '@/components/ui/FloatingShapes'
import RadialOrbitalTimeline from '@/components/ui/RadialOrbitalTimeline'
import {
  ScanText, Globe, Save, FileDown, Moon, Smartphone, Bell, Palette,
  ClipboardList, DollarSign, Heart, Scale, FileText, ArrowRight,
  Star, Quote, Zap, Shield, BarChart3, Users,
  LayoutTemplate, Link2, ScanLine, FileCheck, Send, CheckCircle2,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const features = [
  { icon: ScanText, title: 'OCR Auto-Fill', desc: 'Upload a driver\'s license or pay stub — fields fill themselves.' },
  { icon: Globe, title: 'Multi-Language', desc: 'English and Spanish support built in.' },
  { icon: Save, title: 'Auto-Save', desc: 'Progress saves automatically. Come back anytime.' },
  { icon: FileDown, title: 'PDF Export', desc: 'Professional branded PDF on every submission.' },
  { icon: Moon, title: 'Dark Mode', desc: 'Light and dark themes for every preference.' },
  { icon: Smartphone, title: 'Mobile Ready', desc: 'Snap photos of documents from your phone.' },
  { icon: Bell, title: 'Notifications', desc: 'Get alerted when a submission comes in.' },
  { icon: Palette, title: 'Custom Branding', desc: 'Your logo, your colors, your look.' },
]

const templates = [
  { icon: DollarSign, name: 'Financial', desc: 'Tax, planning, insurance', color: '#0891b2', fields: 19 },
  { icon: Heart, name: 'Healthcare', desc: 'Medical, dental, therapy', color: '#059669', fields: 16 },
  { icon: Scale, name: 'Legal', desc: 'Law firms, case intake', color: '#7c3aed', fields: 14 },
  { icon: FileText, name: 'General', desc: 'Any business type', color: '#475569', fields: 11 },
]

const testimonials = [
  { quote: 'Aush Forms cut our intake time from 20 minutes to 5. The OCR feature alone is worth it.', name: 'Sarah Chen', role: 'Chen Financial Group', avatar: 'SC' },
  { quote: 'Our patients love how easy it is. They upload their insurance card and everything fills in.', name: 'Dr. Marcus Rivera', role: 'Rivera Health', avatar: 'MR' },
  { quote: 'We used to lose clients during the paperwork phase. Now they complete intake in minutes.', name: 'Amanda Foster', role: 'Foster & Associates', avatar: 'AF' },
]

const stats = [
  { value: '10x', label: 'Faster intake', icon: Zap },
  { value: '99.9%', label: 'Uptime', icon: Shield },
  { value: '4', label: 'Templates', icon: BarChart3 },
  { value: '500+', label: 'Businesses', icon: Users },
]

// ── Workflow Demo Component ──
const workflowSteps = [
  {
    icon: LayoutTemplate,
    title: 'Choose your template',
    desc: 'Pick from Financial, Medical, Legal, or General. Customize fields, branding, and colors.',
    visual: (
      <div className="grid grid-cols-2 gap-2">
        {[
          { name: 'Financial', color: '#0891b2', active: true },
          { name: 'Medical', color: '#059669', active: false },
          { name: 'Legal', color: '#7c3aed', active: false },
          { name: 'General', color: '#475569', active: false },
        ].map((t) => (
          <div key={t.name} className={`rounded border px-3 py-2 text-[11px] font-semibold transition-all ${
            t.active ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-neutral-800 text-neutral-500'
          }`}>
            <div className="mb-1 h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
            {t.name}
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Link2,
    title: 'Share your link',
    desc: 'Get a custom URL. Drop it in emails, your website, or text it directly to clients.',
    visual: (
      <div className="space-y-2">
        <div className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2">
          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Your Form Link</p>
          <p className="mt-0.5 font-mono text-xs font-semibold text-cyan-400">aushforms.com/f/acme-financial</p>
        </div>
        <div className="flex gap-1.5">
          {['Email', 'Text', 'Website'].map((ch) => (
            <div key={ch} className="rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-1 text-[9px] font-medium text-neutral-400">{ch}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: ScanLine,
    title: 'Client uploads documents',
    desc: 'They upload a photo of their ID. OCR reads it and auto-fills name, address, DOB instantly.',
    visual: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded border border-dashed border-neutral-700 bg-neutral-900 px-3 py-2.5">
          <ScanText className="h-4 w-4 text-cyan-500" />
          <span className="text-[11px] text-neutral-400">drivers_license.jpg</span>
          <span className="ml-auto text-[9px] font-semibold text-emerald-400">Scanned</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {['Sarah Chen', '03/15/1990', '742 Evergreen', 'IL 62704'].map((v) => (
            <div key={v} className="rounded-sm border border-cyan-500/20 bg-cyan-500/5 px-2 py-1 text-[10px] font-medium text-cyan-400">{v}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: FileCheck,
    title: 'Review & submit',
    desc: 'Client verifies auto-filled data, fills remaining fields, and submits. A branded PDF is generated.',
    visual: (
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded border border-neutral-800 bg-neutral-900 px-3 py-2">
          <span className="text-[11px] font-medium text-neutral-300">Sarah Chen — Intake</span>
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded border border-neutral-800 bg-neutral-900 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <FileDown className="h-3 w-3 text-cyan-500" />
              <span className="text-[10px] font-medium text-neutral-400">intake-sarah-chen.pdf</span>
            </div>
          </div>
          <div className="rounded bg-cyan-600 px-3 py-2">
            <Send className="h-3 w-3 text-white" />
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Bell,
    title: 'You get notified',
    desc: 'Instant notification on your dashboard. Review the submission, download the PDF, follow up.',
    visual: (
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded border border-cyan-500/20 bg-cyan-500/5 px-3 py-2.5">
          <div className="relative">
            <Bell className="h-4 w-4 text-cyan-400" />
            <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-cyan-500" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-neutral-200">New submission received</p>
            <p className="text-[9px] text-neutral-500">Sarah Chen — Financial Planning</p>
          </div>
          <span className="ml-auto text-[9px] text-neutral-600">Just now</span>
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1 rounded-sm border border-emerald-500/20 bg-emerald-500/5 px-2 py-1.5 text-center text-[9px] font-semibold text-emerald-400">Mark Reviewed</div>
          <div className="flex-1 rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-center text-[9px] font-semibold text-neutral-400">Download PDF</div>
        </div>
      </div>
    ),
  },
]

function WorkflowDemo() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, margin: '-100px' })
  const [activeStep, setActiveStep] = useState(-1)
  const hasPlayedRef = useRef(false)

  const playAnimation = useCallback(() => {
    setActiveStep(-1)
    const timers: ReturnType<typeof setTimeout>[] = []
    workflowSteps.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveStep(i), 600 + i * 800))
    })
    return timers
  }, [])

  useEffect(() => {
    if (!isInView || hasPlayedRef.current) return
    hasPlayedRef.current = true
    const timers = playAnimation()
    return () => timers.forEach(clearTimeout)
  }, [isInView, playAnimation])

  useEffect(() => {
    function handleTourTrigger() {
      setActiveStep(-1)
      setTimeout(() => {
        const timers = playAnimation()
        const cleanup = () => timers.forEach(clearTimeout)
        window.addEventListener('workflow-tour-trigger', cleanup, { once: true })
      }, 100)
    }
    window.addEventListener('workflow-tour-trigger', handleTourTrigger)
    return () => window.removeEventListener('workflow-tour-trigger', handleTourTrigger)
  }, [playAnimation])

  return (
    <section id="how-it-works" ref={sectionRef} className="relative border-t border-neutral-100 px-4 sm:px-6 py-16 sm:py-24 dark:border-neutral-900">
      <div className="dot-grid absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">How It Works</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">Watch the workflow in action</h2>
          <p className="mt-2 text-sm text-neutral-500">Five steps from setup to submission. Each one lights up as you watch.</p>
        </motion.div>

        <div className="mt-16 space-y-0">
          {workflowSteps.map((step, i) => {
            const isActive = i <= activeStep
            const isCurrent = i === activeStep

            return (
              <div key={step.title} className="relative flex gap-3 sm:gap-6">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`relative z-10 flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded transition-all duration-500 ${
                      isActive
                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
                        : 'border border-neutral-800 bg-neutral-900 text-neutral-600'
                    }`}
                    animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.4, ease: 'easeOut' as const }}
                  >
                    {isActive && i < activeStep ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                    {isCurrent && (
                      <div className="absolute inset-0 animate-ping rounded bg-cyan-500 opacity-20" />
                    )}
                  </motion.div>
                  {i < workflowSteps.length - 1 && (
                    <div className="relative w-px flex-1 min-h-[20px]">
                      <div className="absolute inset-0 bg-neutral-800" />
                      <motion.div
                        className="absolute top-0 left-0 w-full bg-cyan-500"
                        initial={{ height: '0%' }}
                        animate={{ height: isActive ? '100%' : '0%' }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                  )}
                </div>

                <motion.div
                  className={`mb-6 sm:mb-8 flex-1 min-w-0 rounded border p-3 sm:p-5 transition-all duration-500 ${
                    isActive
                      ? 'border-neutral-700 bg-neutral-900'
                      : 'border-neutral-800/50 bg-neutral-950/50'
                  }`}
                  animate={{ opacity: isActive ? 1 : 0.3 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">Step {i + 1}</span>
                        {isCurrent && (
                          <motion.span
                            className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold text-cyan-400"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            Active
                          </motion.span>
                        )}
                        {isActive && i < activeStep && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400">Done</span>
                        )}
                      </div>
                      <h3 className={`mt-2 font-[family-name:var(--font-display)] text-base font-bold transition-colors duration-500 ${
                        isActive ? 'text-white' : 'text-neutral-600'
                      }`}>{step.title}</h3>
                      <p className={`mt-1.5 text-sm leading-relaxed transition-colors duration-500 ${
                        isActive ? 'text-neutral-400' : 'text-neutral-700'
                      }`}>{step.desc}</p>
                    </div>
                    <motion.div
                      className="hidden sm:block w-full shrink-0 sm:w-56"
                      animate={{ opacity: isActive ? 1 : 0.15 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      {step.visual}
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-white dark:bg-[#0a0a0a]">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-neutral-200/50 bg-white/70 backdrop-blur-2xl dark:border-white/[0.04] dark:bg-[#0a0a0a]/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-cyan-600">
              <ClipboardList className="h-4 w-4 text-white" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-base font-bold tracking-tight">Aush Forms</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white">How It Works</a>
            <a href="#templates" className="text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white">Templates</a>
            <a href="#features" className="text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white">Features</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white">Log In</Link>
            <Link href="/signup" className="group flex items-center gap-1.5 rounded bg-cyan-600 px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-cyan-500">
              Get Started
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </nav>

      <GuidedTour />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pb-16 pt-16 sm:pt-24">
        {/* Animated backgrounds */}
        <AnimatedGridBackground />
        <FloatingShapes />
        <div className="mesh-gradient-1 absolute inset-0" />

        <motion.div className="relative mx-auto max-w-6xl" initial="hidden" animate="visible" variants={stagger}>
          <div className="grid items-center gap-12 lg:grid-cols-[1fr,420px]">
            {/* Left — Copy */}
            <div>
              <motion.div variants={fadeUp} className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200/60 bg-cyan-50/80 px-3 py-1 dark:border-cyan-500/15 dark:bg-cyan-500/5">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">OCR Document Scanning</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-[family-name:var(--font-display)] text-[40px] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[54px]">
                Stop typing.<br />
                Start <span className="relative inline-block">
                  <span className="animated-gradient-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 bg-clip-text text-transparent">scanning.</span>
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 opacity-40" />
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-5 max-w-lg text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                Your clients upload a photo of their ID — Aush Forms reads it, fills in their name, address, and DOB automatically. No more manual data entry.
              </motion.p>

              {/* CTA */}
              <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
                <Link href="/signup" className="shimmer-line group relative overflow-hidden rounded bg-gradient-to-r from-cyan-600 to-teal-600 p-px">
                  <div className="relative flex items-center gap-3 rounded-[11px] bg-gradient-to-r from-cyan-600 to-teal-600 px-7 py-3.5">
                    <span className="text-sm font-bold text-white">Create Your Form</span>
                    <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-white/20">
                      <ArrowRight className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                </Link>
                <a href="#how-it-works" className="group flex items-center gap-2 text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 transition-all group-hover:border-cyan-500 group-hover:bg-cyan-50 dark:border-neutral-700 dark:group-hover:bg-cyan-500/5">
                    <svg className="h-3 w-3 text-neutral-400 transition-colors group-hover:text-cyan-600" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  Watch Demo
                </a>
              </motion.div>

              {/* Trust row */}
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <stat.icon className="h-3.5 w-3.5 text-cyan-500/60" />
                    <span className="font-[family-name:var(--font-display)] text-sm font-extrabold">{stat.value}</span>
                    <span className="text-[11px] text-neutral-400">{stat.label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Form Preview Card */}
            <motion.div variants={fadeUp} className="relative hidden lg:block">
              <div className="absolute -left-8 top-12 z-20 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 shadow-lg dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">OCR extracted 6 fields</span>
                </div>
              </div>

              <div className="absolute -right-4 bottom-24 z-20 rounded border border-cyan-200 bg-white px-3 py-2 shadow-lg dark:border-cyan-500/20 dark:bg-neutral-900">
                <div className="flex items-center gap-2">
                  <ScanText className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Auto-filled from ID</span>
                </div>
              </div>

              <div className="gradient-border rounded border border-neutral-200/80 bg-white/90 p-6 shadow-2xl shadow-neutral-200/40 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/90 dark:shadow-black/40">
                <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 dark:border-neutral-800">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-cyan-500 text-[10px] font-bold text-white">T</div>
                  <div>
                    <p className="text-xs font-bold">Test Financial Group</p>
                    <p className="text-[10px] text-neutral-400">Client Intake Form</p>
                  </div>
                  <div className="ml-auto rounded-full bg-cyan-50 px-2 py-0.5 text-[9px] font-bold text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400">Step 1 of 5</div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400">First Name</p>
                      <div className="rounded-sm border border-cyan-200 bg-cyan-50/50 px-2.5 py-1.5 text-xs font-medium text-neutral-800 dark:border-cyan-500/20 dark:bg-cyan-500/5 dark:text-white">Sarah</div>
                    </div>
                    <div>
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400">Last Name</p>
                      <div className="rounded-sm border border-cyan-200 bg-cyan-50/50 px-2.5 py-1.5 text-xs font-medium text-neutral-800 dark:border-cyan-500/20 dark:bg-cyan-500/5 dark:text-white">Chen</div>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400">Date of Birth</p>
                    <div className="rounded-sm border border-cyan-200 bg-cyan-50/50 px-2.5 py-1.5 text-xs font-medium text-neutral-800 dark:border-cyan-500/20 dark:bg-cyan-500/5 dark:text-white">03/15/1990</div>
                  </div>
                  <div>
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400">Address</p>
                    <div className="rounded-sm border border-cyan-200 bg-cyan-50/50 px-2.5 py-1.5 text-xs font-medium text-neutral-800 dark:border-cyan-500/20 dark:bg-cyan-500/5 dark:text-white">742 Evergreen Terrace, Springfield, IL 62704</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400">Email</p>
                      <div className="rounded-sm border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800">you@email.com</div>
                    </div>
                    <div>
                      <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400">Phone</p>
                      <div className="rounded-sm border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800">(555) 000-0000</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-neutral-400">4 fields auto-filled</span>
                  </div>
                  <div className="rounded-sm bg-neutral-900 px-3 py-1.5 text-[10px] font-bold text-white dark:bg-white dark:text-black">Next →</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <WorkflowDemo />

      {/* ── Templates ── */}
      <section id="templates" className="relative border-t border-neutral-100 bg-neutral-50 px-6 py-20 dark:border-neutral-900 dark:bg-neutral-950/50">
        <motion.div className="mx-auto max-w-5xl" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div variants={fadeUp}>
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">Templates</p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">Built for your industry</h2>
                <p className="mt-2 max-w-md text-sm text-neutral-500">Pre-configured intake forms with the right fields for your business. Customize any template to match your exact needs.</p>
              </div>
              <Link href="/signup" className="group shrink-0 flex items-center gap-2 rounded-sm border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-all hover:border-cyan-500 hover:text-cyan-700 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-cyan-500 dark:hover:text-cyan-400">
                Try a Template
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((tmpl) => (
              <motion.div key={tmpl.name} variants={fadeUp} className="card-hover-glow group relative overflow-hidden rounded border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="flex h-10 w-10 items-center justify-center rounded text-white" style={{ backgroundColor: tmpl.color }}>
                  <tmpl.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-sm font-bold">{tmpl.name}</h3>
                <p className="mt-1 text-xs text-neutral-500">{tmpl.desc}</p>
                <div className="mt-4 flex items-center gap-1.5">
                  <div className="h-1 flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div className="h-1 rounded-full transition-all duration-500 group-hover:brightness-125" style={{ width: `${(tmpl.fields / 19) * 100}%`, backgroundColor: tmpl.color }} />
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-400">{tmpl.fields} fields</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Features — Orbital Timeline ── */}
      <section id="features" className="relative border-t border-neutral-100 px-6 py-20 dark:border-neutral-900 overflow-hidden">
        <AnimatedGridBackground color="#06b6d4" maxLights={2} gridSize={56} />
        <motion.div
          className="relative mx-auto max-w-5xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">Features</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">Everything you need, nothing you don&apos;t</h2>
            <p className="mt-2 text-sm text-neutral-500">Click any node to explore. The orbit never stops.</p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <RadialOrbitalTimeline
              timelineData={features.map((f, i) => ({
                id: i + 1,
                title: f.title,
                content: f.desc,
                icon: f.icon,
                status: i < 3 ? 'completed' as const : i < 6 ? 'in-progress' as const : 'pending' as const,
                energy: Math.max(40, 100 - i * 8),
              }))}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Testimonials ── */}
      <section id="__testimonials" className="relative border-t border-neutral-100 bg-neutral-50 px-6 py-20 dark:border-neutral-900 dark:bg-neutral-950/50">
        <motion.div className="mx-auto max-w-5xl" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">Testimonials</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">Trusted by professionals</h2>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="card-hover-glow rounded border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-neutral-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA ── */}
      <section id="__cta" className="relative overflow-hidden border-t border-neutral-100 px-6 py-24 dark:border-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-cyan-700 to-teal-700" />
        <AnimatedGridBackground color="#ffffff" maxLights={4} gridSize={56} showDots={false} className="opacity-20" />
        <motion.div className="relative mx-auto max-w-2xl text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
            Ready to streamline<br />your intake?
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-sm text-cyan-100">
            Join hundreds of businesses saving hours every week with smart forms.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8">
            <Link href="/signup" className="group inline-flex items-center gap-3 rounded-sm bg-white px-8 py-4 text-sm font-bold text-cyan-700 shadow-lg transition-all hover:bg-cyan-50 hover:shadow-xl">
              Create Your Form
              <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-cyan-600 transition-all group-hover:bg-cyan-500">
                <ArrowRight className="h-3.5 w-3.5 text-white" />
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-200 px-6 py-6 dark:border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-600">
              <ClipboardList className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-bold">Aush Forms</span>
          </div>
          <p className="text-[11px] text-neutral-400">&copy; {new Date().getFullYear()} Aush Forms. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
