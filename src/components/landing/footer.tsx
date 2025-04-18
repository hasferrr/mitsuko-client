import { DISCORD_LINK, GITHUB_LINK } from "@/constants/external-links"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
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
          <h3 className="text-base font-medium mb-4 text-gray-900 dark:text-white">Other Sites</h3>
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
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">© 2025 Mitsuko. All rights reserved.</p>
      </div>
    </footer>
  )
}

