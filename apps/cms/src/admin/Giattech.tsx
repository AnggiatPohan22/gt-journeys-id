import React from 'react'

/**
 * Giattech — logo developer di header ATAS sidebar (slot `beforeNavLinks`).
 * HANYA logo. Tombol collapse memakai tombol NATIVE Payload
 * (`.template-default__nav-toggler`) — satu-satunya tombol yang tetap hidup
 * saat sidebar ter-collapse (ada di LUAR `.nav`), jadi bisa membuka lagi.
 * Native itu di-styling + disejajarkan dengan logo lewat admin-global.css.
 *
 * Logo swap per tema: white (dark) / navy (light) — posisi tetap.
 * Aset di apps/cms/public/logo-giattech (Next serve di root `/`).
 */
const Giattech = () => (
  <div className="dnj-navhead" aria-label="Developed by giattech">
    <span className="dnj-navhead__logo">
      <img
        className="dnj-giattech__img dnj-giattech__img--light"
        src="/logo-giattech/navy-logo-giattech.png"
        alt="giattech"
      />
      <img
        className="dnj-giattech__img dnj-giattech__img--dark"
        src="/logo-giattech/white-logo-giattech.png"
        alt="giattech"
      />
    </span>
  </div>
)

export default Giattech
