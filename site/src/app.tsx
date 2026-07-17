import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
<<<<<<< Updated upstream
import { ScrollProgress } from '@/components/Shared'
import { AdBannerHero, AdBannerMiddle, AdBannerFooter, AdBannerSidebar } from '@/components/AdBanner'
=======
import { ScrollProgress } from '@/components/ScrollProgress'
>>>>>>> Stashed changes
import { HomePage } from '@/pages/HomePage'
import { EventosPage } from '@/pages/EventosPage'
import { MarketplacePage } from '@/pages/MarketplacePage'
import { CuradoriaPage } from '@/pages/CuradoriaPage'

export function App() {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
<<<<<<< Updated upstream
      duration: 1.4,
=======
      duration: 1.6,
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    <div className="min-h-screen bg-black text-foreground">
      <div className="grain" />
      <div className="vignette" />
=======
    <div className="min-h-screen bg-background text-foreground">
>>>>>>> Stashed changes
      <ScrollProgress />
      <Header onScrollTo={scrollTo} />
      <main>
        <HomePage onScrollTo={scrollTo} />
<<<<<<< Updated upstream
        <AdBannerHero />
=======
>>>>>>> Stashed changes
        <EventosPage />
        <CuradoriaPage />
        <AdBannerMiddle index={0} />
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex gap-6 items-start">
            <div className="flex-1 min-w-0">
              <MarketplacePage />
            </div>
            <div className="hidden lg:block w-48 flex-shrink-0 pt-24">
              <div className="sticky top-24">
                <AdBannerSidebar />
              </div>
            </div>
          </div>
        </div>
        <AdBannerMiddle index={1} />
      </main>
      <AdBannerFooter />
      <Footer />
      <div className="cursor-dot" id="cursor-dot" />
    </div>
  )
}
