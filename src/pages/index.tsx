import { motion } from "framer-motion"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/landing/Footer"
import { useEffect } from "react"

export default function LandingPage() {
  useEffect(() => {
    // Ensure smooth landing page load
    window.scrollTo(0, 0)
  }, [])

  return (
    <motion.div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </motion.div>
  )
}
