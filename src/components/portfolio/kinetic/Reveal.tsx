'use client'

import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Reveals a section as it scrolls into view — a soft rise + fade with a gentle
 * clip. Server-rendered section markup is passed straight through as children,
 * so this works over the existing (non-kinetic) section components untouched.
 */
export default function Reveal({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion()
  if (reduced) return <>{children}</>

  return (
    <motion.div
      initial={{ opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
