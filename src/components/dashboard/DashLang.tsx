'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'ar' | 'en'

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  /** Pick the Arabic or English string for the current language. */
  t: (ar: string, en: string) => string
}

const LangContext = createContext<Ctx>({ lang: 'ar', setLang: () => {}, t: (ar) => ar })

function applyDir(l: Lang) {
  const e = document.documentElement
  e.setAttribute('lang', l)
  e.setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr')
}

export function DashLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar')

  useEffect(() => {
    const l = (localStorage.getItem('dash-lang') as Lang) || 'ar'
    setLangState(l)
    applyDir(l)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('dash-lang', l)
    applyDir(l)
  }

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en)

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export const useDashLang = () => useContext(LangContext)
