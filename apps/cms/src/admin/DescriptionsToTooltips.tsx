'use client'
/**
 * DescriptionsToTooltips — Phase 4.61.6 refinement (v2).
 *
 * Mounted as a `ui` field on Ferry Tickets edit view. Hides
 * .field-description text and injects a "?" icon next to each
 * .field-label. Hover / focus shows a tooltip.
 *
 * v2: tooltip is portaled to <body> and positioned with fixed
 * coordinates via getBoundingClientRect + auto-flip when near
 * viewport edges → escapes overflow:hidden clipping from
 * collapsible sections / rows.
 */
import { useEffect } from 'react'

const ICON_CLASS = 'dnj-tt-icon'
const DONE_ATTR = 'data-dnj-tt-done'
const TIP_ID = 'dnj-tt-tip'
const TIP_ARROW_ID = 'dnj-tt-arrow'

const ensureTipEl = (): HTMLDivElement => {
  let tip = document.getElementById(TIP_ID) as HTMLDivElement | null
  if (tip) return tip
  tip = document.createElement('div')
  tip.id = TIP_ID
  tip.setAttribute('role', 'tooltip')
  tip.style.cssText = [
    'position:fixed',
    'z-index:2147483647',
    'max-width:min(340px, calc(100vw - 24px))',
    'padding:8px 10px',
    'border-radius:6px',
    'background:var(--theme-elevation-900, #1a1a1a)',
    'color:var(--theme-elevation-0, #fff)',
    'font-size:12px',
    'font-weight:400',
    'line-height:1.45',
    'text-align:left',
    'white-space:normal',
    'box-shadow:0 6px 20px rgba(0,0,0,0.28)',
    'opacity:0',
    'pointer-events:none',
    'transition:opacity .12s ease',
    'top:0',
    'left:0',
  ].join(';')
  const arrow = document.createElement('div')
  arrow.id = TIP_ARROW_ID
  arrow.style.cssText = ['position:absolute', 'width:0', 'height:0'].join(';')
  tip.appendChild(arrow)
  document.body.appendChild(tip)
  return tip
}

const positionTip = (iconEl: HTMLElement) => {
  const tip = ensureTipEl()
  const arrow = document.getElementById(TIP_ARROW_ID) as HTMLDivElement | null
  const text = iconEl.getAttribute('data-tt') ?? ''
  Array.from(tip.childNodes).forEach((n) => {
    if ((n as HTMLElement).id !== TIP_ARROW_ID) tip.removeChild(n)
  })
  tip.insertBefore(document.createTextNode(text), tip.firstChild)

  const rect = iconEl.getBoundingClientRect()
  const vw = document.documentElement.clientWidth
  const vh = document.documentElement.clientHeight
  const margin = 8
  const gap = 8

  // Reset previous max-width, then measure natural size.
  tip.style.visibility = 'hidden'
  tip.style.opacity = '1'
  tip.style.maxWidth = `min(340px, calc(100vw - ${margin * 2}px))`
  let tw = tip.offsetWidth
  let th = tip.offsetHeight

  // Positioning strategy (priority):
  //   1. RIGHT of icon (tooltip along the same line as the label — does
  //      not cover the field content or the sections below).
  //   2. LEFT of icon.
  //   3. BELOW icon (fallback when horizontal doesn't fit).
  //   4. ABOVE icon (last resort).
  const spaceRight = vw - rect.right - margin - gap
  const spaceLeft = rect.left - margin - gap
  const spaceBelow = vh - rect.bottom - margin - gap
  const spaceAbove = rect.top - margin - gap

  type Side = 'right' | 'left' | 'below' | 'above'
  let side: Side
  const minHoriz = 140 // minimum readable width for horizontal placement
  if (spaceRight >= Math.min(tw, minHoriz)) side = 'right'
  else if (spaceLeft >= Math.min(tw, minHoriz)) side = 'left'
  else if (spaceBelow >= spaceAbove) side = 'below'
  else side = 'above'

  // Constrain width to available space for the chosen side (keeps content
  // readable while preventing tooltip from spilling off-screen).
  if (side === 'right') tip.style.maxWidth = `${Math.min(340, spaceRight)}px`
  else if (side === 'left') tip.style.maxWidth = `${Math.min(340, spaceLeft)}px`
  else tip.style.maxWidth = `min(340px, calc(100vw - ${margin * 2}px))`
  tw = tip.offsetWidth
  th = tip.offsetHeight

  let left = 0
  let top = 0
  if (side === 'right') {
    left = rect.right + gap
    top = rect.top + rect.height / 2 - th / 2
  } else if (side === 'left') {
    left = rect.left - gap - tw
    top = rect.top + rect.height / 2 - th / 2
  } else if (side === 'below') {
    top = rect.bottom + gap
    left = rect.left + rect.width / 2 - tw / 2
  } else {
    top = rect.top - th - gap
    left = rect.left + rect.width / 2 - tw / 2
  }
  // Clamp to viewport.
  left = Math.max(margin, Math.min(left, vw - tw - margin))
  top = Math.max(margin, Math.min(top, vh - th - margin))

  tip.style.left = `${Math.round(left)}px`
  tip.style.top = `${Math.round(top)}px`

  // Reset arrow borders each render (any leftover from previous side).
  if (arrow) {
    arrow.style.borderLeft = '6px solid transparent'
    arrow.style.borderRight = '6px solid transparent'
    arrow.style.borderTop = ''
    arrow.style.borderBottom = ''
    arrow.style.top = ''
    arrow.style.bottom = ''
    arrow.style.left = ''
    arrow.style.right = ''
    const iconCenterX = rect.left + rect.width / 2
    const iconCenterY = rect.top + rect.height / 2
    if (side === 'right') {
      arrow.style.borderLeft = ''
      arrow.style.borderRight = '6px solid var(--theme-elevation-900, #1a1a1a)'
      arrow.style.borderTop = '6px solid transparent'
      arrow.style.borderBottom = '6px solid transparent'
      arrow.style.left = '-6px'
      arrow.style.top = `${Math.max(6, Math.min(th - 18, iconCenterY - top - 6))}px`
    } else if (side === 'left') {
      arrow.style.borderRight = ''
      arrow.style.borderLeft = '6px solid var(--theme-elevation-900, #1a1a1a)'
      arrow.style.borderTop = '6px solid transparent'
      arrow.style.borderBottom = '6px solid transparent'
      arrow.style.right = '-6px'
      arrow.style.top = `${Math.max(6, Math.min(th - 18, iconCenterY - top - 6))}px`
    } else if (side === 'below') {
      arrow.style.top = '-6px'
      arrow.style.borderBottom = '6px solid var(--theme-elevation-900, #1a1a1a)'
      arrow.style.left = `${Math.max(6, Math.min(tw - 18, iconCenterX - left - 6))}px`
    } else {
      arrow.style.bottom = '-6px'
      arrow.style.borderTop = '6px solid var(--theme-elevation-900, #1a1a1a)'
      arrow.style.left = `${Math.max(6, Math.min(tw - 18, iconCenterX - left - 6))}px`
    }
  }

  tip.style.visibility = 'visible'
}

