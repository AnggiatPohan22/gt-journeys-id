/**
 * EXIF strip — Phase 4.74.6.
 *
 * Pure-JS JPEG EXIF stripper, Workers-runtime safe (zero npm dep, zero
 * image processing lib). Hanya untuk image/jpeg. Non-JPEG di-passthrough.
 *
 * Algorithm: scan JPEG marker stream, DROP semua APP1 (0xFFE1) segment
 * yang berisi EXIF (termasuk GPS, camera make/model, timestamp detail yg
 * bisa reveal lokasi/device customer). SOI (0xFFD8), SOS (0xFFDA), EOI
 * (0xFFD9) + semua segment lain di-preserve apa-adanya.
 *
 * JPEG marker format:
 *   - 0xFF 0xD8               → SOI (Start of Image, no length)
 *   - 0xFF 0xD9               → EOI (End of Image, no length)
 *   - 0xFF 0xDA ... (SOS)     → Start of Scan, diikuti compressed data
 *                               sampai 0xFF 0xD9 (next marker in-stream =
 *                               padded 0xFF 0x00 — "stuffed byte").
 *   - 0xFF 0xD0..0xD7         → RSTn (restart marker, no length).
 *   - 0xFF 0xXX (lainnya)     → Segment: next 2 bytes = length (big-endian,
 *                               INCLUDES the 2 length bytes themselves).
 *
 * NOTE: Juga drop APP0 kalau JFIF? Jangan — JFIF (APP0 0xFFE0) berisi
 * density info yg benign; keep. APP2 (0xFFE2) kadang ICC profile — keep
 * (bukan PII). Hanya APP1 (EXIF/XMP) yg strip.
 */

const MARKER = 0xff
const SOI = 0xd8
const EOI = 0xd9
const SOS = 0xda
const APP1 = 0xe1

export async function stripExifIfJpeg(file: File): Promise<File> {
  const mime = (file.type || '').toLowerCase()
  if (mime !== 'image/jpeg' && mime !== 'image/jpg') return file

  const buf = new Uint8Array(await file.arrayBuffer())
  // Sanity: must start with SOI.
  if (buf.length < 4 || buf[0] !== MARKER || buf[1] !== SOI) return file

  const out: number[] = [MARKER, SOI]
  let i = 2
  let strippedCount = 0

  while (i < buf.length) {
    // Scan to next marker byte.
    if (buf[i] !== MARKER) {
      // Unexpected non-marker — bail out, return original (safer than corrupt).
      return file
    }
    // Skip padding fill bytes (0xFF 0xFF ...).
    while (i < buf.length && buf[i] === MARKER && buf[i + 1] === MARKER) {
      out.push(MARKER)
      i++
    }
    if (i + 1 >= buf.length) break
    const code = buf[i + 1]

    // SOS → copy marker + segment header + ALL compressed data until EOI.
    if (code === SOS) {
      // Copy rest of file as-is (SOS payload is scanned with byte-stuffing,
      // too complex to re-parse; marker-based copy aman karena stuffed 0xFF 0x00
      // tetap valid di-stream copied byte-for-byte).
      for (let j = i; j < buf.length; j++) out.push(buf[j])
      break
    }

    // EOI → copy + end.
    if (code === EOI) {
      out.push(buf[i], buf[i + 1])
      i += 2
      break
    }

    // RSTn (restart) + SOI nested + standalone markers (no length).
    if (code >= 0xd0 && code <= 0xd7) {
      out.push(buf[i], buf[i + 1])
      i += 2
      continue
    }

    // Length-bearing segment.
    if (i + 3 >= buf.length) break
    const segLen = (buf[i + 2] << 8) | buf[i + 3] // includes 2 length bytes
    if (segLen < 2) return file // corrupt

    if (code === APP1) {
      // DROP this segment entirely (marker + length + payload).
      strippedCount++
      i += 2 + segLen
      continue
    }

    // Preserve segment.
    const end = i + 2 + segLen
    if (end > buf.length) return file
    for (let j = i; j < end; j++) out.push(buf[j])
    i = end
  }

  if (strippedCount === 0) return file

  // Reconstruct File (same name + mime, new byte array).
  const stripped = new Uint8Array(out)
  // Astro/Workers runtime supports File constructor (undici polyfill).
  return new File([stripped], file.name, {
    type: file.type,
    lastModified: file.lastModified,
  })
}
