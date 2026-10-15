'use client'
import React, { useEffect } from 'react'

/**
 * Phase 4.18 — Accordion behavior for section-level collapsibles.
 *
 * When a `.accordion-section` collapsible opens, all OTHER `.accordion-section`
 * collapsibles within the SAME tab panel are auto-closed. Nested collapsibles
 * (array items, sub-groups) are NOT affected — they lack the marker class.
 *
 * Also handles tab-switch reset: when the active tab changes, the first
 * accordion section in the new tab opens and the rest close.
 */
const AccordionSections: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const root = document.querySelector('.dnj-main-tabs')
    if (!root) return

    const closeOthers = (openedSection: Element) => {
      const tabPanel = openedSection.closest('.tabs-field__tab')
      if (!tabPanel) return
      const siblings = tabPanel.querySelectorAll(':scope > .accordion-section')
      siblings.forEach((s) => {
        if (s === openedSection) return
        if (!s.classList.contains('collapsible--collapsed')) {
          const toggle = s.querySelector(':scope > .collapsible__toggle-wrap') as HTMLElement
          toggle?.click()
        }
      })
    }

    const resetTab = (tabPanel: Element) => {
      const sections = tabPanel.querySelectorAll(':scope > .accordion-section')
      sections.forEach((s, i) => {
        const isCollapsed = s.classList.contains('collapsible--collapsed')
        if (i === 0 && isCollapsed) {
          const toggle = s.querySelector(':scope > .collapsible__toggle-wrap') as HTMLElement
          toggle?.click()
        } else if (i > 0 && !isCollapsed) {
          const toggle = s.querySelector(':scope > .collapsible__toggle-wrap') as HTMLElement
          toggle?.click()
        }
      })
    }

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== 'attributes' || m.attributeName !== 'class') continue
        const el = m.target as Element
        if (!el.classList.contains('accordion-section')) continue
        if (!el.classList.contains('collapsible--collapsed')) {
          closeOthers(el)
        }
      }
    })

    observer.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    })

    const tabObserver = new MutationObserver(() => {
      const activeTab = root.querySelector('.tabs-field__tab--active')
      if (activeTab) resetTab(activeTab)
    })

    const tabsWrap = root.querySelector('.tabs-field__tabs')
    if (tabsWrap) {
      tabObserver.observe(tabsWrap, { subtree: true, attributes: true, attributeFilter: ['class'] })
    }

    return () => {
      observer.disconnect()
      tabObserver.disconnect()
    }
  }, [])

  return <>{children}</>
}

export default AccordionSections
