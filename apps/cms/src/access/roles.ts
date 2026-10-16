import type { Access, FieldAccess } from 'payload'

// ─── Role Checkers ───────────────────────────────────────

export const isEditor: Access = ({ req: { user } }) => {
  return !!user // any authenticated user
}

export const isAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  return ['admin', 'super-admin'].includes(user.role)
}

export const isSuperAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'super-admin'
}

// Phase 4.74.4.1 (Stage 4.1) — `api` role untuk dedicated API user
// yang dipakai web→CMS via `PAYLOAD_API_KEY`. Finding #9 (High):
// sebelumnya key milik admin-role → full power. Role baru punya scope
// terbatas (lihat `isApiOrAdmin` di bawah) — HANYA collection yang
// web app POST/PATCH/DELETE lewat HTTP yang di-widen.
export const isApi: Access = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'api'
}

/**
 * Widen gate: admin + super-admin + api. Dipakai di collection yang
 * web app perlu akses (bookings, otp-verifications, newsletter-subscribers).
 * Admin UI reach tidak berubah — api user tidak login manual.
 */
export const isApiOrAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  return ['admin', 'super-admin', 'api'].includes(user.role)
}

// ─── Collection-level Access ─────────────────────────────

/** Anyone authenticated can read */
export const authenticatedRead: Access = ({ req: { user } }) => !!user

/** Admin+ can create new entries */
export const adminCreate: Access = isAdmin

/** Any authenticated user can update (field-level restricts what) */
export const authenticatedUpdate: Access = ({ req: { user } }) => !!user

/** Only super-admin can delete */
export const superAdminDelete: Access = isSuperAdmin

// ─── Field-level Access ──────────────────────────────────

/** Only admin+ can see/edit this field */
export const adminFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (!user) return false
  return ['admin', 'super-admin'].includes(user.role)
}

/** Only super-admin can see/edit this field */
export const superAdminFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (!user) return false
  return user.role === 'super-admin'
}
