import React from 'react'

// Clean line icons (Lucide-style) so the dashboard matches the original design
// instead of emoji. 20px, stroke = currentColor.
const P = (d: string) => <path d={d} />

const PATHS: Record<string, React.ReactNode> = {
  projects: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  highlights: (
    <>
      <circle cx="12" cy="12" r="9" />
      {P('M10 9l5 3-5 3z')}
    </>
  ),
  analytics: (
    <>
      {P('M3 3v18h18')}
      {P('M7 15v3M12 10v8M17 6v12')}
    </>
  ),
  categories: (
    <>
      {P('M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L3 13V4a1 1 0 0 1 1-1h9l7.59 7.59a2 2 0 0 1 0 2.82z')}
      <circle cx="7.5" cy="7.5" r="1" />
    </>
  ),
  design: (
    <>
      {P('M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.8.7-1.5 1.5-1.5H17a4 4 0 0 0 4-4c0-4-4-7-9-7z')}
      <circle cx="7.5" cy="10.5" r="1" />
      <circle cx="12" cy="7.5" r="1" />
      <circle cx="16.5" cy="10.5" r="1" />
    </>
  ),
  sections: (
    <>
      {P('M12 2l9 5-9 5-9-5 9-5z')}
      {P('M3 12l9 5 9-5M3 17l9 5 9-5')}
    </>
  ),
  navbar: (
    <>
      <rect x="3" y="4" width="18" height="6" rx="1" />
      {P('M6 14h12M6 18h8')}
    </>
  ),
  mobilebar: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      {P('M11 18h2')}
    </>
  ),
  content: (
    <>
      {P('M12 20h9')}
      {P('M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z')}
    </>
  ),
  logos: (
    <>
      <circle cx="9" cy="7" r="3" />
      {P('M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2')}
      {P('M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87')}
    </>
  ),
  achievements: (
    <>
      {P('M8 21h8M12 17v4')}
      {P('M7 4h10v5a5 5 0 0 1-10 0V4z')}
      {P('M5 4H3v2a3 3 0 0 0 3 3M19 4h2v2a3 3 0 0 1-3 3')}
    </>
  ),
  testimonials: (
    <>
      {P('M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z')}
    </>
  ),
  articles: (
    <>
      {P('M4 19.5A2.5 2.5 0 0 1 6.5 17H20')}
      {P('M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z')}
    </>
  ),
  social: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      {P('M8.6 13.5l6.8 4M15.4 6.5l-6.8 4')}
    </>
  ),
  users: (
    <>
      <circle cx="12" cy="8" r="4" />
      {P('M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1')}
    </>
  ),
  gem: (
    <>
      {P('M6 3h12l4 6-10 12L2 9l4-6z')}
      {P('M2 9h20M8 3l4 6 4-6M8 9l4 12 4-12')}
    </>
  ),
}

export default function NavIcon({ id, size = 20 }: { id: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[id] ?? PATHS.projects}
    </svg>
  )
}
