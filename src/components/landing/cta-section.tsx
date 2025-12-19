"use client"

import Link from "next/link"
import { DISCORD_LINK } from "@/constants/external-links"
import { useEmailLink } from "@/hooks/use-email-link"
import { useSessionStore } from "@/stores/use-session-store"
import { Mail } from "lucide-react"
import { IconBrandDiscord } from "@tabler/icons-react"

export default function CtaSection() {
  const session = useSessionStore((state) => state.session)
  const { emailHref, eventHandlers } = useEmailLink()

  return (
    <section className="w-full py-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-[#121212] px-6 py-10 md:px-10 md:py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-3xl font-semibold tracking-tighter text-gray-900 dark:text-white">
                Let Mitsuko translate your subtitles
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400 md:text-base/relaxed">
                All you need is editing and QA. Mitsuko handles the heavy lifting of the translation step with context-aware AI.
              </p>
              <div className="mt-5 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <Link
                    href={emailHref}
                    className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white"
                    {...eventHandlers}
                  >
                    <Mail className="w-4 h-4" />
                    Contact Us
                  </Link>
                  <Link
                    href={DISCORD_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white"
                  >
                    <IconBrandDiscord className="h-5 w-5" />
                    Join Discord
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="whitespace-nowrap inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#101828] text-white text-sm font-semibold shadow-sm transition-colors hover:bg-[#15213a] hover:shadow dark:bg-white dark:text-[#101828] dark:hover:bg-[#f4f4f5]"
              >
                {session ? "Go to Dashboard" : "Get started for free"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
