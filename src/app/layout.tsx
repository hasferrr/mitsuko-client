import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mitsuko',
  description: 'Mitsuko',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://i.pinimg.com/1200x/2f/52/bb/2f52bb67e52f767ed39a2d655537829c.jpg" type="image/jpg" />
      </head>
      <body>{children}</body>
    </html>
  )
}
