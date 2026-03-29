'use client'

import { useEffect, useRef } from 'react'

interface AnimatedGridBackgroundProps {
  className?: string
  gridSize?: number
  color?: string
  maxLights?: number
  showDots?: boolean
}

export function AnimatedGridBackground({
  className = '',
  gridSize = 48,
  color = '#06b6d4',
  maxLights = 5,
  showDots = true,
}: AnimatedGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = 0
    let h = 0
    let visible = false
    let lights: { x: number; y: number; tx: number; ty: number; progress: number; speed: number; horizontal: boolean }[] = []

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      w = rect.width
      h = rect.height
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // Only animate when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible && !animId) animId = requestAnimationFrame(draw)
      },
      { threshold: 0 }
    )
    observer.observe(canvas)

    function spawnLight() {
      const horizontal = Math.random() > 0.5
      if (horizontal) {
        const y = Math.floor(Math.random() * (h / gridSize)) * gridSize
        lights.push({ x: 0, y, tx: w, ty: y, progress: 0, speed: 0.3 + Math.random() * 0.8, horizontal: true })
      } else {
        const x = Math.floor(Math.random() * (w / gridSize)) * gridSize
        lights.push({ x, y: 0, tx: x, ty: h, progress: 0, speed: 0.3 + Math.random() * 0.8, horizontal: false })
      }
    }

    function draw() {
      if (!visible) { animId = 0; return }

      ctx!.clearRect(0, 0, w, h)

      // Grid lines
      ctx!.strokeStyle = `${color}10`
      ctx!.lineWidth = 0.5
      for (let x = 0; x <= w; x += gridSize) {
        ctx!.beginPath()
        ctx!.moveTo(x, 0)
        ctx!.lineTo(x, h)
        ctx!.stroke()
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx!.beginPath()
        ctx!.moveTo(0, y)
        ctx!.lineTo(w, y)
        ctx!.stroke()
      }

      // Intersection dots
      if (showDots) {
        ctx!.fillStyle = `${color}15`
        for (let x = 0; x <= w; x += gridSize) {
          for (let y = 0; y <= h; y += gridSize) {
            ctx!.beginPath()
            ctx!.arc(x, y, 1.5, 0, Math.PI * 2)
            ctx!.fill()
          }
        }
      }

      // Lights
      lights = lights.filter((l) => l.progress < 1)
      for (const l of lights) {
        l.progress += l.speed * 0.008
        const cx = l.horizontal ? l.progress * l.tx : l.x
        const cy = l.horizontal ? l.y : l.progress * l.ty

        const gradient = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 20)
        gradient.addColorStop(0, `${color}40`)
        gradient.addColorStop(0.5, `${color}15`)
        gradient.addColorStop(1, `${color}00`)
        ctx!.fillStyle = gradient
        ctx!.beginPath()
        ctx!.arc(cx, cy, 20, 0, Math.PI * 2)
        ctx!.fill()

        ctx!.fillStyle = `${color}60`
        ctx!.beginPath()
        ctx!.arc(cx, cy, 2, 0, Math.PI * 2)
        ctx!.fill()
      }

      if (Math.random() < 0.015 && lights.length < maxLights) spawnLight()

      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      observer.disconnect()
      if (animId) cancelAnimationFrame(animId)
    }
  }, [gridSize, color, maxLights, showDots])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden
    />
  )
}
