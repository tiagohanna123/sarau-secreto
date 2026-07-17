import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { HomePage } from '@/pages/HomePage'
import { EventosPage } from '@/pages/EventosPage'
import { MarketplacePage } from '@/pages/MarketplacePage'
import { CuradoriaPage } from '@/pages/CuradoriaPage'
import { EspacosPage } from '@/pages/EspacosPage'

export function App() {

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <HomePage />
        <EventosPage />
        <MarketplacePage />
        <CuradoriaPage />
        <EspacosPage />
      </main>
      <Footer />
    </div>
  )
}
