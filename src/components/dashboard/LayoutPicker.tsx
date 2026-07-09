import React from 'react'

// Mini wireframe previews for the layout pickers (matches the original dashboard).
const A = '#f97316' // accent bar
const G = '#3a3a3a' // gray block
const L = '#2a2a2a' // light line

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 74" width="100%" height="74" preserveAspectRatio="none">
      <rect x="0" y="0" width="120" height="74" rx="4" fill="#141414" />
      {children}
    </svg>
  )
}

export const WIREFRAMES: Record<string, React.ReactNode> = {
  // Hero
  'hero-centered': (
    <Frame>
      <rect x="35" y="20" width="50" height="8" rx="2" fill={A} />
      <rect x="42" y="32" width="36" height="4" rx="2" fill={L} />
      <rect x="40" y="44" width="18" height="7" rx="3" fill={A} />
      <rect x="62" y="44" width="18" height="7" rx="3" fill={G} />
    </Frame>
  ),
  'hero-split': (
    <Frame>
      <rect x="8" y="14" width="46" height="46" rx="3" fill={G} />
      <rect x="62" y="22" width="44" height="8" rx="2" fill={A} />
      <rect x="62" y="34" width="34" height="4" rx="2" fill={L} />
      <rect x="62" y="46" width="20" height="6" rx="3" fill={A} />
    </Frame>
  ),
  'hero-massive': (
    <Frame>
      <rect x="8" y="24" width="104" height="14" rx="2" fill={A} />
      <rect x="8" y="44" width="60" height="5" rx="2" fill={L} />
    </Frame>
  ),
  'hero-cover-full': (
    <Frame>
      <rect x="4" y="4" width="112" height="66" rx="3" fill={G} />
      <rect x="12" y="48" width="50" height="8" rx="2" fill={A} />
      <rect x="12" y="60" width="34" height="4" rx="2" fill="#eee" />
    </Frame>
  ),
  'hero-minimal': (
    <Frame>
      <rect x="10" y="30" width="40" height="7" rx="2" fill={A} />
      <rect x="10" y="42" width="26" height="4" rx="2" fill={L} />
    </Frame>
  ),
  // About
  'about-classic': (
    <Frame>
      <rect x="8" y="16" width="40" height="42" rx="3" fill={G} />
      <rect x="56" y="20" width="52" height="5" rx="2" fill={A} />
      <rect x="56" y="30" width="52" height="4" rx="2" fill={L} />
      <rect x="56" y="38" width="44" height="4" rx="2" fill={L} />
      <rect x="56" y="46" width="48" height="4" rx="2" fill={L} />
    </Frame>
  ),
  'about-visual': (
    <Frame>
      <rect x="8" y="10" width="104" height="30" rx="3" fill={G} />
      <rect x="20" y="48" width="80" height="4" rx="2" fill={L} />
      <rect x="30" y="58" width="60" height="4" rx="2" fill={L} />
    </Frame>
  ),
  'about-simple': (
    <Frame>
      <rect x="16" y="24" width="88" height="5" rx="2" fill={A} />
      <rect x="16" y="34" width="88" height="4" rx="2" fill={L} />
      <rect x="16" y="42" width="70" height="4" rx="2" fill={L} />
    </Frame>
  ),
  // Projects
  'projects-grid': (
    <Frame>
      {[0, 1, 2].map((c) =>
        [0, 1].map((r) => (
          <rect key={`${c}-${r}`} x={8 + c * 36} y={10 + r * 30} width="30" height="24" rx="2" fill={G} />
        )),
      )}
    </Frame>
  ),
  'projects-masonry': (
    <Frame>
      <rect x="8" y="10" width="30" height="30" rx="2" fill={G} />
      <rect x="8" y="44" width="30" height="20" rx="2" fill={G} />
      <rect x="44" y="10" width="30" height="20" rx="2" fill={G} />
      <rect x="44" y="34" width="30" height="30" rx="2" fill={G} />
      <rect x="80" y="10" width="30" height="26" rx="2" fill={G} />
      <rect x="80" y="40" width="30" height="24" rx="2" fill={G} />
    </Frame>
  ),
  'projects-list': (
    <Frame>
      {[0, 1, 2].map((r) => (
        <rect key={r} x="8" y={12 + r * 18} width="104" height="12" rx="2" fill={G} />
      ))}
    </Frame>
  ),
  'projects-freegrid': (
    <Frame>
      <rect x="8" y="12" width="50" height="24" rx="2" fill={G} />
      <rect x="62" y="12" width="50" height="24" rx="2" fill={G} />
      <rect x="8" y="40" width="50" height="24" rx="2" fill={G} />
      <rect x="62" y="40" width="50" height="24" rx="2" fill={G} />
    </Frame>
  ),
}

export default function LayoutPicker({
  section,
  label,
  value,
  options,
  onChange,
}: {
  section: string
  label: string
  value: string
  options: readonly string[]
  onChange: (v: string) => void
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="lbl" style={{ marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 10 }}>
        {options.map((o) => {
          const active = value === o
          return (
            <button
              key={o}
              onClick={() => onChange(o)}
              style={{
                background: 'var(--bg-3)',
                border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 10,
                padding: 6,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              {WIREFRAMES[`${section}-${o}`] ?? <div style={{ height: 74 }} />}
              <span style={{ fontSize: 12, color: active ? 'var(--accent)' : 'var(--sub)', fontWeight: 700 }}>{o}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
