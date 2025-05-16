import { DISCORD_LINK, GITHUB_LINK } from "@/constants/external-links"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        <div>
          <div className="flex items-center mb-4">
            <span className="text-base font-medium text-gray-900 dark:text-white">Mitsuko</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            High quality AI subtitle translator for SRT/ASS files, audio transcriber, and more.
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium mb-4 text-gray-900 dark:text-white">Resources</h3>
          <ul className="space-y-2">
            <li>
              <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
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
              <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Status
              </Link>
            </li>
          </ul>
        </div>

        <div>
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

        <div>
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

        <div>
          <h3 className="text-base font-medium mb-4 text-gray-900 dark:text-white">Featured On</h3>
          <ul className="flex flex-col gap-2">
            <li className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <a href="https://similarlabs.com/?ref=embed" target="_blank" rel="noopener">
                <img
                  src="https://similarlabs.com/similarlabs-embed-badge-light.svg"
                  alt="SimilarLabs Embed Badge"
                  width="auto"
                  height="auto"
                  className="h-[45px] object-contain bg-white rounded-sm"
                />
              </a>
            </li>
            <li className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <a href="https://twelve.tools" target="_blank" rel="noopener">
                <img
                  src="https://twelve.tools/badge0-white.svg"
                  alt="Featured on Twelve Tools"
                  width="auto"
                  height="auto"
                  className="h-[40px] object-contain"
                />
              </a>
            </li>
            <li className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <a href="https://dang.ai/" target="_blank" rel="noopener">
                <img
                  src="https://cdn.prod.website-files.com/63d8afd87da01fb58ea3fbcb/6487e2868c6c8f93b4828827_dang-badge.png"
                  alt="Dang.ai"
                  width="auto"
                  height="auto"
                  className="h-[42px] object-contain"
                />
              </a>
            </li>
            <li className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <a target="_blank" rel="noopener" title="All The Best AI Tools" href="https://allinai.tools">All in AI Tools</a>
            </li>
            <li className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <a target="_blank" rel="noopener" href="https://aistage.net" title="AIStage">AIStage</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">© 2025 Mitsuko. All rights reserved.</p>
      </div>
    </footer>
  )
}

