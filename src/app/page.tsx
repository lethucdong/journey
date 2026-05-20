import Hero from '@/components/landing/Hero'
import FeaturedGrid from '@/components/landing/FeaturedGrid'
import Stats from '@/components/landing/Stats'
import { Globe, Share2, ExternalLink } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="pb-20 md:pb-0">
      <Hero />
      <Stats />
      <FeaturedGrid />

      {/* Quote section */}
      <section className="py-24 px-6 text-center max-w-3xl mx-auto">
        <p className="font-display text-2xl md:text-3xl font-medium text-gray-200 leading-relaxed italic">
          &ldquo;The world is a book, and those who do not travel
          read only one page.&rdquo;
        </p>
        <p className="mt-4 text-gray-500 text-sm">— Saint Augustine</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 Journey. A personal travel archive.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors">
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
