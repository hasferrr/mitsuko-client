import AnnouncementHeadline from "@/components/landing/announcement-headline"
import HeroSection from "@/components/landing/hero-section"

export default function OgPage() {
  return (
    <div className="grid h-screen w-full place-items-center relative">
      <div className="absolute top-0 w-full">
        <AnnouncementHeadline />
      </div>
      <div className="w-full">
        <HeroSection />
      </div>
    </div>
  )
}
