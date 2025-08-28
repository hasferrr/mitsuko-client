import type { Metadata } from 'next'
import Link from 'next/link'
import { DEPLOYMENT_URL } from '@/constants/external-links'
import { getAllPostsMeta } from '@/lib/blog'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog - Mitsuko',
  description: 'Articles and guides about AI subtitle translation, batch processing, and localization workflows with Mitsuko.',
  alternates: {
    canonical: `${DEPLOYMENT_URL}/blog`,
  },
  openGraph: {
    title: 'Mitsuko Blog',
    description: 'Guides, tips, and product updates for AI subtitle translation and transcription.',
    url: `${DEPLOYMENT_URL}/blog`,
    siteName: 'Mitsuko',
    images: [
      {
        url: `${DEPLOYMENT_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Mitsuko'
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mitsuko Blog',
    description: 'Guides, tips, and product updates for AI subtitle translation and transcription.',
    images: [`${DEPLOYMENT_URL}/og-image.png`]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
}

function BlogJsonLd() {
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Mitsuko Blog',
    url: `${DEPLOYMENT_URL}/blog`,
    description: 'Guides, tips, and product updates for AI subtitle translation and transcription.'
  }
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
  )
}

export default async function BlogIndexPage() {
  const posts = await getAllPostsMeta()
  return (
    <main className="mx-auto w-full max-w-3xl px-4 md:px-6 py-16">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Mitsuko Blog</h1>
        <p className="mt-2 text-muted-foreground">Guides, tips, and updates for AI subtitle translation and transcription</p>
        {posts.length === 0 ? (
          <p className="mt-10 text-muted-foreground">No posts published yet</p>
        ) : (
          <div className="mt-10 space-y-8">
            {posts.map(post => (
              <article key={post.slug} className="border-b border-border pb-8">
                <h2 className="text-2xl font-medium">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                <div className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-1">
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}</time>
                  <span className="mx-1">•</span>
                  <span className="mr-1">{post.readingTimeMinutes} min read</span>
                  {post.tags.length > 0 && (
                    <>{post.tags.map(t => <span key={t} className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{t}</span>)}</>
                  )}
                </div>
                <p className="mt-3 text-muted-foreground">{post.description}</p>
                <div className="mt-3">
                  <Link href={`/blog/${post.slug}`} className="text-primary hover:underline">Read more</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <BlogJsonLd />
    </main>
  )
}
