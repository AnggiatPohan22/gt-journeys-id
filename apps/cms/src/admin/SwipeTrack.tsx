'use client'
import React, { useEffect, useRef } from 'react'

/**
 * SwipeTrack — wrapper client kecil untuk stat boxes yang bisa di-geser
 * horizontal. Vanilla, tanpa library:
 *  - Touch (tablet): native horizontal scroll + CSS scroll-snap.
 *  - Mouse (desktop): wheel vertikal → scroll horizontal, plus drag-to-scroll.
 * Hanya aktif kalau konten memang overflow (di layar lebar tidak mengganggu).
 */
const SwipeTrack: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY
        e.preventDefault()
      }
    }

    let down = false
    let startX = 0
    let startLeft = 0
    const onDown = (e: MouseEvent) => {
      if (el.scrollWidth <= el.clientWidth) return
      down = true
      startX = e.pageX
      startLeft = el.scrollLeft
      el.classList.add('dnj-track--dragging')
    }
    const onMove = (e: MouseEvent) => {
      if (!down) return
      el.scrollLeft = startLeft - (e.pageX - startX)
    }
    const onUp = () => {
      down = false
      el.classList.remove('dnj-track--dragging')
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export default SwipeTrack
