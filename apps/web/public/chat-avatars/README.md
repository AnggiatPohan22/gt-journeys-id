# Chat Widget — Preset Agent Avatars

Bawaan Phase 4.50.7 polish. Empat SVG ready-to-use untuk field
`agentAvatar` di block channel di CMS.

## Cara pakai

1. Buka `/admin/collections/media` di CMS admin.
2. Klik "Add New" → upload salah satu file di folder ini:
   - `agent-01-sarah.svg` — perempuan, tone hangat (kuning/amber). Cocok untuk Sales/CS.
   - `agent-02-arjun.svg` — laki-laki, tone tenang (cyan). Cocok untuk Support.
   - `agent-03-maya.svg` — perempuan rambut panjang, tone hangat (pink). Cocok untuk Reservation.
   - `agent-04-team.svg` — grup 3 orang, tone biru. Cocok untuk kartu "Team" umum.
3. Buka `/admin/globals/chat-widget` → tab Channels → block yang mau di-edit → field **agentAvatar** → pilih media yang baru di-upload.

## Kenapa SVG?

Vector = tajam di semua resolusi (Retina/2x/3x), file kecil (~600 bytes), no
raster pixelation. Dominan di brand palette site (kuning/cyan/pink/biru
mengikuti Tailwind config).

## Custom avatar

Style sendiri? Upload apapun ke Media (PNG/JPG/SVG); min recommended 96×96,
square, transparent background bila mau ring di widget popup.
