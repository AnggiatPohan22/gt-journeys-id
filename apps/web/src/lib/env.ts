/**
 * Env helpers — Phase 4.66.8.
 *
 * Fail-fast di production: throw kalau env-secret yang wajib untuk
 * fungsi security-critical tidak diset. Dev tetap mengizinkan fallback
 * di modul masing-masing supaya `pnpm dev` tanpa `.env` masih bisa
 * jalan (dengan warning).
 *
 * Kenapa module level: `import.meta.env.PROD` = build-time constant di
 * Astro; kalau import ini di-run di prod bundle, dan env kosong,
 * request pertama sudah crash dengan pesan jelas. Lebih baik daripada
 * silent fallback ke default "dnj-dev-…" secret yang mengizinkan HMAC
 * dipalsukan attacker.
 */

/** `true` kalau build production (Cloudflare Pages / `astro build`). */
export const IS_PROD = Boolean(import.meta.env.PROD)

/**
 * Ambil env yang wajib. Di production → throw kalau kosong. Di dev →
 * return `fallback` (opsional) + `console.warn` supaya jelas di log.
 */
export function requireEnv(name: string, value: string | undefined, fallback?: string): string {
  const v = (value ?? '').trim()
  if (v) return v
  if (IS_PROD) {
    throw new Error(
      `[env] Missing required env ${name} in production. Set it via wrangler secret / Pages env.`,
    )
  }
  if (fallback !== undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[env] ${name} is empty — using dev fallback (never do this in prod).`)
    return fallback
  }
  return ''
}

/**
 * Non-fatal check: warn di dev, throw di prod, tapi tanpa fallback.
 * Return string kosong di dev — caller bertanggung jawab handle.
 */
export function requireEnvStrict(name: string, value: string | undefined): string {
  const v = (value ?? '').trim()
  if (v) return v
  if (IS_PROD) {
    throw new Error(`[env] Missing required env ${name} in production.`)
  }
  // eslint-disable-next-line no-console
  console.warn(`[env] ${name} is empty in dev — related feature will be disabled.`)
  return ''
}
