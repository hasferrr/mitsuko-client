"use client"

import Link from "next/link"
import { DISCORD_LINK } from "@/constants/external-links"
import { useEmailLink } from "@/hooks/use-email-link"
import { useSessionStore } from "@/stores/ui/use-session-store"
import { Mail } from "lucide-react"
import { IconBrandDiscord } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

export default function CtaSection() {
  const session = useSessionStore((state) => state.session)
  const { emailHref, eventHandlers } = useEmailLink()

  return (
    <section className="w-full py-16 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-3xl border border-border bg-gray-50/70 dark:bg-[#121212] px-6 py-10 md:px-10 md:py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-3xl font-semibold tracking-tighter text-foreground">
                Let Mitsuko translates your subtitles
              </h2>
              <p className="mt-3 text-muted-foreground md:text-base/relaxed">
                All you need is editing and QA. Mitsuko handles the heavy lifting of the translation step with context-aware AI.
              </p>
              <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <Link
                    href={emailHref}
                    className="flex items-center gap-2 hover:text-foreground"
                    {...eventHandlers}
                  >
                    <Mail className="size-4" />
                    Contact Us
                  </Link>
                  <Link
                    href={DISCORD_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    <IconBrandDiscord className="size-5" />
                    Join Discord
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="rounded-full shadow-xs whitespace-nowrap px-5 py-2.5">
                <Link href="/dashboard">
                  {session ? "Go to Dashboard" : "Get started for free"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
