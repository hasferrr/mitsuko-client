import KeyFeatures from "./key-features"
import DemoSection from "./demo-section"
import ComparisonSection from "./comparison-section"
import PricingSection from "../pricing/pricing-section"
import FAQSection from "./faq-section"
import HeroSection from "./hero-section"
import CreditValueShowcase from "../pricing/credit-value-showcase"
import AnnouncementHeadline from "./announcement-headline"

export default function MainLandingPage() {
  return (
    <>
      <AnnouncementHeadline />
      <HeroSection />
      <KeyFeatures />
      <DemoSection />
      <ComparisonSection />
      <PricingSection redirectToPricingPage />
      <FAQSection />
      <section className="pt-12 pb-24 px-4">
        <CreditValueShowcase />
      </section>
    </>
  )
}
