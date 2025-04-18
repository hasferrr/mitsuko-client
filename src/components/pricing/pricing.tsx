import PricingDescription from "./pricing-description"
import PricingSection from "../landing/pricing-section"

export default function Pricing() {
  return (
    <>
      <PricingSection showLink={false} />
      <PricingDescription />
    </>
  )
}
