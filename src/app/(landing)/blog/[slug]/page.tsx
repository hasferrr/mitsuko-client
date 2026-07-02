import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from "@/components/link"
import { MarkdownProse } from "@/components/markdown-prose"
import { DEPLOYMENT_URL } from '@/constants/external-links'
import { getAdjacentPosts, getAllPostsMeta, getPostBySlug } from '@/lib/content/blog'

export const dynamic = 'force-static'

export async function generateStaticParams() {
  const posts = await getAllPostsMeta()
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  const url = `${DEPLOYMENT_URL}/blog/${post.slug}`
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    keywords: post.tags && post.tags.length ? post.tags : undefined,
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: 'Mitsuko',
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      modifiedTime: post.updated ? new Date(post.updated).toISOString() : undefined,
      authors: post.author ? [post.author] : undefined,
      images: post.image ? [{ url: post.image, alt: post.imageAlt || post.title }] : [{ url: `${DEPLOYMENT_URL}/og-image.png`, alt: post.title }]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.image || `${DEPLOYMENT_URL}/og-image.png`]
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
}

function PostJsonLd({
  title,
  description,
  url,
  author,
  date,
  updated,
  image
}: {
  title: string
  description: string
  url: string
  author?: string
  date: string
  updated?: string
  image?: string
}) {
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    author: author ? { '@type': 'Person', name: author } : undefined,
    datePublished: new Date(date).toISOString(),
    dateModified: updated ? new Date(updated).toISOString() : new Date(date).toISOString(),
    image: image || `${DEPLOYMENT_URL}/og-image.png`,
    mainEntityOfPage: url,
    publisher: {
      '@type': 'Organization',
      name: 'Mitsuko',
      logo: {
        '@type': 'ImageObject',
        url: `${DEPLOYMENT_URL}/android-chrome-512x512.png`
      }
    }
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return notFound()
  const { prev, next } = await getAdjacentPosts(post.slug)
  const url = `${DEPLOYMENT_URL}/blog/${post.slug}`
  return (
    <main className="mx-auto w-full max-w-3xl px-4 md:px-6 py-16 text-left">
      <div className="mb-6">
        <Link href="/blog" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">← Back to blog</Link>
      </div>
      <article className="w-full max-w-3xl">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
          <div className="mt-2 text-sm text-muted-foreground">
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}</time>
            {post.updated && (
              <>
                <span className="mx-2">•</span>
                <span>Updated {new Date(post.updated).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}</span>
              </>
            )}
            <span className="mx-2">•</span>
            <span>{post.readingTimeMinutes} min read</span>
          </div>
          {post.tags.length > 0 && (
            <div className="mt-3 space-x-1">
              {post.tags.map(t => (
                <span key={t} className="inline-block rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{t}</span>
              ))}
            </div>
          )}
        </header>
        <div className="mt-8">
          <MarkdownProse content={post.content} />
        </div>
      </article>
      <nav className="mt-12 flex items-center justify-between border-t border-border pt-6 text-sm w-full max-w-3xl">
        <div>
          {prev && (
            <Link href={`/blog/${prev.slug}`} className="hover:underline">← {prev.title}</Link>
          )}
        </div>
        <div className="text-right">
          {next && (
            <Link href={`/blog/${next.slug}`} className="hover:underline">{next.title} →</Link>
          )}
        </div>
      </nav>
      <PostJsonLd
        title={post.title}
        description={post.description}
        url={url}
        author={post.author}
        date={post.date}
        updated={post.updated}
        image={post.image}
      />
    </main>
  )
}
