import type { Metadata } from "next"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import type { SolutionsLandingPage } from "@/constants/solutions-pages"

export function createSolutionsLandingMetadata(page: SolutionsLandingPage): Metadata {
  const url = `${DEPLOYMENT_URL}/solutions/${page.slug}`

  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      siteName: "Mitsuko",
      images: [
        {
          url: `${DEPLOYMENT_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Mitsuko subtitle localization workflow",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
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
}
