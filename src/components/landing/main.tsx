import KeyFeatures from "./key-features"
import ComparisonSection from "./comparison-section"
import PricingSection from "../pricing/pricing-section"
import FAQSection from "./faq-section"
import HeroSection from "./hero-section"
import CtaSection from "./cta-section"

export default function MainLandingPage() {
  return (
    <>
      <HeroSection />
      <KeyFeatures />
      <ComparisonSection />
      <PricingSection redirectToPricingPage showLink />
      <FAQSection />
      <CtaSection />
    </>
  )
}
