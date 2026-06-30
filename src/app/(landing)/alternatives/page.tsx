import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "@/components/link"
import { ALTERNATIVES_LANDING_PAGES } from "@/constants/alternatives-pages"
import { DEPLOYMENT_URL } from "@/constants/external-links"

export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "Mitsuko Alternatives - AI Subtitle Translation Comparisons",
  description:
    "Compare Mitsuko with popular AI subtitle translators, transcription platforms, and video localization tools.",
  alternates: {
    canonical: `${DEPLOYMENT_URL}/alternatives`,
  },
  openGraph: {
    title: "Mitsuko Alternatives",
    description:
      "Compare Mitsuko with popular AI subtitle translators, transcription platforms, and video localization tools.",
    url: `${DEPLOYMENT_URL}/alternatives`,
    siteName: "Mitsuko",
    images: [
      {
        url: `${DEPLOYMENT_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Mitsuko subtitle translation workspace",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mitsuko Alternatives",
    description:
      "Compare Mitsuko with popular AI subtitle translators, transcription platforms, and video localization tools.",
    images: [`${DEPLOYMENT_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function AlternativesIndexPage() {
  const pages = Object.values(ALTERNATIVES_LANDING_PAGES)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 md:px-6">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
          Mitsuko alternatives for subtitle translation teams
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
          Compare Mitsuko with popular AI subtitle translators, transcription platforms, and video localization tools.
        </p>
      </div>

      <div className="mt-10 grid gap-3 md:grid-cols-2">
        {pages.map(page => (
          <article key={page.slug} className="rounded-lg p-4 ring-1 ring-foreground/10">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">{page.eyebrow}</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">{page.competitorName}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{page.intro}</p>
              </div>
              <Button asChild variant="outline" className="w-fit rounded-full">
                <Link href={`/alternatives/${page.slug}`}>
                  Compare
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
