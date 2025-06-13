import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { META_DESCRIPTION, META_KEYWORDS, META_TITLE_LONG } from '@/constants/metadata'
import { DEPLOYMENT_URL } from '@/constants/external-links'
import { cn } from '@/lib/utils'
import Providers from '@/contexts/providers'

const schema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Mitsuko",
  "url": DEPLOYMENT_URL,
  "logo": `${DEPLOYMENT_URL}/android-chrome-512x512.png`,
}

export const metadata: Metadata = {
  title: META_TITLE_LONG,
  description: META_DESCRIPTION,
  keywords: META_KEYWORDS,
  metadataBase: new URL(DEPLOYMENT_URL),
  openGraph: {
    title: META_TITLE_LONG,
    description: META_DESCRIPTION,
    url: DEPLOYMENT_URL,
    siteName: 'Mitsuko',
    images: [
      {
        url: `${DEPLOYMENT_URL}/og-image-2.png`,
        width: 1200,
        height: 630,
        alt: 'Mitsuko Application Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: META_TITLE_LONG,
    description: META_DESCRIPTION,
    images: [`${DEPLOYMENT_URL}/og-image-2.png`],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

const geistSans = Geist({
  subsets: ["latin"],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn(geistSans.variable, geistMono.variable, "dark scroll-smooth")}>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        {process.env.NODE_ENV === "development" && process.env.REACT_SCAN_ENABLED === "true" && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        )}
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
