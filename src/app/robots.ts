import type { MetadataRoute } from 'next'
import { DEPLOYMENT_URL } from '@/constants/external-links'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${DEPLOYMENT_URL}/sitemap.xml`,
  }
}
