/**
 * Passenger inline validation — Phase 4.69.4.
 *
 * Rule set yang dibagi SERVER-SIDE (SSOT, enforced di
 * `/api/bookings/create`) + CLIENT-SIDE (UX cepat, visual inline error
 * di `[slug].astro`). Keduanya share konstanta dan interpretasi rule
 * supaya tidak drift.
 *
 * Rules:
 * 1. **Passport number format**: generic (6–12 alfanumerik upper) +
 *    per-nationality regex (fallback ke generic kalau nationality
 *    tidak ada di PASSPORT_FORMATS).
 * 2. **DOB sanity vs passenger type**:
 *    - adult   >= 12 tahun pada tanggal departure
 *    - child    2–11 tahun pada tanggal departure
 *    - (infant 0–1 tahun — stepper existing belum support, skip utk MVP)
 * 3. **Issue date**: <= today AND >= DOB (passport tidak terbit sebelum lahir).
 * 4. **Expiry > Issue** (existing rule >= departure+6m dari phase 4.63 tetap jalan).
 * 5. **Duplicate passport number**: ≥ 2 passenger di 1 booking punya
 *    nomor passport sama → reject.
 *
 * Note: Rule-rule ini **opsional** (hanya diterapkan kalau field diisi).
 * firstName/lastName TETAP hard-required (dari phase 4.63). Passport
 * field keseluruhan tetap optional di MVP — operator ferry cek fisik
 * di gate.
 */

export interface PassengerForValidation {
  passengerType: 'adult' | 'child'
  firstName: string
  lastName: string
  nationality?: string | null
  dateOfBirth?: string | null
  passportNumber?: string | null
  passportIssueDate?: string | null
  passportExpiryDate?: string | null
}

export interface PassengerIssue {
  index: number
  field: 'passportNumber' | 'dateOfBirth' | 'passportIssueDate' | 'passportExpiryDate'
  code: string
  message: string
}

export const ADULT_MIN_YEARS = 12
export const CHILD_MIN_YEARS = 2
export const CHILD_MAX_YEARS = 11

/**
 * Per-nationality passport regex. Fallback generic bila nationality
 * tidak di-whitelist di sini. Pola di-approx-kan dari dokumentasi ICAO
 * / Wikipedia — tidak 100% strict (misal check-digit) tapi cukup untuk
 * tangkap typo nyata.
 */
export const PASSPORT_FORMATS: Record<string, { pattern: RegExp; hint: string }> = {
  // Indonesia: 1 letter + 7 digits, atau 2 letter + 7 digits (passport baru).
  Indonesia: { pattern: /^[A-Z]{1,2}\d{7}$/, hint: '1-2 huruf + 7 digit (contoh: A1234567 atau AB1234567)' },
  // Singapore: letter + 7 digits + letter (K1234567A pattern).
  Singapore: { pattern: /^[A-Z]\d{7}[A-Z]$/, hint: '1 huruf + 7 digit + 1 huruf (contoh: K1234567A)' },
  Malaysia:  { pattern: /^[A-Z]\d{8}$/,       hint: '1 huruf + 8 digit (contoh: A12345678)' },
  Philippines:{ pattern: /^[A-Z]\d{7}[A-Z]?$/, hint: '1 huruf + 7 digit (opsional huruf akhir)' },
  Thailand:  { pattern: /^[A-Z]{1,2}\d{7}$/,   hint: '1-2 huruf + 7 digit' },
  Vietnam:   { pattern: /^[A-Z]\d{7}$/,        hint: '1 huruf + 7 digit' },
  'United States': { pattern: /^\d{9}$/,       hint: '9 digit' },
  'United Kingdom': { pattern: /^\d{9}$/,      hint: '9 digit' },
  Australia: { pattern: /^[A-Z]\d{7}$/,        hint: '1 huruf + 7 digit' },
  Japan:     { pattern: /^[A-Z]{2}\d{7}$/,     hint: '2 huruf + 7 digit' },
  // Fallback generic — 6–12 alfanumerik.
}

const GENERIC_PASSPORT = /^[A-Z0-9]{6,12}$/
const GENERIC_HINT = '6–12 huruf besar / angka'

/** Normalisasi passport input — upper-case + strip whitespace & dash. */
export function normalizePassport(v: string): string {
  return v.replace(/[\s-]/g, '').toUpperCase()
}

/** Validate 1 passport number against nationality. Return null kalau valid. */
export function validatePassportFormat(
  passport: string,
  nationality?: string | null,
): { code: 'passport_format'; hint: string } | null {
  const normalized = normalizePassport(passport)
  const nat = (nationality ?? '').trim()
  const spec = nat && PASSPORT_FORMATS[nat] ? PASSPORT_FORMATS[nat] : null
  const pattern = spec?.pattern ?? GENERIC_PASSPORT
  const hint = spec?.hint ?? GENERIC_HINT
  if (!pattern.test(normalized)) return { code: 'passport_format', hint }
  return null
}

