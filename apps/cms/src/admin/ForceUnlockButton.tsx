'use client'
/**
 * GtJourneysID — "Force unlock" button (Phase 4.14 · Track B).
 *
 * Rendered as a `ui`-type field on the user Security tab. Clicking
 * POSTs Payload's built-in `/api/users/unlock` endpoint with the
 * user's email — clears `lockUntil` + `loginAttempts` server-side.
 * Super-admin-only via the field's own admin.condition + access.
 *
 * Reads the email from Payload's form context (useAllFormFields) so
 * the button works even before the doc is saved.
 */
import React, { useState } from 'react'
import { useAllFormFields } from '@payloadcms/ui'

const ForceUnlockButton: React.FC = () => {
  const [state, setState] = useState<'idle' | 'working' | 'ok' | 'err'>('idle')
  const [msg, setMsg] = useState<string>('')
  const [fields] = useAllFormFields()
  const email =
    (typeof fields?.email?.value === 'string' && fields.email.value) || ''

  const run = async () => {
    if (!email) {
      setState('err')
      setMsg('No email on this user yet — save the doc first.')
      return
    }
    setState('working')
    setMsg('')
    try {
      const res = await fetch('/api/users/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const t = await res.text().catch(() => '')
        throw new Error(t || `HTTP ${res.status}`)
      }
      setState('ok')
      setMsg('User unlocked. loginAttempts + lockUntil cleared.')
      window.setTimeout(() => setState('idle'), 4000)
    } catch (e: any) {
      setState('err')
      setMsg(e?.message || 'Unlock failed.')
    }
  }

  return (
    <div className="dnj-unlock">
      <button
        type="button"
        className={`dnj-unlock__btn dnj-unlock__btn--${state}`}
        onClick={run}
        disabled={state === 'working'}
      >
        <span aria-hidden="true">🔓</span>{' '}
        {state === 'working' ? 'Unlocking…' : 'Force unlock account'}
      </button>
      {msg && (
        <p
          className={`dnj-unlock__msg dnj-unlock__msg--${state}`}
          role={state === 'err' ? 'alert' : 'status'}
        >
          {msg}
        </p>
      )}
      <p className="dnj-unlock__caption">
        Use when a user is locked out after too many failed logins. Only clears the lock — does NOT change their password.
      </p>
    </div>
  )
}

export default ForceUnlockButton
