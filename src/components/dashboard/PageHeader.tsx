import React from 'react'
import NavIcon from './icons'

// Map the legacy emoji title-glyphs to the flat line-icon set.
const EMOJI_TO_ICON: Record<string, string> = {
  '🗂️': 'projects',
  '🖼️': 'image',
  '⭕': 'highlights',
  '📊': 'analytics',
  '🏷️': 'categories',
  '🎨': 'palette',
  '🧩': 'sections',
  '☰': 'navbar',
  '📱': 'phone',
  '✏️': 'edit',
  '👥': 'users',
  '👤': 'users',
  '🏆': 'achievements',
  '💬': 'testimonials',
  '📖': 'articles',
  '📚': 'articles',
  '🔗': 'social',
  '🎬': 'video',
  '🌍': 'globe',
  '👁️': 'eye',
  '⬆️': 'upload',
}

export default function PageHeader({
  icon,
  title,
  subtitle,
  actions,
}: {
  icon?: string
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  const iconId = icon ? EMOJI_TO_ICON[icon] : undefined
  return (
    <div className="page-head">
      <div className="head-actions">{actions}</div>
      <div className="titles">
        <h1>
          {title}{' '}
          {icon &&
            (iconId ? (
              <span className="head-ic">
                <NavIcon id={iconId} size={22} />
              </span>
            ) : (
              <span>{icon}</span>
            ))}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  )
}
