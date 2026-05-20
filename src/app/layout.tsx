import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import AuthModal from '@/components/auth/AuthModal'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Journey — A Cinematic Travel Journal',
  description: 'Collect moments, not things. A personal travel photography journal.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#0B0B0B] text-white">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <MobileNav />
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  )
}
