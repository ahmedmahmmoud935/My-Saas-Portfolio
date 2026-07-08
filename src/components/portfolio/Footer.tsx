import React from 'react'

export default function Footer({ logo, name }: { logo: string; name: string }) {
  return (
    <footer className="footer">
      <div className="footer-logo display">{logo}</div>
      <div style={{ color: 'var(--text)', fontWeight: 700 }}>{name}</div>
      <div style={{ marginTop: 6 }}>
        © {new Date().getFullYear()} — Built with ViralPX
      </div>
    </footer>
  )
}
