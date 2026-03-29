'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      prevent: (node: HTMLElement) => {
        // Let native scroll work inside any scrollable container, form, or select
        if (
          node.tagName === 'SELECT' ||
          node.tagName === 'TEXTAREA' ||
          node.closest('[data-lenis-prevent]') ||
          node.closest('.overflow-y-auto') ||
          node.closest('.overflow-x-auto') ||
          node.closest('.overflow-auto')
        ) {
          return true
        }
        // Check if the element or any ancestor has scrollable overflow
        let el: HTMLElement | null = node
        while (el && el !== document.body) {
          const style = getComputedStyle(el)
          const overflowY = style.overflowY
          if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
            return true
          }
          el = el.parentElement
        }
        return false
      },
    })

    lenisRef.current = lenis
    ;(window as unknown as { __lenis: Lenis }).__lenis = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!anchor) return

      const id = anchor.getAttribute('href')
      if (!id || id === '#') return

      const el = document.querySelector(id)
      if (!el) return

      e.preventDefault()
      lenis.scrollTo(el as HTMLElement, { offset: -80, duration: 1.4 })
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