const showTip = (iconEl: HTMLElement) => {
  positionTip(iconEl)
}
const hideTip = () => {
  const tip = document.getElementById(TIP_ID) as HTMLDivElement | null
  if (!tip) return
  tip.style.opacity = '0'
  tip.style.visibility = 'hidden'
}

export default function DescriptionsToTooltips() {
  useEffect(() => {
    const attach = (icon: HTMLElement) => {
      icon.addEventListener('mouseenter', () => showTip(icon))
      icon.addEventListener('mouseleave', hideTip)
      icon.addEventListener('focus', () => showTip(icon))
      icon.addEventListener('blur', hideTip)
      // Prevent clicks on the ? from bubbling to the collapsible toggle
      // (which would collapse the section).
      icon.addEventListener('click', (e) => {
        e.stopPropagation()
        e.preventDefault()
      })
    }

    const run = () => {
      const descs = document.querySelectorAll('.field-description:not([' + DONE_ATTR + '])') as NodeListOf<HTMLElement>
      descs.forEach((el) => {
        const text = el.textContent?.trim()
        if (!text) return
        el.setAttribute(DONE_ATTR, '1')
        el.style.display = 'none'

        const container = el.closest('.field-type, .collapsible-field, .collapsible-field-wrap, .render-fields') || el.parentElement
        if (!container) return

        // Collapsible section header: the VISIBLE title lives inside
        // `.collapsible__header-wrap` (NOT `.collapsible__toggle`, which is
        // an invisible full-cover toggle button). Prefer that so the ?
        // icon sits inline after the section title text.
        const collapsibleHeader = container.querySelector<HTMLElement>('.collapsible__header-wrap')
        const label = (
          collapsibleHeader ||
          container.querySelector<HTMLElement>('.field-label') ||
          container.querySelector<HTMLElement>('label')
        ) as HTMLElement | null
        if (!label || label.querySelector('.' + ICON_CLASS)) return

        const icon = document.createElement('span')
        icon.className = ICON_CLASS
        icon.setAttribute('role', 'button')
        icon.setAttribute('tabindex', '0')
        icon.setAttribute('aria-label', text)
        icon.setAttribute('data-tt', text)
        icon.textContent = '?'
        // On collapsible headers we mark the icon so CSS can raise its
        // z-index above the invisible full-cover `.collapsible__toggle`
        // button (which would otherwise capture pointer events).
        if (collapsibleHeader) icon.classList.add(ICON_CLASS + '--in-header')
        label.appendChild(icon)
        attach(icon)
      })
    }

    run()
    const obs = new MutationObserver(() => run())
    obs.observe(document.body, { childList: true, subtree: true })

    // Hide tooltip on scroll / resize (repositioning while hovered is more
    // work than it's worth; a brief hide is fine).
    const onScroll = () => hideTip()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)

    return () => {
      obs.disconnect()
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
      const tip = document.getElementById(TIP_ID)
      if (tip && tip.parentNode) tip.parentNode.removeChild(tip)
    }
  }, [])
  return null
}
