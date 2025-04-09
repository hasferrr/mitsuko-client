import { META_DESCRIPTION, META_TITLE } from '@/constants/metadata'
import { META_TITLE_LONG } from '@/constants/metadata'
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: META_TITLE_LONG,
    short_name: META_TITLE,
    description: META_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}