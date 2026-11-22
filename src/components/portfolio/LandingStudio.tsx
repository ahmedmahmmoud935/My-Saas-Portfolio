'use client'
import React, { useRef, useState } from 'react'
import type { LandingCopy } from '@/lib/landing-copy'
/** These controls deliberately never write to the CMS or global theme. */
export default function LandingStudio({
  c,
  locale,
}: {
  c: LandingCopy
  locale: 'ar' | 'en'
}) {
  const [tab, setTab] = useState('look')
  const [color, setColor] = useState('#b84b24')
  const [dark, setDark] = useState(false)
  const [filter, setFilter] = useState('all')
  const [aboutFirst, setAboutFirst] = useState(false)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const navigate = (e: React.KeyboardEvent, i: number) => {
    const delta = locale === 'ar' ? -1 : 1
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? 2
          : e.key === 'ArrowRight'
            ? (i + delta + 3) % 3
            : e.key === 'ArrowLeft'
              ? (i - delta + 3) % 3
              : -1
    if (next < 0) return
    e.preventDefault()
    setTab(['look', 'work', 'order'][next])
    tabs.current[next]?.focus()
  }
  const about = (
    <div className="preview-about" id="preview-about">
      <strong>{c.design.studio37}</strong>
      <p>{c.design.studio38}</p>
    </div>
  )
  return (
    <section className="studio section" id="studio">
      <div className="shell">
        <div className="studio-heading">
          <div>
            <p className="eyebrow">{c.design.studio1}</p>
            <h2>
              {c.design.studio2}
              <br />
              <em>{c.design.studio3}</em>
            </h2>
          </div>
          <p>
            {c.design.studio4}
            <br />
            {c.design.studio5}
          </p>
        </div>
        <div
          className="studio-tabs"
          role="tablist"
          aria-label={c.design.studio6}
        >
          <button
            role="tab"
            aria-selected={tab === 'look'}
            aria-controls="demo-panel"
            id="tab-look"
            tabIndex={tab === 'look' ? 0 : -1}
            ref={(el) => {
              tabs.current[0] = el
            }}
            onClick={() => setTab('look')}
            onKeyDown={(e) => navigate(e, 0)}
          >
            {c.design.studio7}
          </button>
          <button
            role="tab"
            aria-selected={tab === 'work'}
            aria-controls="demo-panel"
            id="tab-work"
            tabIndex={tab === 'work' ? 0 : -1}
            ref={(el) => {
              tabs.current[1] = el
            }}
            onClick={() => setTab('work')}
            onKeyDown={(e) => navigate(e, 1)}
          >
            {c.design.studio8}
          </button>
          <button
            role="tab"
            aria-selected={tab === 'order'}
            aria-controls="demo-panel"
            id="tab-order"
            tabIndex={tab === 'order' ? 0 : -1}
            ref={(el) => {
              tabs.current[2] = el
            }}
            onClick={() => setTab('order')}
            onKeyDown={(e) => navigate(e, 2)}
          >
            {c.design.studio9}
          </button>
        </div>
        <div
          className="studio-demo"
          id="demo-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
        >
          <div className="demo-controls">
            <span className="demo-label">{c.design.studio10}</span>
            <h3 id="demo-title">
              {tab === 'work'
                ? c.design.studioWorkTitle
                : tab === 'order'
                  ? c.design.studioOrderTitle
                  : c.design.studio11}
            </h3>
            <p id="demo-desc">
              {tab === 'work'
                ? c.design.studioWorkDesc
                : tab === 'order'
                  ? c.design.studioOrderDesc
                  : c.design.studio12}
            </p>
            <div
              id="look-controls"
              className="control-group"
              hidden={tab !== 'look'}
            >
              <div
                className="swatches"
                role="group"
                aria-label={c.design.studio13}
              >
                <button
                  style={{ '--swatch': '#b84b24' } as React.CSSProperties}
                  data-color="#b84b24"
                  aria-label={c.design.studio14}
                  aria-pressed={color === '#b84b24'}
                  onClick={() => setColor('#b84b24')}
                ></button>
                <button
                  style={{ '--swatch': '#6c4b8f' } as React.CSSProperties}
                  data-color="#6c4b8f"
                  aria-label={c.design.studio15}
                  aria-pressed={color === '#6c4b8f'}
                  onClick={() => setColor('#6c4b8f')}
                ></button>
                <button
                  style={{ '--swatch': '#416352' } as React.CSSProperties}
                  data-color="#416352"
                  aria-label={c.design.studio16}
                  aria-pressed={color === '#416352'}
                  onClick={() => setColor('#416352')}
                ></button>
              </div>
              <button
                className="demo-mode"
                id="demo-mode"
                aria-pressed={dark}
                onClick={() => setDark(!dark)}
              >
                {dark ? c.design.studioLight : c.design.studio17}
              </button>
            </div>
            <div
              id="work-controls"
              className="control-group"
              hidden={tab !== 'work'}
            >
              <div
                className="work-filters"
                role="group"
                aria-label={c.design.studio18}
              >
                <button
                  data-filter="all"
                  aria-pressed={filter === 'all'}
                  onClick={() => setFilter('all')}
                >
                  {c.design.studio19}
                </button>
                <button
                  data-filter="design"
                  aria-pressed={filter === 'design'}
                  onClick={() => setFilter('design')}
                >
                  {c.design.studio20}
                </button>
                <button
                  data-filter="video"
                  aria-pressed={filter === 'video'}
                  onClick={() => setFilter('video')}
                >
                  {c.design.studio21}
                </button>
              </div>
            </div>
            <div
              id="order-controls"
              className="control-group"
              hidden={tab !== 'order'}
            >
              <button
                className="demo-mode"
                id="reorder"
                onClick={() => setAboutFirst(!aboutFirst)}
              >
                {aboutFirst ? c.design.studioWorkFirst : c.design.studio22}
              </button>
              <p className="control-note">{c.design.studio23}</p>
            </div>
          </div>
          <div className="demo-canvas">
            <div
              className={`live-preview ${dark ? 'dark' : ''}`}
              style={{ '--preview-accent': color } as React.CSSProperties}
              id="live-preview"
            >
              <div className="window-bar">
                <span dir="ltr">{c.design.studio24}</span>
                <i aria-hidden="true">{'● ● ●'}</i>
              </div>
              <div className="preview-content">
                <div className="preview-heading">
                  <span className="preview-avatar">{c.design.studio25}</span>
                  <div>
                    <h3>{c.design.studio26}</h3>
                    <p>{c.design.studio27}</p>
                  </div>
                  <span className="preview-contact">{c.design.studio28}</span>
                </div>
                <div id="preview-sections">
                  {aboutFirst && about}
                  <div className="preview-projects" id="preview-work">
                    <div
                      className="sample-project violet"
                      hidden={filter === 'video'}
                    >
                      <strong dir="ltr">
                        {c.design.studio29}
                        <br />
                        {c.design.studio30}
                      </strong>
                      <span>{c.design.studio31}</span>
                    </div>
                    <div
                      className="sample-project apricot"
                      hidden={filter === 'video'}
                    >
                      <strong>
                        {c.design.studio32}
                        <br />
                        {c.design.studio33}
                      </strong>
                      <span>{c.design.studio34}</span>
                    </div>
                    <div
                      className="sample-project reel"
                      hidden={filter === 'design'}
                    >
                      <span className="play-mark">{'▷'}</span>
                      <strong>{c.design.studio35}</strong>
                      <span>{c.design.studio36}</span>
                    </div>
                  </div>
                  {!aboutFirst && about}
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="demo-footnote">{c.design.studio39}</p>
      </div>
    </section>
  )
}
