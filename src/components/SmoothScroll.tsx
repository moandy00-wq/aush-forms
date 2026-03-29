'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.06,
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    })

    lenisRef.current = lenis
    // Expose Lenis globally for GuidedTour to use
    ;(window as unknown as { __lenis: Lenis }).__lenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Handle anchor link clicks for smooth scrolling to sections
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!anchor) return

      const id = anchor.getAttribute('href')
      if (!id || id === '#') return

      const el = document.querySelector(id)
      if (!el) return

      e.preventDefault()
      lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.5 })
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
