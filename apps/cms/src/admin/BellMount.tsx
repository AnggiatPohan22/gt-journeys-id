'use client'

/**
 * BellMount — Phase 4.74.7.
 *
 * Provider wrapper yang me-mount `BellNotifications` sebagai floating widget
 * fixed-position top-right di SEMUA route admin. Mengganti pola 4.74.5 yang
 * nempel di sidebar (`afterNavLinks`) — pindah ke top-bar supaya tidak
 * terkubur di dalam menu & tetap terlihat saat sidebar collapsed.
 *
 * Mount: `admin.components.providers` di payload.config.ts.
 */

import React from 'react'
import BellNotifications from './BellNotifications'

export default function BellMount({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BellNotifications />
    </>
  )
}
