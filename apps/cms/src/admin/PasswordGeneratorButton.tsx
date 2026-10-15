'use client'
/**
 * GtJourneysID — "Generate random password" helper (Phase 4.14 · Track B).
 *
 * Rendered as a `ui`-type field inside the Security tab. Clicking the
 * button generates a 16-char password (crypto.getRandomValues), copies
 * it to clipboard, and displays it once so the super-admin can hand it
 * to the user out-of-band.
 *
 * Security notes:
 *   - Client-side only. The generated string is NOT written to the
 *     user's password field automatically — the super-admin still
 *     types/pastes it into Payload's native password input. That input
 *     is server-hashed on save (Payload's built-in behaviour); no
 *     admin surface ever stores or displays the plaintext beyond this
 *     one-shot visible-until-navigate reveal.
 *   - The button is guarded by field-level access: only super-admin
 *     sees it (see Users.ts admin.condition + access).
 *   - The reveal auto-hides after 30 s to reduce shoulder-surf risk.
 */
import React, { useEffect, useRef, useState } from 'react'

const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+-_'

const generate = (len = 16): string => {
  if (typeof window === 'undefined' || !window.crypto?.getRandomValues) {
    // Server-render / no crypto: return a placeholder; the button won't
    // be clicked at this point because the component is 'use client'.
    return ''
  }
  const buf = new Uint32Array(len)
  window.crypto.getRandomValues(buf)
  let out = ''
  for (let i = 0; i < len; i++) out += ALPHABET[buf[i] % ALPHABET.length]
  return out
}

const PasswordGeneratorButton: React.FC = () => {
  const [value, setValue] = useState<string>('')
  const [copied, setCopied] = useState<boolean>(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
  }, [])

  const run = async () => {
    const next = generate(16)
    setValue(next)
    setCopied(false)
    // Auto-copy
    try {
      await navigator.clipboard?.writeText(next)
      setCopied(true)
    } catch {
      // Clipboard blocked (permissions/insecure context) — value still
      // shows so admin can manually select+copy.
    }
    // Auto-hide after 30s
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setValue('')
      setCopied(false)
      timerRef.current = null
    }, 30_000)
  }

  return (
    <div className="dnj-pw-gen">
      <button type="button" className="dnj-pw-gen__btn" onClick={run}>
        <span aria-hidden="true">✨</span> Generate random 16-char password
      </button>
      {value ? (
        <div className="dnj-pw-gen__reveal" role="status" aria-live="polite">
          <code className="dnj-pw-gen__value">{value}</code>
          <span className="dnj-pw-gen__hint">
            {copied ? '✓ Copied' : 'Auto-copied to clipboard'} · paste into the password field above, save, then share it with the user via a private channel. Auto-hides in 30 s.
          </span>
        </div>
      ) : (
        <p className="dnj-pw-gen__caption">
          Type any password directly into the field above, or generate one here (auto-copied to clipboard). Payload hashes on save — the plain value is never stored or viewable.
        </p>
      )}
    </div>
  )
}

export default PasswordGeneratorButton
