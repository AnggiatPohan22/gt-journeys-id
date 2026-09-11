'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

/**
 * NavAccordion — perilaku accordion grup sidebar (Phase 4.5 → 4.7).
 *
 *  1. FOLLOW NAVIGATION: setiap pindah halaman (termasuk lewat Quick Access),
 *     grup yang MEMUAT halaman aktif dibuka otomatis, grup lain ditutup —
 *     sehingga item aktif selalu terlihat tanpa buka grup manual.
 *  2. SINGLE-OPEN: klik satu grup untuk membuka → grup lain menutup otomatis.
 *
 * Grup aktif dideteksi dengan mencocokkan `href` link nav dengan `pathname`
 * (bukan class `.active` Payload) → tahan race timing & tetap kebaca walau grup
 * sedang collapsed (Collapsible Payload memakai animate-height, anak tetap di DOM).
 *
 * Perubahan state via klik `.nav-group__toggle` native → animasi + persist tetap
 * dari Payload. `programmatic` ref mencegah klik terprogram memicu ulang listener.
 * Defensif: kalau DOM berubah, navigasi tak pernah rusak. Render null.
 */
const NavAccordion = () => {
  const pathname = usePathname()
  const programmatic = useRef(false)

  // ── 1. Buka grup halaman aktif, tutup lainnya (saat navigasi) ──
  useEffect(() => {
    let cancelled = false

    const findActiveGroup = (): HTMLElement | null => {
      // Payload me-render link koleksi/global aktif dengan bentuk berbeda:
      //   - list-view eksak (pathname === href) → <div class="nav__link"> TANPA href
      //   - selain itu (dashboard, detail view, sibling) → <a class="nav__link" href="…">
      // Karena itu kita tidak boleh memfilter [href] di selector: div tanpa href
      // justru penanda paling definitif bahwa grup itulah pemilik halaman aktif.
      const links = Array.from(
        document.querySelectorAll<HTMLElement>('.nav-group .nav__link'),
      )
      let activeGroup: HTMLElement | null = null
      let bestLen = -1
      for (const link of links) {
        const href = link.getAttribute('href')
        if (!href) {
          // <div> tanpa href = list-view aktif eksak. Tandai grup ini sebagai
          // aktif dengan bobot maksimal — tidak boleh dikalahkan href match manapun.
          const group = link.closest<HTMLElement>('.nav-group')
          if (group) {
            activeGroup = group
            bestLen = Number.POSITIVE_INFINITY
          }
          continue
        }
        if (href === '/admin' || href === '/admin/') continue
        if (pathname === href || pathname.startsWith(href + '/')) {
          const group = link.closest<HTMLElement>('.nav-group')
          if (group && href.length > bestLen) {
            activeGroup = group
            bestLen = href.length
          }
        }
      }
      return activeGroup
    }

    const sync = () => {
      if (cancelled) return
      const groups = Array.from(document.querySelectorAll<HTMLElement>('.nav-group'))
      if (!groups.length) return
      const active = findActiveGroup()
      programmatic.current = true
      groups.forEach((g) => {
        const collapsed = g.classList.contains('nav-group--collapsed')
        const toggle = g.querySelector<HTMLElement>('.nav-group__toggle')
        if (!toggle) return
        if (g === active) {
          if (collapsed) toggle.click() // buka grup aktif
        } else if (!collapsed) {
          toggle.click() // tutup grup non-aktif
        }
      })
      programmatic.current = false
    }

    // Jalankan setelah Payload selesai render nav (beri sedikit jeda).
    const t = window.setTimeout(sync, 60)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [pathname])

  // ── 2. Single-open manual: klik grup untuk buka → tutup grup lain ──
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (programmatic.current) return
      const toggle = (e.target as HTMLElement | null)?.closest?.('.nav-group__toggle')
      if (!toggle) return
      const group = toggle.closest('.nav-group')
      if (!group) return
      window.setTimeout(() => {
        if (group.classList.contains('nav-group--collapsed')) return // sedang menutup
        programmatic.current = true
        document.querySelectorAll<HTMLElement>('.nav-group').forEach((g) => {
          if (g !== group && !g.classList.contains('nav-group--collapsed')) {
            g.querySelector<HTMLElement>('.nav-group__toggle')?.click()
          }
        })
        programmatic.current = false
      }, 0)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}

export default NavAccordion
