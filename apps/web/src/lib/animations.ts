import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function initAnimations() {
  // Respect reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  gsap.registerPlugin(ScrollTrigger)

  // Phase 4.56 — hormati per-section duration (CSS var `--entry-duration`
  // di element, dalam ms). Fallback 800ms kalau tak diset.
  const readDurationMs = (el: HTMLElement, fallback: number): number => {
    const raw = getComputedStyle(el).getPropertyValue('--entry-duration').trim()
    if (!raw) return fallback
    const n = parseFloat(raw)
    if (!isFinite(n) || n <= 0) return fallback
    return raw.endsWith('ms') ? n : n * 1000
  }

  // Scroll reveal for [data-animate="reveal"] elements (jalur GSAP)
  gsap.utils.toArray('[data-animate="reveal"]').forEach((el: any) => {
    const dur = readDurationMs(el as HTMLElement, 800) / 1000
    gsap.from(el, {
      y: 40, opacity: 0, duration: dur, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })
  })

  // Stagger children for [data-animate="stagger"] containers
  gsap.utils.toArray('[data-animate="stagger"]').forEach((parent: any) => {
    gsap.from(parent.children, {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: parent, start: 'top 80%', once: true },
    })
  })

  // Parallax for [data-animate="parallax"] elements
  gsap.utils.toArray('[data-animate="parallax"]').forEach((el: any) => {
    gsap.to(el, {
      yPercent: -15, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
    })
  })

  // Phase 4.56 — Block-level entry animations (preset non-reveal).
  // CSS `.entry-fade/-zoom/-slide-left/-slide-right` di global.css mulai
  // hidden + offset. Observer masukin `.is-in-view` saat section 15%
  // masuk viewport → transisi CSS jalan (durasi dari `--entry-duration`).
  const entrySelector = '.entry-fade, .entry-zoom, .entry-slide-left, .entry-slide-right'
  const targets = Array.from(document.querySelectorAll<HTMLElement>(entrySelector))
  if (targets.length > 0 && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view')
          observer.unobserve(entry.target)
        }
      }
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -8% 0px',
    })
    targets.forEach((el) => io.observe(el))
  }

  // Header solid on scroll
  const header = document.querySelector('[data-header]')
  if (header) {
    ScrollTrigger.create({
      trigger: 'body', start: 'top -80px',
      onEnter: () => header.classList.add('header-solid'),
      onLeaveBack: () => header.classList.remove('header-solid'),
    })
  }
}
