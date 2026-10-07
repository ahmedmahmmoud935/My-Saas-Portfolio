'use client'

import React, { useEffect, useState } from 'react'
import VideoLightbox, { youTubePoster } from './VideoLightbox'

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
  closeLabel,
  playEvent,
}: {
  kind: 'file' | 'iframe'
  src: string
  poster?: string | null
  title: string
  duration?: string
  playLabel: string
  closeLabel: string
  /** A window event that opens the player too, for a button outside the picture. */
  playEvent?: string
}) {
  // The press opens the player over the page; the picture stays where it was.
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playEvent) return
    const open = () => setPlaying(true)
    window.addEventListener(playEvent, open)
    return () => window.removeEventListener(playEvent, open)
  }, [playEvent])
  poster = poster || (kind === 'iframe' ? youTubePoster(src) : null)

  return (
    <>
    {playing && <VideoLightbox kind={kind} src={src} title={title} closeLabel={closeLabel} onClose={() => setPlaying(false)} />}
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
    </>
  )
}
