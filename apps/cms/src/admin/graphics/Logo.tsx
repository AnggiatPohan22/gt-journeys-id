import React from 'react'

/**
 * Brand Logo untuk halaman login admin (menggantikan logo default Payload).
 * Didaftarkan di `admin.components.graphics.Logo`.
 * Badge monogram gradient (ocean→leaf) + wordmark GtJourneysID.
 */
/** const Logo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
    <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Giattech">
      <defs>
        <linearGradient id="dnj-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b3a4b" />
          <stop offset="1" stopColor="#6b9080" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#dnj-logo-grad)" />
      <text
        x="32"
        y="33"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Geist, system-ui, sans-serif"
        fontSize="26"
        fontWeight="700"
        fill="#ffffff"
        letterSpacing="-1"
      >
        DJ
      </text>
    </svg>
    <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--theme-text)' }}>
        Giattech - CMS Dashbord
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--theme-elevation-450)', marginTop: 2 }}>
        
      </div>
    </div>
  </div>
) **/

const Logo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <img width="100" height="80" role="img" aria-label="Giattech"
        src="/favicon.png" 
        alt="Brand Logo" 
        style={{ maxWidth: '200px', height: 'auto' }} 
      />
  </div>
)

export default Logo;
