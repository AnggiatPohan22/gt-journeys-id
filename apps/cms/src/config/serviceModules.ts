/**
 * Service Modules registry — SINGLE SOURCE OF TRUTH (Phase 4.61.1 → 4.61.2).
 *
 * Dipakai oleh:
 *  - globals/SiteFeatures.ts (generate field checkbox + select desain, hidden)
 *  - admin/ServiceModulesManager.tsx (UI kartu per service)
 *
 * Plain data (tanpa import Payload) supaya aman di-import komponen client.
 * Tambah modul baru = 1 entry di sini → otomatis muncul di CMS + UI.
 * `name` harus match ServiceModule enum di apps/web/src/config/modules.ts.
 */
export type CardDesignValue = 'compact' | 'detailed' | 'ticket'

export interface ServiceModuleDef {
  name: string
  label: string
  /** Emoji ringan untuk header kartu di UI admin. */
  icon: string
  defaultDesign: CardDesignValue
}

export const SERVICE_MODULES: ServiceModuleDef[] = [
  { name: 'tours',            label: 'Tours & Activities', icon: '🧭', defaultDesign: 'compact' },
  { name: 'accommodations',   label: 'Villas & Hotels',    icon: '🏨', defaultDesign: 'compact' },
  { name: 'waterActivities',  label: 'Water Activities',   icon: '🌊', defaultDesign: 'compact' },
  { name: 'yacht',            label: 'Private Yacht',      icon: '⛵', defaultDesign: 'compact' },
  { name: 'restaurants',      label: 'Restaurants',        icon: '🍽️', defaultDesign: 'compact' },
  { name: 'weddings',         label: 'Weddings & Events',  icon: '💍', defaultDesign: 'compact' },
  { name: 'rentals',          label: 'Rental Service',     icon: '🚗', defaultDesign: 'compact' },
  { name: 'spa',              label: 'Spa & Wellness',     icon: '💆', defaultDesign: 'compact' },
  { name: 'ferryTickets',     label: 'Ferry Tickets',      icon: '⛴️', defaultDesign: 'ticket' },
]

/** Ke-3 jenis desain kartu — tampil untuk SEMUA service (Phase 4.61.2). */
export const CARD_DESIGN_OPTIONS: { label: string; value: CardDesignValue; desc: string }[] = [
  { label: 'Compact',  value: 'compact',  desc: 'Grid tile kecil (gambar + judul + harga).' },
  { label: 'Detailed', value: 'detailed', desc: 'Kartu kaya (multi-gambar, rating, amenity, Book Now).' },
  { label: 'Ticket',   value: 'ticket',   desc: 'Kartu rute (Origin → Arrival, jam, harga) — untuk ferry/transport.' },
]
