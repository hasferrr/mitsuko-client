import type { Metadata } from "next"
import { DEPLOYMENT_URL } from "@/constants/external-links"

type AlternativeLandingMeta = {
  title: string
  description: string
  keywords?: string[]
}

export function createAlternativeLandingMetadata(
  slug: string,
  meta: AlternativeLandingMeta,
): Metadata {
  const url = `${DEPLOYMENT_URL}/alternatives/${slug}`

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords && meta.keywords.length ? meta.keywords : undefined,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: "Mitsuko",
      images: [
        {
          url: `${DEPLOYMENT_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Mitsuko subtitle translation workspace",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
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
