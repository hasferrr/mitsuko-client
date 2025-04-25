import PricingDescription from "./pricing-description"
import PricingSection from "./pricing-section"
import CreditValueShowcase from "./credit-value-showcase"
import AnnouncementHeadline from "../landing/announcement-headline"

export default function Pricing() {
  return (
    <>
      <AnnouncementHeadline />
      <PricingSection showLink={false} showDescription useH1Title />
      <PricingDescription />
      <section className="pt-12 pb-24 px-4">
        <CreditValueShowcase showGetCreditsButton />
      </section>
    </>
  )
}
