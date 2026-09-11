'use client'

import React, { useState } from 'react'

/**
 * The explainer video, loaded only when someone asks for it.
 *
 * A YouTube iframe costs the page close to a megabyte of script before anyone
 * has pressed anything, and a video file set to autoplay starts pulling bytes
 * the moment it scrolls into view. Until the click this is a picture with a
 * play button on it; the player replaces it in place and starts at once, so
 * the click is the only one the reader makes.
 */
export default function VideoFacade({
  kind,
  src,
  poster,
  title,
  duration,
  playLabel,
}: {
  kind: 'file' | 'iframe'
  src: string
  poster?: string | null
  title: string
  duration?: string
  playLabel: string
}) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return kind === 'file' ? (
      <video className="lp-mock-media" src={src} poster={poster ?? undefined} controls autoPlay playsInline />
    ) : (
      <iframe
        className="lp-mock-media"
        src={`${src}${src.includes('?') ? '&' : '?'}autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    )
  }

  return (
    <button type="button" className="lp-video" onClick={() => setPlaying(true)} aria-label={playLabel}>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="lp-mock-media" src={poster} alt="" loading="lazy" />
      ) : kind === 'file' ? (
        /* No poster set: the file's own first frame. The fragment skips the
           black frame most exports open on. */
        <video
          className="lp-mock-media"
          src={`${src}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          tabIndex={-1}
          aria-hidden="true"
        />
      ) : (
        <span className="lp-mock-media lp-video-blank" />
      )}
      <span className="lp-video-play" aria-hidden="true">
        <i />
      </span>
      {duration && <span className="lp-video-time">{duration}</span>}
    </button>
  )
}
