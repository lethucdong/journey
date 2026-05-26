import Hero from '@/components/landing/Hero'
import Ticker from '@/components/landing/Ticker'
import HowItWorks from '@/components/landing/HowItWorks'
import Stats from '@/components/landing/Stats'
import FeaturesBento from '@/components/landing/FeaturesBento'
import FeaturedGrid from '@/components/landing/FeaturedGrid'
import LandingCTA from '@/components/landing/LandingCTA'
import { Compass } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="pb-20 md:pb-0">
      <Hero />
      <Ticker />
      <HowItWorks />
      <Stats />
      <FeaturesBento />
      <FeaturedGrid />
      <LandingCTA />

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <span className="font-display font-bold text-white">Journey</span>
            <span className="text-gray-600 text-sm ml-2">· A personal travel archive</span>
          </div>
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Journey. Built with love for those who wander.
          </p>
        </div>
      </footer>
    </div>
  )
}
