'use client'

import React, { useState } from 'react'
import { resolveVideoUrl } from '@/lib/video'
import type { LandingDashItem } from '@/lib/landing-copy'

/**
 * The dashboard, shown one claim at a time.
 *
 * A list of features and a strip of screenshots are two separate things to
 * read; joined, the reader picks what they care about and the proof of it
 * appears beside the words. Only one line is open at a time — a column of
 * open paragraphs is a column of text again, and the picture would have no
 * one line to belong to.
 *
 * The media is not loaded until its line is opened, and a video waits for a
 * press: four autoplaying clips in a section nobody scrolled to yet is the
 * whole page's weight spent on the part being skimmed.
 */
export default function DashShowcase({
  items,
  playLabel,
}: {
  items: LandingDashItem[]
  playLabel: string
}) {
  const [open, setOpen] = useState(0)
  const [playing, setPlaying] = useState<number | null>(null)
  const current = items[open]
  const link = resolveVideoUrl(current?.videoUrl)
  const poster = current?.poster || current?.imageUrl || null

  return (
    <div className="lp-dash">
      <div className="lp-dash-list">
        {items.map((it, i) => {
          const on = i === open
          return (
            <div className={`lp-dash-row${on ? ' on' : ''}`} key={it.t + i}>
              <button
                type="button"
                className="lp-dash-head"
                aria-expanded={on}
                onClick={() => {
                  setOpen(i)
                  setPlaying(null)
                }}
              >
                <span>{it.t}</span>
                <i aria-hidden="true" />
              </button>
              {/* Rendered either way so the row can be measured and animated,
                  and so a reader with JavaScript off still gets every word. */}
              <div className="lp-dash-body" hidden={!on}>
                <p>{it.d}</p>
                {/* On a narrow screen the media belongs under the line it
                    explains; the column beside it only exists on a wide one. */}
                <div className="lp-dash-media-inline">
                  <Media
                    item={it}
                    link={link}
                    poster={poster}
                    playing={playing === i}
                    onPlay={() => setPlaying(i)}
                    playLabel={playLabel}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="lp-dash-media">
        {current && (
          <Media
            item={current}
            link={link}
            poster={poster}
            playing={playing === open}
            onPlay={() => setPlaying(open)}
            playLabel={playLabel}
          />
        )}
      </div>
    </div>
  )
}

function Media({
  item,
  link,
  poster,
  playing,
  onPlay,
  playLabel,
}: {
  item: LandingDashItem
  link: ReturnType<typeof resolveVideoUrl>
  poster: string | null
  playing: boolean
  onPlay: () => void
  playLabel: string
}) {
  if (link) {
    if (playing) {
      return link.kind === 'file' ? (
        <video className="lp-dash-frame" src={link.url} controls autoPlay playsInline />
      ) : (
        <iframe
          className="lp-dash-frame"
          src={`${link.url}${link.url.includes('?') ? '&' : '?'}autoplay=1&rel=0`}
          title={item.t}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      )
    }
    return (
      <button type="button" className="lp-dash-frame lp-dash-play" onClick={onPlay} aria-label={playLabel}>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" loading="lazy" />
        ) : (
          <span className="lp-dash-blank" />
        )}
        <span className="lp-video-play" aria-hidden="true">
          <i />
        </span>
      </button>
    )
  }

  if (item.imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="lp-dash-frame" src={item.imageUrl} alt={item.t} loading="lazy" />
  }

  // Nothing uploaded for this line yet: a plain panel rather than a hole.
  return <span className="lp-dash-frame lp-dash-blank" />
}
