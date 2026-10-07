'use client'

import React from 'react'

/**
 * A button that plays the video above it rather than going anywhere.
 *
 * "Watch the tour" under the explainer used to lead to the sign-up link like
 * every other button on the page; a reader who pressed it to watch was taken
 * to WhatsApp instead. It now opens the same player the picture does.
 */
export default function PlayVideoButton({ event, label }: { event: string; label: string }) {
  return (
    <button
      type="button"
      className="lp-btn lp-btn-primary lp-btn-lg"
      onClick={() => window.dispatchEvent(new Event(event))}
    >
      <span className="lp-btn-label">{label}</span>
    </button>
  )
}
