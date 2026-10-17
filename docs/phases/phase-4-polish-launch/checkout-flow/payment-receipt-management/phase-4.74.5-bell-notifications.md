## Phase: 4.74.5 — Admin Dashboard Bell Notifications (Polling MVP)
**Tanggal**: 2026-10-17
**Status**: ⚠️ Code selesai · **butuh dev server restart** (new endpoint tidak hot-reload)
**Dikerjakan oleh**: Claude Code (Opus 4.7)
**Parent**: [`phase-4.74-payment-receipt-mgmt-analysis.md`](phase-4.74-payment-receipt-mgmt-analysis.md)
**Dependency**: [`phase-4.74.4-approve-reject.md`](phase-4.74.4-approve-reject.md)

### Ringkasan
Sidebar bell admin dengan unread badge count + side-panel list 20 notif terbaru. Polling `/api/admin-notifications/unread-count` tiap 30s (MVP). Per-user read tracker via POST `/api/admin-notifications/:id/read` (idempotent). Click row → deep-link ke booking atau payment-proof edit view + auto-mark-read.

### File yang Berubah / Baru

| File | Jenis | Perubahan |
|---|---|---|
| `apps/cms/src/collections/AdminNotifications.ts` | Modified | Tambah 2 custom endpoints: `GET /unread-count` (admin+ guard, returns `{count, items: [20 latest with read flag per current user]}`) + `POST /:id/read` (idempotent — skip jika user sudah ada di readBy[], else push `{user, readAt}`). |
| `apps/cms/src/admin/BellNotifications.tsx` | **NEW** | React client component (`'use client'`): useState untuk count+items+open, useEffect polling 30s + click-outside listener, fetch wrappers, inline styles (bukan `<style>` tag — avoid HMR hook mismatch). Render SVG bell icon + badge + side-panel list dgn severity dot color + relative time + deep-link via `window.location.href`. |
| `apps/cms/src/payload.config.ts` | Modified | Register `/admin/BellNotifications#default` di `admin.components.afterNavLinks` (sebelum SidebarFooter + NavAccordion). |

### API Endpoints

**GET /api/admin-notifications/unread-count**
- Auth: admin+ (via session cookie).
- Response: `{ ok: true, count: number, items: Array<NotifItem> }`
  - `count`: jumlah dari 20 latest yg `readBy[].user !== currentUser.id`.
  - `items`: 20 doc terbaru (sort `-createdAt`, depth 0) dgn fields `id, type, title, body, severity, createdAt, booking?, paymentProof?, read: boolean`.
- Response 401 jika unauthenticated / role bukan admin+.

**POST /api/admin-notifications/:id/read**
- Auth: admin+.
- Idempotent: check readBy[] — jika user sudah ada, return `{ok:true, idempotent:true}`; else push `{user: req.user.id, readAt: now}`.
- Response 400 jika id invalid, 500 jika update gagal.

### UX

- **Mount point**: `afterNavLinks` (sidebar area, selalu terlihat baik di dashboard maupun edit view).
- **Button**: inline-flex dengan SVG bell icon + "Notifications" label + badge angka (red fill, max display "99+").
- **Panel**: absolute positioned (left: 100%, bottom: 0 — mengambang ke kanan sidebar), 340px wide, max-height 480px, scroll internal, border + shadow.
- **Row**: severity dot (info blue / warning orange / critical red) + title + body + meta (relative time + type). Opacity 0.6 kalau sudah read.
- **Click row**: fetch `/read` endpoint (silent fail) + `window.location.href = targetHref(n)` ke booking atau payment-proof edit.
- **Click-outside**: close panel.
- **Polling 30s**: cost rendah (~2 req/min per admin tab); swap ke SSE/DO kalau >5s latency jadi concern.

### Known Issue: Dev Server Restart Required

Setelah pertama kali menambahkan endpoint custom di collection + komponen client baru, Next.js dev server (`next dev`) tidak selalu hot-reload chunk admin page secara benar — menghasilkan `ChunkLoadError: Loading chunk app/(payload)/admin/[[...segments]]/page failed`. 

**Fix**: hard restart dev server:
```bash
# Terminal CMS: Ctrl+C, lalu:
cd apps/cms && pnpm dev
```

Setelah restart, chunk admin page di-regenerate dengan importMap + endpoint handler terdaftar. Browser hard reload (`Ctrl+Shift+R`) membersihkan cache.

### Testing

#### Programmatic
- [x] TypeScript errors terbatas pada drift pre-existing (`defaultSort` pada 6+ collection lain = Payload type baseline, bukan baru dari 4.74.5).
- [x] File `importMap.js` auto-regenerated oleh Payload mendaftarkan `BellNotifications` + `SidebarFooter` + 4 komponen lain yang sudah ada.

#### Pending (butuh dev restart + login)
- [ ] Bell muncul di sidebar bawah (above SidebarFooter + NavAccordion).
- [ ] Badge count = 0 saat pertama login (admin belum pernah dapat notif).
- [ ] Trigger notif via POST booking baru (dari web `/api/bookings/create` atau submit payment proof) → polling 30s berikutnya badge naik ke 1.
- [ ] Click bell → panel open, list 1 row dgn severity dot warning + title "Payment proof submitted" + body "From ... IDR ...".
- [ ] Click row → navigate ke `/admin/collections/payment-proofs/<id>` + badge turun ke 0 (hook `markRead` dipanggil silent).
- [ ] Reload halaman → row tetap read (opacity 0.6).
- [ ] Second admin user login (user B): badge mereka masih counting row yg sama (karena per-user readBy[], bukan global).
- [ ] Click outside panel → close.
- [ ] 20+ notifs: hanya 20 terbaru tampil (list limited di endpoint).

### Known Deferred

- **Mark all read** button di panel header (nice-to-have, defer 4.74.6).
- **Filter per type** dropdown di panel (defer).
- **SSE/WebSocket** real-time (replace polling) — defer sampai cost/UX justified.
- **TTL cleanup cron** untuk notif > 60 hari (defer 4.74.6).
- **Notification sound** / browser toast API (defer).
- **Admin profile icon** dgn popover untuk logout (sudah ada di SidebarFooter — tidak diubah).

### Rollback

Revert 3 file:
1. `apps/cms/src/collections/AdminNotifications.ts` — hapus `endpoints: [...]` + 2 endpoint consts.
2. `apps/cms/src/admin/BellNotifications.tsx` — delete file.
3. `apps/cms/src/payload.config.ts` — hapus 1 line `'/admin/BellNotifications#default'` di `afterNavLinks`.

Zero schema change (readBy[] schema sudah ada sejak 4.74.1). Rows AdminNotifications tetap intact.

### Dokumentasi yang Diupdate

- [x] `docs/PROGRESS.md` — 1 baris Phase 4.74.5
- [ ] `docs/02-DATABASE-SCHEMA.md` — N/A
- [ ] `docs/04-RBAC.md` — defer ke 4.74.6
- [ ] `docs/08-SECURITY-PATCH.md` — defer ke 4.74.6

### Next Step

Sub-phase **4.74.6** — Hardening + QA closing: EXIF strip di endpoint upload, R2 bucket terpisah `gt-journeys-payment-proofs` dgn 12-month lifecycle, TTL cron untuk AdminNotifications > 60 hari, HTML template polish email reject + default `payment_whatsapp_body` include `{{paymentUploadUrl}}`, UAT 3-role matrix, security master log entry, series closing summary.
