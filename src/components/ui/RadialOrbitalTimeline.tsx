'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X } from 'lucide-react'

interface TimelineItem {
  id: number
  title: string
  content: string
  icon: React.ElementType
  status: 'completed' | 'in-progress' | 'pending'
  energy: number
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[]
  autoRotateSpeed?: number
}

export default function RadialOrbitalTimeline({
  timelineData,
  autoRotateSpeed = 0.3,
}: RadialOrbitalTimelineProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [rotationAngle, setRotationAngle] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)
  const [radius, setRadius] = useState(180)
  const [showcase, setShowcase] = useState(false)
  const [showcaseIndex, setShowcaseIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const visibleRef = useRef(false)
  const showcaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function updateRadius() {
      const vw = window.innerWidth
      if (vw < 480) setRadius(110)
      else if (vw < 768) setRadius(140)
      else setRadius(180)
    }
    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [])

  function handleBgClick(e: React.MouseEvent) {
    if (e.target === containerRef.current || (e.target as HTMLElement).dataset?.orbit) {
      setExpandedId(null)
      setAutoRotate(true)
    }
  }

  const selectNode = useCallback((id: number) => {
    setExpandedId(id)
    setAutoRotate(false)
    const idx = timelineData.findIndex((i) => i.id === id)
    const targetAngle = (idx / timelineData.length) * 360
    setRotationAngle(270 - targetAngle)
  }, [timelineData])

  const deselectNode = useCallback(() => {
    setExpandedId(null)
    setAutoRotate(true)
  }, [])

  function toggleItem(id: number) {
    if (expandedId === id) deselectNode()
    else selectNode(id)
  }

  // Tour events
  useEffect(() => {
    function handleTourEvent(e: Event) {
      const detail = (e as CustomEvent).detail
      if (!detail) return
      if (detail.action === 'select' && detail.nodeIndex < timelineData.length) {
        selectNode(timelineData[detail.nodeIndex].id)
      } else if (detail.action === 'deselect') {
        deselectNode()
      }
    }
    window.addEventListener('orbital-tour', handleTourEvent)
    return () => window.removeEventListener('orbital-tour', handleTourEvent)
  }, [timelineData, selectNode, deselectNode])

  // Visibility observer
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting },
      { threshold: 0.1 }
    )
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Auto-rotate with rAF for smooth animation
  useEffect(() => {
    if (!autoRotate || showcase) return
    let animId: number
    let lastTime = 0
    function tick(time: number) {
      if (lastTime) {
        const delta = time - lastTime
        if (visibleRef.current) {
          setRotationAngle((prev) => (prev + autoRotateSpeed * delta * 0.02) % 360)
        }
      }
      lastTime = time
      animId = requestAnimationFrame(tick)
    }
    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [autoRotate, autoRotateSpeed, showcase])

  // Showcase auto-cycle
  useEffect(() => {
    if (!showcase) return
    function cycleNext() {
      setShowcaseIndex((prev) => {
        const next = (prev + 1) % timelineData.length
        return next
      })
      showcaseTimerRef.current = setTimeout(cycleNext, 2500)
    }
    showcaseTimerRef.current = setTimeout(cycleNext, 2500)
    return () => { if (showcaseTimerRef.current) clearTimeout(showcaseTimerRef.current) }
  }, [showcase, timelineData.length])

  function enterShowcase() {
    setExpandedId(null)
    setAutoRotate(false)
    setShowcaseIndex(0)
    setShowcase(true)
  }

  function exitShowcase() {
    if (showcaseTimerRef.current) clearTimeout(showcaseTimerRef.current)
    setShowcase(false)
    setAutoRotate(true)
  }

  function getNodePos(index: number) {
    const angle = ((index / timelineData.length) * 360 + rotationAngle) % 360
    const rad = (angle * Math.PI) / 180
    const x = radius * Math.cos(rad)
    const y = radius * Math.sin(rad)
    // Cap z-index below tour overlay (z-90)
    const zIndex = Math.round(50 + 30 * Math.cos(rad))
    const opacity = Math.max(0.35, Math.min(1, 0.35 + 0.65 * ((1 + Math.sin(rad)) / 2)))
    return { x, y, zIndex, opacity }
  }

  const statusLabel: Record<string, string> = {
    completed: 'ACTIVE',
    'in-progress': 'LIVE',
    pending: 'READY',
  }

  const orbitDiameter = radius * 2
  const containerHeight = Math.max(360, orbitDiameter + 120)
  const showcaseItem = showcase ? timelineData[showcaseIndex] : null

  return (
    <>
      <div
        ref={containerRef}
        className="relative flex items-center justify-center mx-auto"
        style={{ height: containerHeight, maxWidth: orbitDiameter + 200, width: '100%' }}
        onClick={handleBgClick}
      >
        {/* Orbit ring */}
        <div data-orbit className="absolute rounded-full border border-cyan-500/10" style={{ width: orbitDiameter, height: orbitDiameter }} />

        {/* Center button */}
        <button
          onClick={(e) => { e.stopPropagation(); enterShowcase() }}
          className="absolute flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-600 z-10 cursor-pointer transition-transform duration-300 hover:scale-110"
        >
          <div className="absolute h-18 w-18 sm:h-20 sm:w-20 rounded-full border border-cyan-400/20 animate-ping opacity-40" />
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/80 backdrop-blur-sm" />
        </button>

        {/* Nodes */}
        {timelineData.map((item, index) => {
          const pos = getNodePos(index)
          const isExpanded = expandedId === item.id
          const Icon = item.icon

          return (
            <div
              key={item.id}
              className="absolute will-change-transform"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                zIndex: isExpanded ? 80 : pos.zIndex,
                opacity: isExpanded ? 1 : pos.opacity,
                transition: expandedId !== null ? 'opacity 0.3s ease' : 'none',
              }}
              onClick={(e) => { e.stopPropagation(); toggleItem(item.id) }}
            >
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, rgba(6,182,212,${isExpanded ? 0.3 : 0.12}) 0%, transparent 70%)`,
                  width: item.energy * 0.4 + 36,
                  height: item.energy * 0.4 + 36,
                  left: -(item.energy * 0.4 + 36 - 36) / 2,
                  top: -(item.energy * 0.4 + 36 - 36) / 2,
                }}
              />

              <div
                className={`flex h-9 w-9 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isExpanded
                    ? 'scale-125 sm:scale-150 border-cyan-400 bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'border-cyan-500/30 bg-[#0a0a0a] text-cyan-400 hover:border-cyan-400/60'
                }`}
              >
                <Icon size={14} />
              </div>

              <div
                className={`absolute top-11 sm:top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] sm:text-xs font-semibold tracking-wider transition-all duration-300 ${
                  isExpanded ? 'text-cyan-300' : 'text-neutral-500'
                }`}
              >
                {item.title}
              </div>

              {isExpanded && (
                <div className="absolute top-[4.5rem] sm:top-20 left-1/2 -translate-x-1/2 w-48 sm:w-56 rounded border border-cyan-500/20 bg-[#0a0a0a]/95 p-3 sm:p-4 backdrop-blur-lg shadow-xl shadow-cyan-500/5">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-cyan-500/40" />
                  <div className="flex items-center justify-between mb-2">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold ${
                      item.status === 'completed'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : item.status === 'in-progress'
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                    }`}>
                      {statusLabel[item.status]}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{item.title}</h4>
                  <p className="mt-1 text-[10px] sm:text-xs text-neutral-400 leading-relaxed">{item.content}</p>

                  <div className="mt-2.5 pt-2.5 border-t border-white/5">
                    <div className="flex items-center justify-between text-[9px] sm:text-[10px] mb-1">
                      <span className="flex items-center gap-1 text-neutral-500">
                        <Zap size={9} />
                        Capability
                      </span>
                      <span className="font-mono text-cyan-400">{item.energy}%</span>
                    </div>
                    <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
                        style={{ width: `${item.energy}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Fullscreen showcase mode ── */}
      <AnimatePresence>
        {showcase && showcaseItem && (
          <motion.div
            className="fixed inset-0 z-[300] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />

            {/* Close button */}
            <button
              onClick={exitShowcase}
              className="absolute top-6 right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-400 transition-all hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Progress dots */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {timelineData.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { if (showcaseTimerRef.current) clearTimeout(showcaseTimerRef.current); setShowcaseIndex(i); }}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === showcaseIndex ? 'w-8 bg-cyan-500' : 'w-2 bg-neutral-700 hover:bg-neutral-600'
                  }`}
                />
              ))}
            </div>

            {/* Feature card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={showcaseIndex}
                className="relative z-10 mx-6 w-full max-w-lg"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="rounded border border-cyan-500/20 bg-[#0d0d0d] p-8 sm:p-10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500">
                      <showcaseItem.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        showcaseItem.status === 'completed'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : showcaseItem.status === 'in-progress'
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}>
                        {statusLabel[showcaseItem.status]}
                      </span>
                      <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-white">{showcaseItem.title}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-400">{showcaseItem.content}</p>

                  <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="flex items-center gap-1.5 text-neutral-500">
                        <Zap size={12} />
                        Capability
                      </span>
                      <span className="font-mono text-cyan-400 font-semibold">{showcaseItem.energy}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${showcaseItem.energy}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-center text-[11px] text-neutral-600">
                    {showcaseIndex + 1} of {timelineData.length} — auto-advancing
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Center button to exit */}
            <button
              onClick={exitShowcase}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900/80 px-5 py-2.5 text-sm font-medium text-neutral-400 transition-all hover:text-white"
            >
              Back to orbit
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
