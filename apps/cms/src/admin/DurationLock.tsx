'use client'
/**
 * DurationLock — Phase 4.61.6 refinement.
 * Mounted as a `ui` sibling next to `durationOverride`. Reads the
 * checkbox via useField and disables the sibling `duration` <input>
 * whenever override is off (auto-computed mode).
 *
 * We disable at the DOM level rather than via `admin.readOnly` because
 * Payload 3 only supports a static boolean there — no dynamic access
 * to siblingData. Renders null; no visible UI.
 */
import { useEffect } from 'react'
import { useField } from '@payloadcms/ui'

export default function DurationLock() {
  const { value: override } = useField<boolean>({ path: 'durationOverride' })
  useEffect(() => {
    // Find the duration input inside the current form. name="duration"
    // is stable — Payload keeps HTML name = field path for text inputs.
    const inp = document.querySelector('input[name="duration"]') as HTMLInputElement | null
    if (!inp) return
    const on = override === true
    inp.disabled = !on
    inp.style.opacity = on ? '' : '0.55'
    inp.style.cursor = on ? '' : 'not-allowed'
    inp.title = on ? '' : 'Auto-computed on save from departure/arrival times. Toggle Override to edit manually.'
  }, [override])
  return null
}
