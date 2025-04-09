import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { META_DESCRIPTION, META_TITLE_LONG } from '@/constants/metadata'
import { DEPLOYMENT_URL } from '@/constants/external-links'
import { cn } from '@/lib/utils'
import Providers from '@/contexts/providers'

export const metadata: Metadata = {
  title: META_TITLE_LONG,
  description: META_DESCRIPTION,
  metadataBase: new URL(DEPLOYMENT_URL),
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
        {process.env.NODE_ENV === "development" && (
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
