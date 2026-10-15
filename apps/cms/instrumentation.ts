/**
 * Next.js instrumentation hook — dijalankan sekali saat server boot (SEBELUM
 * request pertama masuk). Kita pakai untuk warm-up Payload singleton supaya
 * tidak ada race di cold start:
 *
 * Payload internal cache di `global._payload` (Map) tidak fully race-safe
 * antara `_cached.get(key)` dan `_cached.set(key, ...)`. Di Next dev cold
 * start, browser fire beberapa RSC/prefetch paralel untuk `/admin` sekaligus
 * → dua init konkuren → dua schema init call → "index already exists" 500.
 *
 * Dengan warm-up di sini, singleton sudah berdiri sebelum request pertama,
 * jadi semua request paralel berikutnya hit cache.
 *
 * Note: schema push sudah di-disable via `push: false` di sqliteAdapter
 * (payload.config.ts) — instrumentation ini adalah lapisan kedua supaya init
 * itu sendiri hanya jalan sekali.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  try {
    const { getPayload } = await import('payload')
    const configMod = await import('./src/payload.config')
    await getPayload({ config: configMod.default })
  } catch (e) {
    // Non-fatal: kalau warm-up gagal, request pertama akan tetap trigger init
    // via jalur Payload's Next integration. Log supaya kalau ada masalah
    // startup masih visible.
    // eslint-disable-next-line no-console
    console.warn('[instrumentation] Payload warm-up failed:', (e as Error)?.message ?? e)
  }
}
