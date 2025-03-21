import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import './globals.css'
import { META_DESCRIPTION, META_TITLE } from '@/constants/metadata'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
}

const noto = Noto_Sans({
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn(noto.className, "dark")}>
      <head>
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="icon.png" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
