import React from 'react'

/**
 * A small set of flat line icons for the landing page's cards.
 *
 * Drawn as strokes in `currentColor`, so an icon takes the colour of the text
 * around it and follows the page from the dark theme to the light one. Emoji
 * could not: each platform draws its own, in its own colours, and they read as
 * stickers on a page otherwise set in one hand.
 *
 * Stored in the page's content by name ("globe"), not by drawing, so the set
 * can be redrawn without touching anyone's data.
 */

const P = (d: string) => <path d={d} />

export const LINE_ICONS: Record<string, { ar: string; en: string; el: React.ReactNode }> = {
  globe: {
    ar: 'دومين',
    en: 'Domain',
    el: (
      <>
        <circle cx="12" cy="12" r="9" />
        {P('M3 12h18')}
        {P('M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z')}
      </>
    ),
  },
  browser: {
    ar: 'موقع',
    en: 'Website',
    el: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        {P('M3 9h18')}
        {P('M6.5 6.5h.01M9 6.5h.01M11.5 6.5h.01')}
        {P('M8 14.5l1.5 2.5 1.5-4 1.5 4 1.5-2.5')}
      </>
    ),
  },
  pen: {
    ar: 'تصميم',
    en: 'Design',
    el: (
      <>
        {P('M12 3l6 7-6 11-6-11 6-7z')}
        {P('M12 3v8')}
        <circle cx="12" cy="12.5" r="1.5" />
        {P('M9 21h6')}
      </>
    ),
  },
  palette: {
    ar: 'ألوان',
    en: 'Colours',
    el: (
      <>
        {P('M12 3a9 9 0 100 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.7-1.3-.7-2.1 0-.9.7-1.6 1.6-1.6H17a4 4 0 004-4C21 6.8 17 3 12 3z')}
        <circle cx="7.5" cy="11" r="1" />
        <circle cx="10" cy="7" r="1" />
        <circle cx="14.5" cy="7" r="1" />
      </>
    ),
  },
  image: {
    ar: 'صور',
    en: 'Images',
    el: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <circle cx="9" cy="9.5" r="1.8" />
        {P('M21 16l-5-5-8.5 9')}
      </>
    ),
  },
  reel: {
    ar: 'فيديو',
    en: 'Video',
    el: (
      <>
        <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
        {P('M10.5 9.5v5l4-2.5-4-2.5z')}
      </>
    ),
  },
  camera: {
    ar: 'تصوير',
    en: 'Camera',
    el: (
      <>
        {P('M4 8h3l2-3h6l2 3h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z')}
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),
  },
  zap: {
    ar: 'سرعة',
    en: 'Speed',
    el: P('M13 2.5L4.5 13.5H12l-1 8 8.5-11H12l1-8z'),
  },
  search: {
    ar: 'جوجل',
    en: 'Search',
    el: (
      <>
        <circle cx="11" cy="11" r="7" />
        {P('M20.5 20.5l-4.5-4.5')}
      </>
    ),
  },
  edit: {
    ar: 'كتابة',
    en: 'Writing',
    el: (
      <>
        {P('M4 20h4L19 9a2.1 2.1 0 00-4-4L4 16v4z')}
        {P('M13.5 6.5l4 4')}
      </>
    ),
  },
  mail: {
    ar: 'إيميل',
    en: 'Email',
    el: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        {P('M3.5 6.5l8.5 6.5 8.5-6.5')}
      </>
    ),
  },
  chat: {
    ar: 'رسائل',
    en: 'Messages',
    el: P('M20 12a8 8 0 01-11.6 7.1L4 20l1-4.2A8 8 0 1120 12z'),
  },
  phone: {
    ar: 'اتصال',
    en: 'Call',
    el: P('M5 3.5h3.5l1.5 4.5-2.2 1.4a11 11 0 006.8 6.8l1.4-2.2 4.5 1.5V19a1.5 1.5 0 01-1.5 1.5A15.5 15.5 0 013.5 5 1.5 1.5 0 015 3.5z'),
  },
  chart: {
    ar: 'إحصائيات',
    en: 'Analytics',
    el: (
      <>
        {P('M4 20V4')}
        {P('M4 20h16')}
        {P('M8.5 16v-4M12.5 16V8M16.5 16v-6')}
      </>
    ),
  },
  layout: {
    ar: 'أقسام',
    en: 'Layout',
    el: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2.5" />
        {P('M3 9h18M10 9v12')}
      </>
    ),
  },
  shield: {
    ar: 'أمان',
    en: 'Security',
    el: (
      <>
        {P('M12 3l8 3v6c0 4.5-3.3 8-8 9-4.7-1-8-4.5-8-9V6l8-3z')}
        {P('M8.8 12.2l2.2 2.2 4.2-4.4')}
      </>
    ),
  },
  star: {
    ar: 'تميّز',
    en: 'Star',
    el: P('M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5z'),
  },
  users: {
    ar: 'عملاء',
    en: 'People',
    el: (
      <>
        <circle cx="9" cy="8.5" r="3.5" />
        {P('M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5')}
        {P('M16 5.2a3.5 3.5 0 010 6.6M18 14.8c1.9.7 3.1 2.4 3.5 5.2')}
      </>
    ),
  },
  rocket: {
    ar: 'انطلاق',
    en: 'Launch',
    el: (
      <>
        {P('M14 4.5c3.2-1.2 5.5-1 5.5-1s.2 2.3-1 5.5c-1 2.6-3.5 5.2-6.5 7l-4-4c1.8-3 4.4-5.5 6-7.5z')}
        {P('M8 11.5l-3.5-.5L3 13l4 1M12.5 16l.5 3.5 2-1.5-1-4')}
        <circle cx="15" cy="9" r="1.5" />
      </>
    ),
  },
  sparkle: {
    ar: 'لمسة',
    en: 'Sparkle',
    el: (
      <>
        {P('M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z')}
        {P('M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7L19 16z')}
      </>
    ),
  },
  check: {
    ar: 'تمام',
    en: 'Done',
    el: (
      <>
        <circle cx="12" cy="12" r="9" />
        {P('M8 12.3l2.7 2.7L16 9.5')}
      </>
    ),
  },
  clock: {
    ar: 'وقت',
    en: 'Time',
    el: (
      <>
        <circle cx="12" cy="12" r="9" />
        {P('M12 7v5l3 2')}
      </>
    ),
  },
}

/** The emoji the page used to ship with, read as the icon each one stood for. */
const FROM_EMOJI: Record<string, string> = {
  '🌐': 'globe',
  '🎨': 'palette',
  '🖼️': 'image',
  '🖼': 'image',
  '🎬': 'reel',
  '📷': 'camera',
  '⚡': 'zap',
  '🔍': 'search',
  '✍️': 'edit',
  '✍': 'edit',
  '📩': 'mail',
  '✉️': 'mail',
  '💬': 'chat',
  '📞': 'phone',
  '📊': 'chart',
  '🛡️': 'shield',
  '⭐': 'star',
  '👥': 'users',
  '🚀': 'rocket',
  '✨': 'sparkle',
  '✅': 'check',
  '⏱️': 'clock',
}

/** The icon a stored value names, if it names one — a key, or an old emoji. */
export function lineIconName(value?: string | null): string | null {
  const v = (value ?? '').trim()
  if (!v) return null
  if (LINE_ICONS[v]) return v
  return FROM_EMOJI[v] ?? null
}

export function LineIcon({ name, size = 26 }: { name: string; size?: number }) {
  const icon = LINE_ICONS[name]
  if (!icon) return null
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {icon.el}
    </svg>
  )
}
