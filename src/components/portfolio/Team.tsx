import React from 'react'

export type TeamMember = {
  id: number
  name: string
  role?: string | null
  bio?: string | null
  photoUrl?: string | null
}

/**
 * The people behind the work.
 *
 * A portfolio is written in the first person, which is right for one
 * freelancer and wrong for the three who share a studio name — the client
 * meeting them wants to know who they are dealing with. A face, a name, what
 * they do, and a line about them; in the order their own dashboard puts them.
 *
 * Server-rendered: nothing here reacts to anything, and a section of four
 * portraits has no reason to cost a kilobyte of JavaScript.
 */
export default function Team({ title, items }: { title: string; items: TeamMember[] }) {
  if (!items.length) return null

  return (
    <section className="section" id="team">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="team-grid">
          {items.map((m) => (
            <article className="team-card" key={m.id}>
              <div className="team-photo">
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photoUrl} alt={m.name} loading="lazy" />
                ) : (
                  // No photograph yet: their initial, rather than a grey box.
                  <span aria-hidden="true">{m.name?.[0]?.toUpperCase() || '؟'}</span>
                )}
              </div>
              <h3>{m.name}</h3>
              {m.role && <p className="team-role">{m.role}</p>}
              {m.bio && <p className="team-bio">{m.bio}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
