import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ScrollProgress } from '@/components/Shared'
import { BackToTop } from '@/components/BackToTop'
import { AdBannerHero, AdBannerMiddle, AdBannerFooter, AdBannerSidebar } from '@/components/AdBanner'
import { HomePage } from '@/pages/HomePage'
import { EventosPage } from '@/pages/EventosPage'
import { MarketplacePage } from '@/pages/MarketplacePage'
import { CuradoriaPage } from '@/pages/CuradoriaPage'
// EspacosPage removida — manter apenas AdBanner (mostruário)

export function App() {
  const lenisRef = useRef<Lenis | null>(null)
  const cursorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.2,
    })
    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => { lenis.destroy() }
  }, [])

  /* ─── Cursor glow ─── */
  useEffect(() => {
    const el = cursorRef.current
    if (!el) return

    let rafId: number
    let mouseX = -999
    let mouseY = -999

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const tick = () => {
      el.style.left = mouseX + 'px'
      el.style.top = mouseY + 'px'
      rafId = requestAnimationFrame(tick)
    }
    tick()

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const scrollTo = (id: string) => {
    if (!lenisRef.current) return
    if (id === 'hero') {
      lenisRef.current.scrollTo(0, { duration: 1.8 })
      return
    }
    const el = document.getElementById(id)
    if (el) {
      lenisRef.current.scrollTo(el, { duration: 1.8, offset: -60 })
    }
  }

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="grain" />
      <div className="vignette" />
      <div ref={cursorRef} className="cursor-glow hidden md:block" />
      <ScrollProgress />
      <Header onScrollTo={scrollTo} />
      <BackToTop />
      <main>
        <HomePage onScrollTo={scrollTo} />
        <div className="section-divider max-w-xs" />
        <AdBannerHero />
        <div className="section-divider max-w-xs" />
        <EventosPage />
        <div className="section-divider max-w-xs" />
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex gap-6 items-start">
            <div className="flex-1 min-w-0">
              <MarketplacePage />
            </div>
          </div>
        </div>
        <div className="section-divider max-w-xs" />
        <AdBannerMiddle index={0} />
        <CuradoriaPage />
        <div className="section-divider max-w-xs" />
        <AdBannerMiddle index={1} />
        <div className="section-divider max-w-xs" />
      </main>
      <Footer onScrollTo={scrollTo} />
    </div>
  )
}
