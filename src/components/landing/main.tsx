import KeyFeatures from "./key-features"
import DemoSection from "./demo-section"
import ComparisonSection from "./comparison-section"
import PricingSection from "../pricing/pricing-section"
import FAQSection from "./faq-section"
import ContactUsSection from "./contact-us-section"
import HeroSection from "./hero-section"

export default function MainLandingPage() {
  return (
    <>
      <HeroSection />
      <KeyFeatures />
      <DemoSection />
      <ComparisonSection />
      <PricingSection redirectToPricingPage />
      <FAQSection />
      <ContactUsSection />
    </>
  )
}
