'use client'

import React, { useEffect, useRef, useState } from 'react'

/**
 * A review cut to a few lines, with "read more" when there is more to read.
 *
 * One long review stretched every card in its row to its own height. The
 * button only appears when the text is actually cut, measured in the browser,
 * since the same review is three lines on a laptop and six on a phone.
 */
export default function StudioReviewText({ text, more, less }: { text: string; more: string; less: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [open, setOpen] = useState(false)
  const [cut, setCut] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setCut(el.scrollHeight - el.clientHeight > 2)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      <p ref={ref} dir="auto" className={open ? 'st-review-open' : 'st-review-clamp'}>
        {text}
      </p>
      {(cut || open) && (
        <button type="button" className="st-review-more" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? less : more}
        </button>
      )}
    </>
  )
}
