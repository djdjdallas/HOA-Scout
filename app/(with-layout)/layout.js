/**
 * Layout for pages that need Header and Footer
 */

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function WithLayoutGroup({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
