'use client'

import React, { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const rise = {
  hidden: { opacity: 0, y: '0.7em', rotateX: 35 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.85, ease: EASE } },
}
const fade = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

/**
 * The kinetic cover: a parallax background that scales as you scroll, an
 * animated aurora wash, a word-by-word headline reveal, and hero content that
 * lifts + fades ("splits" away) as the next section rises — breaking the static
 * feel of the default hero.
 */
export default function KineticHero({
  eyebrow,
  name,
  btn1,
  btn2,
  coverUrl,
  overlay = 45,
  heightVh = 100,
}: {
  eyebrow?: string
  name: string
  btn1?: string
  btn2?: string
  coverUrl?: string | null
  overlay?: number
  heightVh?: number
}) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  const words = name.trim().split(/\s+/)
  const lastIdx = words.length - 1

  return (
    <header
      className="hero kx-hero"
      id="hero"
      ref={ref}
      style={{ minHeight: `${Math.max(heightVh, 90)}vh` }}
    >
      {coverUrl && (
        <motion.img
          className="hero-bg kx-hero-bg"
          src={coverUrl}
          alt=""
          style={reduced ? undefined : { y: bgY, scale: bgScale }}
        />
      )}
      <div
        className="hero-overlay kx-hero-overlay"
        style={{
          background: `radial-gradient(120% 120% at 20% 10%, transparent 30%, rgba(0,0,0,${
            overlay / 100
          })), linear-gradient(90deg, var(--bg) 6%, transparent 72%)`,
        }}
      />

      <motion.div
        className="container hero-inner kx-hero-inner"
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {eyebrow && (
          <motion.p className="hero-eyebrow kx-eyebrow" variants={fade}>
            <span className="kx-eyebrow-dot" />
            {eyebrow}
          </motion.p>
        )}

        <h1 className="hero-name kx-name" style={{ perspective: 800 }}>
          {words.map((w, i) => (
            <span className="kx-word-wrap" key={i}>
              <motion.span
                className={`kx-word ${i === lastIdx && words.length > 1 ? 'accent' : ''}`}
                variants={rise}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div className="hero-btns" variants={fade}>
          {btn1 && (
            <a className="btn btn-primary" href="#projects">
              {btn1}
            </a>
          )}
          {btn2 && (
            <a className="btn btn-outline" href="#contact">
              {btn2}
            </a>
          )}
        </motion.div>
      </motion.div>

      {!reduced && (
        <motion.div
          className="kx-scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          aria-hidden
        >
          <span className="kx-scroll-dot" />
        </motion.div>
      )}
    </header>
  )
}
