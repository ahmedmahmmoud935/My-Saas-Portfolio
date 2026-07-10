'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { DASHBOARD_NAV } from '@/lib/dashboard-nav'
import NavIcon from './icons'

type Lang = 'ar' | 'en'
type Mode = 'dark' | 'light'

// Apply + persist the dashboard's language (direction) and colour mode on <html>.
function applyLang(lang: Lang) {
  const el = document.documentElement
  el.setAttribute('lang', lang)
  el.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
  localStorage.setItem('dash-lang', lang)
}
function applyMode(mode: Mode) {
  document.documentElement.setAttribute('data-mode', mode)
  localStorage.setItem('dash-mode', mode)
}

export default function Sidebar({
  userName,
  tenantSlug,
  storageUsed,
  storageLimit,
  isOwner = false,
}: {
  userName: string
  tenantSlug: string
  storageUsed: number
  storageLimit: number
  isOwner?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const pct = Math.min(100, Math.round((storageUsed / Math.max(1, storageLimit)) * 100))

  const [lang, setLang] = useState<Lang>('ar')
  const [mode, setMode] = useState<Mode>('dark')

  // Restore saved preferences on mount.
  useEffect(() => {
    const l = (localStorage.getItem('dash-lang') as Lang) || 'ar'
    const m = (localStorage.getItem('dash-mode') as Mode) || 'dark'
    setLang(l)
    setMode(m)
    applyLang(l)
    applyMode(m)
  }, [])

  const toggleLang = () => {
    const next: Lang = lang === 'ar' ? 'en' : 'ar'
    setLang(next)
    applyLang(next)
  }
  const toggleMode = () => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    applyMode(next)
  }
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en)

  const items = isOwner
    ? [...DASHBOARD_NAV, { id: 'users', labelAr: 'المستخدمون', labelEn: 'Users', icon: '' }]
    : DASHBOARD_NAV

  async function logout() {
    await fetch('/api/users/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span>Portfolio Admin</span>
        <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
          <NavIcon id="gem" size={18} />
        </span>
      </div>

      <div className="sidebar-controls">
        <button className="chrome-toggle" onClick={toggleLang} title={t('English', 'العربية')}>
          <NavIcon id="globe" size={16} />
          <span>{lang === 'ar' ? 'العربية' : 'English'}</span>
        </button>
        <button className="chrome-toggle" onClick={toggleMode} title={t('الوضع الفاتح/الداكن', 'Light / dark')}>
          <NavIcon id={mode === 'dark' ? 'sun' : 'moon'} size={16} />
          <span>{mode === 'dark' ? t('فاتح', 'Light') : t('داكن', 'Dark')}</span>
        </button>
      </div>

      <nav>
        {items.map((item) => {
          const href = `/dashboard/${item.id}`
          const active = pathname === href || (item.id === 'projects' && pathname === '/dashboard')
          return (
            <a key={item.id} href={href} className={`nav-item ${active ? 'active' : ''}`}>
              <span>{t(item.labelAr, item.labelEn)}</span>
              <span className="ic">
                <NavIcon id={item.id} />
              </span>
            </a>
          )
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="who">
          {t('مسجّل كـ', 'Signed in as')} <b>{userName}</b>
        </div>
        <div className="storage-bar">
          <span style={{ width: `${pct}%` }} />
        </div>
        <div className="who" style={{ fontSize: 12 }}>
          {storageUsed.toFixed(2)} / {storageLimit} MB
        </div>
        <a className="foot-link" href={`/${tenantSlug}`} target="_blank" rel="noreferrer">
          <span>{t('عرض الموقع', 'View site')}</span>
          <NavIcon id="external" size={15} />
        </a>
        <button
          className="foot-link danger"
          onClick={logout}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span>{t('تسجيل الخروج', 'Log out')}</span>
          <NavIcon id="logout" size={15} />
        </button>
      </div>
    </aside>
  )
}
