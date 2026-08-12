'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { OWNER_NAV, OWNER_NAV_ICONS } from '@/lib/owner-nav'
import { useDashLang } from './DashLang'
import NavIcon from './icons'

type Mode = 'dark' | 'light'

function applyMode(mode: Mode) {
  document.documentElement.setAttribute('data-mode', mode)
  localStorage.setItem('dash-mode', mode)
}

/**
 * Sidebar for the admin area. Same chrome as the client dashboard, different
 * job: this one runs ViralPX (the marketing page, the client list), while
 * /dashboard edits a single portfolio.
 */
export default function OwnerSidebar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { lang, setLang, t } = useDashLang()
  const [mode, setMode] = useState<Mode>('dark')

  useEffect(() => {
    const m = (localStorage.getItem('dash-mode') as Mode) || 'dark'
    setMode(m)
    applyMode(m)
  }, [])

  const toggleLang = () => setLang(lang === 'ar' ? 'en' : 'ar')
  const toggleMode = () => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    applyMode(next)
  }

  async function logout() {
    await fetch('/api/users/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span>{t('لوحة الإدارة', 'Admin panel')}</span>
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
        {OWNER_NAV.map((item) => {
          const href = `/owner/${item.id}`
          return (
            <a key={item.id} href={href} className={`nav-item ${pathname === href ? 'active' : ''}`}>
              <span>{t(item.labelAr, item.labelEn)}</span>
              <span className="ic">
                <NavIcon id={OWNER_NAV_ICONS[item.id] || item.id} />
              </span>
            </a>
          )
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="who">
          {t('مسجّل كـ', 'Signed in as')} <b>{userName}</b>
        </div>
        <a className="foot-link" href="/dashboard" style={{ marginTop: 8 }}>
          <span>{t('بورتفوليو الخاص بي', 'My portfolio')}</span>
          <NavIcon id="back" size={15} />
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
