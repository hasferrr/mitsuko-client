import PricingDescription from "./pricing-description"
import PricingSection from "../landing/pricing-section"
import ContactUsSection from "../landing/contact-us-section"

export default function Pricing() {
  return (
    <>
      <PricingSection showLink={false} showDescription={true} />
      <PricingDescription />
      <ContactUsSection />
    </>
  )
}
