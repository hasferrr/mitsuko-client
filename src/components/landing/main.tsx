import Navbar from "./navbar"
import KeyFeatures from "./key-features"
import DemoSection from "./demo-section"
import ComparisonSection from "./comparison-section"
import PricingSection from "./pricing-section"
import FAQSection from "./faq-section"
import Footer from "./footer"
import HeroSection from "./hero-section"

export default function MainLandingPage() {
  return (
    <div className="min-h-screen text-gray-900 dark:text-white flex flex-col">
      <Navbar />
      <HeroSection />
      <KeyFeatures />
      <DemoSection />
      <ComparisonSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  )
}
