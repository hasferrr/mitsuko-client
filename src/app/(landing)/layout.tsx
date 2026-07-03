import { PropsWithChildren } from "react"
import Footer from "@/components/landing/footer"
import Navbar from "@/components/landing/navbar"

export default function HomeLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <Navbar />
      <main role="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
