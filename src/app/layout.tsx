import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import './globals.css'
import { META_DESCRIPTION, META_TITLE } from '@/constants/metadata'

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
    <html lang="en" className={noto.className}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="192x192" href="icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
