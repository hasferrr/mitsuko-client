import CtaSection from "../landing/cta-section"
import PricingDescription from "./pricing-description"
import PricingSection from "./pricing-section"

export default function Pricing() {
  return (
    <>
      <PricingSection
        showLink={false}
        showDescription
        useH1Title
      />
      <PricingDescription />
      <CtaSection />
    </>
  )
}