/**
 * Hitung umur (dalam tahun penuh) seseorang pada tanggal reference.
 * Return null kalau DOB tidak valid.
 */
export function ageAt(dobIso: string, referenceIso: string): number | null {
  const dob = new Date(dobIso)
  const ref = new Date(referenceIso)
  if (isNaN(dob.getTime()) || isNaN(ref.getTime())) return null
  let age = ref.getFullYear() - dob.getFullYear()
  const m = ref.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) age -= 1
  return age
}

/**
 * Validate 1 passenger — return array of issues (empty = clean).
 * Caller lempar departureDate untuk hitung umur-at-departure.
 */
export function validatePassenger(
  p: PassengerForValidation,
  index: number,
  departureDate: string,
  todayIso: string = new Date().toISOString().slice(0, 10),
): PassengerIssue[] {
  const issues: PassengerIssue[] = []

  // 1. Passport format (kalau diisi).
  if (p.passportNumber) {
    const fmt = validatePassportFormat(p.passportNumber, p.nationality)
    if (fmt) {
      issues.push({
        index,
        field: 'passportNumber',
        code: fmt.code,
        message: `Format passport tidak sesuai (${fmt.hint}).`,
      })
    }
  }

  // 2. DOB sanity vs passenger type.
  if (p.dateOfBirth) {
    const age = ageAt(p.dateOfBirth, departureDate)
    if (age === null || age < 0) {
      issues.push({
        index,
        field: 'dateOfBirth',
        code: 'dob_invalid',
        message: 'Tanggal lahir tidak valid.',
      })
    } else {
      if (p.passengerType === 'adult' && age < ADULT_MIN_YEARS) {
        issues.push({
          index,
          field: 'dateOfBirth',
          code: 'dob_adult_too_young',
          message: `Penumpang Adult harus berumur ≥ ${ADULT_MIN_YEARS} tahun saat departure (ini ${age} tahun).`,
        })
      }
      if (p.passengerType === 'child' && (age < CHILD_MIN_YEARS || age > CHILD_MAX_YEARS)) {
        issues.push({
          index,
          field: 'dateOfBirth',
          code: 'dob_child_out_of_range',
          message: `Penumpang Child harus berumur ${CHILD_MIN_YEARS}–${CHILD_MAX_YEARS} tahun saat departure (ini ${age} tahun).`,
        })
      }
    }
  }

  // 3. Issue date <= today AND >= DOB.
  if (p.passportIssueDate) {
    const issueT = new Date(p.passportIssueDate).getTime()
    const todayT = new Date(todayIso).getTime()
    if (isNaN(issueT)) {
      issues.push({
        index,
        field: 'passportIssueDate',
        code: 'issue_invalid',
        message: 'Tanggal terbit passport tidak valid.',
      })
    } else {
      if (issueT > todayT) {
        issues.push({
          index,
          field: 'passportIssueDate',
          code: 'issue_future',
          message: 'Tanggal terbit passport tidak boleh di masa depan.',
        })
      }
      if (p.dateOfBirth) {
        const dobT = new Date(p.dateOfBirth).getTime()
        if (!isNaN(dobT) && issueT < dobT) {
          issues.push({
            index,
            field: 'passportIssueDate',
            code: 'issue_before_dob',
            message: 'Tanggal terbit passport tidak boleh sebelum tanggal lahir.',
          })
        }
      }
    }
  }

  // 4. Expiry > Issue.
  if (p.passportIssueDate && p.passportExpiryDate) {
    const i = new Date(p.passportIssueDate).getTime()
    const e = new Date(p.passportExpiryDate).getTime()
    if (!isNaN(i) && !isNaN(e) && e <= i) {
      issues.push({
        index,
        field: 'passportExpiryDate',
        code: 'expiry_before_issue',
        message: 'Masa berlaku passport harus setelah tanggal terbit.',
      })
    }
  }

  return issues
}

/**
 * Scan semua passenger dan tangkap duplicate passport number.
 * Dipakai setelah per-passenger validation.
 */
export function detectDuplicatePassports(passengers: PassengerForValidation[]): PassengerIssue[] {
  const seen = new Map<string, number[]>()
  for (let i = 0; i < passengers.length; i++) {
    const num = passengers[i].passportNumber
    if (!num) continue
    const normalized = normalizePassport(num)
    const arr = seen.get(normalized) ?? []
    arr.push(i)
    seen.set(normalized, arr)
  }
  const issues: PassengerIssue[] = []
  for (const [, indices] of seen) {
    if (indices.length < 2) continue
    for (const i of indices) {
      issues.push({
        index: i,
        field: 'passportNumber',
        code: 'passport_duplicate',
        message: `Nomor passport sama dengan Penumpang ${indices.filter((x) => x !== i).map((x) => x + 1).join(', ')}.`,
      })
    }
  }
  return issues
}
