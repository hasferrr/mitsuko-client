import KeyFeatures from "./key-features"
import ComparisonSection from "./comparison-section"
import PricingSection from "../pricing/pricing-section"
import FAQSection from "./faq-section"
import HeroSection from "./hero-section"
import CreditValueShowcase from "../pricing/credit-value-showcase"

export default function MainLandingPage() {
  return (
    <>
      <HeroSection />
      <KeyFeatures />
      <ComparisonSection />
      <PricingSection redirectToPricingPage showLink />
      <FAQSection />
      <section className="pt-12 pb-24 px-4">
        <CreditValueShowcase />
      </section>
    </>
  )
}
