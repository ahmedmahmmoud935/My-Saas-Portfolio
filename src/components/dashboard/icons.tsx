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

  // ── Actions & controls (replace emoji across the dashboard) ──────────────
  edit: (
    <>
      {P('M12 20h9')}
      {P('M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z')}
    </>
  ),
  trash: (
    <>
      {P('M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6')}
      {P('M10 11v6M14 11v6')}
    </>
  ),
  eye: (
    <>
      {P('M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z')}
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      {P('M17.94 17.94A10.07 10.07 0 0 1 12 20c-6.5 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24')}
      {P('M1 1l22 22')}
    </>
  ),
  plus: P('M12 5v14M5 12h14'),
  back: P('M5 12h14M12 5l7 7-7 7'),
  up: P('M18 15l-6-6-6 6'),
  down: P('M6 9l6 6 6-6'),
  x: P('M18 6L6 18M6 6l12 12'),
  save: (
    <>
      {P('M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z')}
      {P('M17 21v-8H7v8M7 3v5h8')}
    </>
  ),
  publish: (
    <>
      {P('M22 2L11 13')}
      {P('M22 2l-7 20-4-9-9-4 20-7z')}
    </>
  ),
  grip: P('M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01'),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      {P('M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4')}
    </>
  ),
  moon: P('M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      {P('M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18')}
    </>
  ),
  logout: (
    <>
      {P('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4')}
      {P('M16 17l5-5-5-5M21 12H9')}
    </>
  ),
  external: (
    <>
      {P('M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6')}
      {P('M15 3h6v6M10 14L21 3')}
    </>
  ),

  // ── Module / builder blocks ──────────────────────────────────────────────
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      {P('M21 15l-5-5L5 21')}
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  text: P('M4 6V4h16v2M9 20h6M12 4v16'),
  video: (
    <>
      <rect x="2" y="5" width="15" height="14" rx="2" />
      {P('M22 8l-5 4 5 4V8z')}
    </>
  ),
  beforeafter: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      {P('M12 4v16')}
      {P('M8 10l-2 2 2 2M16 10l2 2-2 2')}
    </>
  ),
  separator: P('M3 12h18M6 8h12M6 16h12'),
  link: (
    <>
      {P('M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5')}
      {P('M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5')}
    </>
  ),
  upload: (
    <>
      {P('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4')}
      {P('M17 8l-5-5-5 5M12 3v12')}
    </>
  ),
  code: P('M16 18l6-6-6-6M8 6l-6 6 6 6'),

  // ── Wizard / content-type choices ────────────────────────────────────────
  palette: (
    <>
      {P('M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.8.7-1.5 1.5-1.5H17a4 4 0 0 0 4-4c0-4-4-7-9-7z')}
      <circle cx="7.5" cy="10.5" r="1" />
      <circle cx="12" cy="7.5" r="1" />
      <circle cx="16.5" cy="10.5" r="1" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      {P('M7 3v18M17 3v18M3 8h4M17 8h4M3 16h4M17 16h4')}
    </>
  ),
  page: (
    <>
      {P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z')}
      {P('M14 2v6h6M8 13h8M8 17h8M8 9h2')}
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      {P('M11 18h2')}
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      {P('M8 21h8M12 17v4')}
    </>
  ),
  tablet: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      {P('M10 18h4')}
    </>
  ),
  home: (
    <>
      {P('M3 10.5 12 3l9 7.5')}
      {P('M5 9.5V21h14V9.5')}
      {P('M10 21v-6h4v6')}
    </>
  ),
  star: P('M12 3l2.6 5.6 6 .8-4.3 4.2 1 6L12 17.3 6.7 19.6l1-6L3.4 9.4l6-.8L12 3z'),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      {P('M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2')}
      {P('M2 13h20')}
    </>
  ),
  wrench: P('M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.8-.7-.7-2.8 2.5-2.5z'),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      {P('M3 6.5 12 13l9-6.5')}
    </>
  ),
  sparkles: (
    <>
      {P('M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z')}
      {P('M19 14l.7 2.1L22 17l-2.3.9L19 20l-.7-2.1L16 17l2.3-.9L19 14z')}
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
