/**
 * Payment Proof store — Phase 4.74.2.
 *
 * Server-side wrapper untuk 2 flow:
 *   1. Upload file bukti ke Payload `media` collection (multipart POST).
 *   2. Create record di `payment-proofs` collection (JSON POST, pointing
 *      ke media id dari step 1).
 *
 * Reuse pola `createBooking` di `./store.ts` — autenticate pakai
 * `PAYLOAD_API_KEY` (role `api`, Phase 4.74.4.1).
 *
 * File validation (MIME + size) dilakukan di endpoint-layer SEBELUM
 * panggil store ini — supaya reject early tanpa membuat trip ke CMS.
 */

import { requireEnvStrict, IS_PROD } from '@lib/env'

const CMS_URL = import.meta.env.CMS_URL || 'http://localhost:3030'
const API_KEY = IS_PROD
  ? requireEnvStrict('PAYLOAD_API_KEY', import.meta.env.PAYLOAD_API_KEY)
  : import.meta.env.PAYLOAD_API_KEY || ''

export type UploadMediaResult =
  | { ok: true; id: number; url?: string }
  | { ok: false; reason: 'misconfigured' | 'server_error'; detail?: string }

/**
 * Upload file ke `media` collection. Payload accept multipart POST
 * dgn field `file` + optional `alt`/`caption`. Return media.id untuk
 * di-link dari PaymentProof.proofFile.
 *
 * NOTE: EXIF strip untuk JPEG di-defer ke sub-phase 4.74.6 hardening
 * (butuh image processing lib di edge runtime). Interim: terima file
 * apa-adanya; admin review bisa lihat metadata di preview.
 */
export async function uploadProofFileToMedia(
  file: File,
  altText: string,
): Promise<UploadMediaResult> {
  if (!CMS_URL || !API_KEY) return { ok: false, reason: 'misconfigured' }

  const form = new FormData()
  form.append('file', file, file.name)
  // Payload Media collection requires `alt` — isi dgn konteks booking ref.
  form.append('_payload', JSON.stringify({ alt: altText, category: 'other' }))

  let res: Response
  try {
    res = await fetch(`${CMS_URL.replace(/\/$/, '')}/api/media`, {
      method: 'POST',
      headers: {
        Authorization: `users API-Key ${API_KEY}`,
      },
      body: form,
    })
  } catch (err) {
    return { ok: false, reason: 'server_error', detail: (err as Error).message }
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    return { ok: false, reason: 'server_error', detail: `${res.status}: ${body.slice(0, 200)}` }
  }

  const doc = await res.json().catch(() => ({}))
  const mediaDoc = (doc?.doc ?? doc) as { id?: number; url?: string }
  if (!mediaDoc?.id) {
    return { ok: false, reason: 'server_error', detail: 'media upload returned no id' }
  }
  return { ok: true, id: mediaDoc.id, url: mediaDoc.url }
}

export interface CreatePaymentProofInput {
  booking: number
  bookingRefSnapshot: string
  senderName: string
  senderBank: string
  amount: number
  currency?: string
  transferDate: string
  transferTime?: string
  proofFile: number
  customerNote?: string
  submittedAt: string
  submittedFromIpHash?: string
  submittedUserAgent?: string
}

export type CreatePaymentProofResult =
  | { ok: true; id: number }
  | { ok: false; reason: 'misconfigured' | 'server_error'; detail?: string }

export async function createPaymentProof(
  input: CreatePaymentProofInput,
): Promise<CreatePaymentProofResult> {
  if (!CMS_URL || !API_KEY) return { ok: false, reason: 'misconfigured' }

  let res: Response
  try {
    res = await fetch(`${CMS_URL.replace(/\/$/, '')}/api/payment-proofs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `users API-Key ${API_KEY}`,
      },
      body: JSON.stringify({ ...input, status: 'pending' }),
    })
  } catch (err) {
    return { ok: false, reason: 'server_error', detail: (err as Error).message }
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    return { ok: false, reason: 'server_error', detail: `${res.status}: ${body.slice(0, 200)}` }
  }

  const doc = await res.json().catch(() => ({}))
  const prDoc = (doc?.doc ?? doc) as { id?: number }
  if (!prDoc?.id) {
    return { ok: false, reason: 'server_error', detail: 'payment-proof create returned no id' }
  }
  return { ok: true, id: prDoc.id }
}
