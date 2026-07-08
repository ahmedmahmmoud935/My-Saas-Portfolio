import React from 'react'

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
  return (
    <div className="page-head">
      <div className="head-actions">{actions}</div>
      <div className="titles">
        <h1>
          {title} {icon && <span>{icon}</span>}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  )
}
