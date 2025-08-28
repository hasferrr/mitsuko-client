import { DISCORD_LINK, GITHUB_LINK } from "@/constants/external-links"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getAllPostsMeta } from "@/lib/blog"

const badges = [
  {
    href: "https://www.producthunt.com/posts/mitsuko?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-mitsuko",
    imgSrc: "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=967970&theme=light&t=1747740838500",
    alt: "Mitsuko App - AI-Powered Subtitle Translator & Audio Transcription | Product Hunt",
  },
  {
    href: "https://startupfa.me/s/mitsuko?utm_source=www.mitsuko.app",
    imgSrc: "https://startupfa.me/badges/featured-badge.webp",
    alt: "Featured on Startup Fame",
  },
  {
    href: "https://www.saashub.com/mitsuko-app?utm_source=badge&utm_campaign=badge&utm_content=mitsuko-app&badge_variant=color&badge_kind=approved",
    imgSrc: "https://cdn-b.saashub.com/img/badges/approved-color.png?v=1",
    alt: "Mitsuko App badge",
  },
  {
    href: "https://fazier.com/launches/mitsuko",
    imgSrc: "https://fazier.com/api/v1/public/badges/embed_image.svg?launch_id=4431&badge_type=daily&theme=light",
    alt: "Fazier badge",
  },
  {
    href: "https://similarlabs.com/?ref=embed",
    imgSrc: "https://similarlabs.com/similarlabs-embed-badge-light.svg",
    alt: "SimilarLabs Embed Badge",
    className: "bg-white rounded-sm",
  },
  {
    href: "https://twelve.tools",
    imgSrc: "https://twelve.tools/badge0-white.svg",
    alt: "Featured on Twelve Tools",
  },
  {
    href: "https://dang.ai/",
    imgSrc: "https://cdn.prod.website-files.com/63d8afd87da01fb58ea3fbcb/6487e2868c6c8f93b4828827_dang-badge.png",
    alt: "Dang.ai",
  },
]

export default async function Footer() {
  const posts = await getAllPostsMeta()
  const latest = posts.slice(0, 4)
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-11 gap-8">
        <div className="flex flex-col gap-4 lg:col-span-3 lg:mr-8">
          <div className="flex items-center">
            <span className="text-base font-medium text-gray-900 dark:text-white">About</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>Mitsuko breaks down language barriers to make all content accessible.</p>
            <p>Made with ❤️ by{" "}
              <Link
                href={GITHUB_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Hasfer
              </Link>
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-base font-medium mb-4 text-gray-900 dark:text-white">Resources</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/blog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Documentation
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Changelog
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-base font-medium mb-4 text-gray-900 dark:text-white">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-base font-medium mb-4 text-gray-900 dark:text-white">Community</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href={DISCORD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Discord
              </Link>
            </li>
            <li>
              <Link
                href={GITHUB_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                GitHub
              </Link>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-base font-medium mb-4 text-gray-900 dark:text-white">Articles</h3>
          <ul className="flex flex-col gap-2">
            {latest.map(p => (
              <li key={p.slug} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Link href={`/blog/${p.slug}`} className="line-clamp-2">{p.title.split(":")[0] || p.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="flex flex-wrap items-center md:justify-center gap-2 mt-16 mb-8">
        {badges.map((badge, index) => (
          <li
            key={`badge-${index}`}
            className="w-fit text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <a href={badge.href} target="_blank" rel="noopener">
              <img
                src={badge.imgSrc}
                alt={badge.alt}
                width="auto"
                height="auto"
                className={cn("h-[37px] md:h-[40px] object-contain", badge.className)}
              />
            </a>
          </li>
        ))}
      </ul>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">

        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">© 2025 Mitsuko. All rights reserved.</p>
      </div>
    </footer>
  )
}

