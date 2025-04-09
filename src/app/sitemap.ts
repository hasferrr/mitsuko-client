import type { MetadataRoute } from 'next'
import { DEPLOYMENT_URL } from '@/constants/external-links'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
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
  ]
}
