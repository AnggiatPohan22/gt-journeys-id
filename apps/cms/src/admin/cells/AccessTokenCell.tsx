'use client'
/**
 * Step 3.1 — AccessToken list cell.
 *
 * Default: masked (12 dots + last 4 chars, monospace). Click row cell →
 * reveal full token. Copy button → write FULL token to clipboard
 * (regardless of masked/revealed state). Reveal state is per-row,
 * local, non-persistent — reload re-masks everything.
 *
 * No telemetry on reveal (admin trusted; audit covers DB mutations only).
 * Falls back to masked rendering when JS is disabled (SSR renders mask).
 */
import React, { useCallback, useState } from 'react'

type Props = { cellData?: unknown }

const MASK_PREFIX = '••••••••••••'

const AccessTokenCell: React.FC<Props> = ({ cellData }) => {
  const token = typeof cellData === 'string' ? cellData : ''
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)

  const toggleReveal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setRevealed((v) => !v)
  }, [])

  const copy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      if (!token) return
      try {
        await navigator.clipboard.writeText(token)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      } catch {
        // Older browsers / insecure contexts — silently ignore.
      }
    },
    [token],
  )

  if (!token) return <span className="dnj-token-cell dnj-token-cell--empty">—</span>

  const masked = `${MASK_PREFIX}${token.slice(-4)}`
  const display = revealed ? token : masked

  return (
    <span className="dnj-token-cell">
      <button
        type="button"
        className="dnj-token-cell__value"
        onClick={toggleReveal}
        title={revealed ? 'Click to hide' : 'Click to reveal'}
        aria-label={revealed ? 'Hide access token' : 'Reveal access token'}
      >
        {display}
      </button>
      <button
        type="button"
        className="dnj-token-cell__copy"
        onClick={copy}
        title={copied ? 'Copied' : 'Copy full token'}
        aria-label="Copy access token to clipboard"
      >
        {copied ? '✓' : '⧉'}
      </button>
    </span>
  )
}

export default AccessTokenCell
