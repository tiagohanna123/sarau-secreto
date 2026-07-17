import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ScrollProgress } from '@/components/ScrollProgress'
import { HomePage } from '@/pages/HomePage'
import { EventosPage } from '@/pages/EventosPage'
import { MarketplacePage } from '@/pages/MarketplacePage'
import { CuradoriaPage } from '@/pages/CuradoriaPage'
import { EspacosPage } from '@/pages/EspacosPage'

export function App() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="grain-overlay" />
      <div className="vignette" />
      <ScrollProgress />
      <Header onScrollTo={scrollTo} />
      <main>
        <HomePage onScrollTo={scrollTo} />
        <EventosPage />
        <MarketplacePage />
        <CuradoriaPage />
        <EspacosPage />
      </main>
      <Footer />
    </div>
  )
}
