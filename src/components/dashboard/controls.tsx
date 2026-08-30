'use client'

import React from 'react'

/**
 * The small form controls the design editors are built from.
 *
 * They live here because the landing page's editor and the tenant Design tab
 * offer the same controls over the same shapes; each had grown its own copy of
 * the colour input, and they had already drifted apart.
 */

export function Opt({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[] | { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  return (
    <div className="opt-field">
      <div className="opt-field-label">{label}</div>
      <div className="opt-opts">
        {opts.map((o) => (
          <button
            key={o.value}
            className={`pill ${value === o.value ? 'active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* A titled group of related controls. */
export function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="de-group">
      <div className="de-group-title">{title}</div>
      {children}
    </div>
  )
}

export function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  // Label above, swatch and hex fused into one control — side-by-side they
  // drifted to opposite ends of the grid column and read as unrelated.
  return (
    <label className="color-input">
      <span className="ci-label">{label}</span>
      <span className="ci-control">
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} />
        <input
          className="ci-hex"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          placeholder="#000000"
          spellCheck={false}
        />
      </span>
    </label>
  )
}

export function Slider({ label, value, min, max, onChange, suffix }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="lbl" style={{ marginBottom: 4 }}>{label}: {value}{suffix}</div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%' }} />
    </div>
  )
}
