'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pf-install-dismissed'

/**
 * Registers the service worker and offers "add to home screen".
 *
 * Chrome/Android hands us a `beforeinstallprompt` event we can trigger from a
 * button. Safari/iOS has no such API, so there we show the Share → "Add to Home
 * Screen" instructions instead. Either way the bar is hidden once the app is
 * already running standalone, or after the visitor dismisses it.
 */
export default function InstallApp({ label }: { label?: string }) {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null)
  const [iosHint, setIosHint] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Already installed — nothing to offer.
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    if (standalone) return
    try {
      if (localStorage.getItem(DISMISS_KEY)) return
    } catch {}

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as InstallEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)

    // iOS never fires the event — detect Safari on iPhone/iPad and explain.
    const ua = navigator.userAgent
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Mac/.test(ua) && navigator.maxTouchPoints > 1)
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
    if (isIOS && isSafari) {
      setIosHint(true)
      const t = window.setTimeout(() => setShow(true), 2500)
      return () => {
        window.clearTimeout(t)
        window.removeEventListener('beforeinstallprompt', onPrompt)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const dismiss = () => {
    setShow(false)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {}
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    dismiss()
  }

  if (!show) return null

  // Portal to <body>: the portfolio root is a transformed ancestor, which would
  // otherwise contain this `position: fixed` bar and squash it off-screen.
  return createPortal(
    <div className="pwa-bar" role="dialog" aria-label="Install app">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="pwa-icon" src="/icon-192.png" alt="" />
      <div className="pwa-text">
        <strong>{label || 'ثبّت التطبيق على شاشتك'}</strong>
        {iosHint && <span>اضغط زر المشاركة ⬆ ثم «إضافة إلى الشاشة الرئيسية»</span>}
      </div>
      {!iosHint && (
        <button className="pwa-btn" onClick={install}>
          تثبيت
        </button>
      )}
      <button className="pwa-x" onClick={dismiss} aria-label="close">
        ✕
      </button>
    </div>,
    document.body,
  )
}
