import React from 'react'

export default function Achievements({
  items,
}: {
  items: { id: number; title: string; value: string }[]
}) {
  if (items.length === 0) return null
  return (
    <section className="section" id="achievements">
      <div className="container">
        <div className="counter-grid">
          {items.map((a) => (
            <div className="counter" key={a.id}>
              <b>{a.value}</b>
              <span>{a.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
