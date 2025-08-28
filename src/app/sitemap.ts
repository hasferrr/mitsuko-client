import type { MetadataRoute } from 'next'
import { DEPLOYMENT_URL } from '@/constants/external-links'
import { getAllPostsMeta } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    {
      url: DEPLOYMENT_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${DEPLOYMENT_URL}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${DEPLOYMENT_URL}/project`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${DEPLOYMENT_URL}/batch`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${DEPLOYMENT_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${DEPLOYMENT_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${DEPLOYMENT_URL}/changelog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${DEPLOYMENT_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${DEPLOYMENT_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  const posts = await getAllPostsMeta()
  const postEntries: MetadataRoute.Sitemap = posts.map(p => ({
    url: `${DEPLOYMENT_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updated || p.date),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [...base, ...postEntries]
}
