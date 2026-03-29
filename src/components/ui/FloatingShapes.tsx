'use client'

import { motion } from 'framer-motion'

interface ShapeProps {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}

function ElegantShape({ className, delay = 0, width = 400, height = 100, rotate = 0, gradient = 'from-cyan-500/[0.08]' }: ShapeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -100, rotate: rotate - 12 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1 } }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width, height }}
        className="relative will-change-transform"
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} border border-white/[0.06]`}
        />
      </motion.div>
    </motion.div>
  )
}

export function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
      <ElegantShape
        delay={0.2}
        width={500}
        height={120}
        rotate={10}
        gradient="from-cyan-500/[0.08]"
        className="left-[-8%] top-[18%]"
      />
      <ElegantShape
        delay={0.4}
        width={400}
        height={100}
        rotate={-14}
        gradient="from-teal-500/[0.08]"
        className="right-[-4%] top-[72%]"
      />
      <ElegantShape
        delay={0.5}
        width={180}
        height={50}
        rotate={18}
        gradient="from-teal-400/[0.06]"
        className="right-[18%] top-[12%]"
      />
    </div>
  )
}
