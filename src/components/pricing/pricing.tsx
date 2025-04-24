import PricingDescription from "./pricing-description"
import PricingSection from "./pricing-section"
import ContactUsSection from "../landing/contact-us-section"

export default function Pricing() {
  return (
    <>
      <PricingSection showLink={false} showDescription useH1Title />
      <PricingDescription />
      <ContactUsSection />
    </>
  )
}
