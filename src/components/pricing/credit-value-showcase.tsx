"use client"

import Link from "next/link"
import { DISCORD_LINK } from "@/constants/external-links"
import { Sparkles, Mail, MessageSquare } from "lucide-react"
import { useEmailLink } from "@/hooks/use-email-link"

interface CreditValueShowcaseProps {
  showGetCreditsButton?: boolean
}

export default function CreditValueShowcase({ showGetCreditsButton = false }: CreditValueShowcaseProps) {
  const { emailHref, eventHandlers } = useEmailLink()

  const example1Credits = 112_731
  const example1Minutes = 100
  const example1CreditsPerMinute = example1Credits / example1Minutes

  const example2Credits = 119_458
  const example2Minutes = 26
  const example2CreditsPerMinute = example2Credits / example2Minutes

  const averageCreditsPerMinute = (example1CreditsPerMinute + example2CreditsPerMinute) / 2

  const showcaseCredits = 2_000_000
  const totalMinutes = showcaseCredits / averageCreditsPerMinute
  const totalHours = Math.floor(totalMinutes / 60)
  const remainingMinutes = Math.round(totalMinutes % 60)

  return (
    <div className="relative rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 border border-blue-700 overflow-hidden max-w-5xl mx-auto mt-8 p-8 shadow-lg text-white">
      <div className="absolute top-0 left-0 -ml-12 -mt-12 w-48 h-48 bg-white/10 rounded-full opacity-50"></div>
      <div className="absolute bottom-0 right-0 mr-4 mb-4 w-32 h-32 bg-white/10 rounded-full opacity-30"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            Unlock Massive Translation Power!
          </h3>
          <p className="text-lg text-blue-100 mb-4">
            Ever wondered what <strong>2 Million Credits</strong> can get you? Hours of subtitle translation using powerful DeepSeek R1 with context-memory enabled!
          </p>
          <p className="text-sm text-blue-200">
            *Credit cost varies (e.g., Example 1: {example1Credits.toLocaleString()} credits ≈ {example1Minutes} min, ~{Math.round(example1CreditsPerMinute)}/min; up to Example 2: {example2Credits.toLocaleString()} credits ≈ {example2Minutes} min, ~{Math.round(example2CreditsPerMinute)}/min).
            The time shown (~{totalHours}h {remainingMinutes > 0 ? `${remainingMinutes}m ` : ''}) uses an average rate (~{Math.round(averageCreditsPerMinute)} credits/min).
          </p>
        </div>
        <div className="bg-white/20 rounded-lg p-6 text-center shadow-md backdrop-blur-sm border border-white/30 min-w-[200px]">
          <div className="text-5xl font-bold text-yellow-300 mb-2">
            ~{totalHours} hrs
          </div>
          {remainingMinutes > 0 && (
            <div className="text-2xl font-semibold text-blue-100 mb-2">
              & {remainingMinutes} mins
            </div>
          )}
          <div className="text-sm font-medium text-blue-100 uppercase tracking-wider">
            Subtitle Translation
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-6 flex flex-wrap items-center md:justify-start justify-center gap-6">
        {showGetCreditsButton ? (
          <a
            href="#credit-packs"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-purple-800 font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300"
          >
            Get Credits Now!
          </a>
        ) : (
          <Link
            href="/dashboard"
            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-purple-800 font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300"
          >
            Get Started for Free!
          </Link>
        )}
        <div className="flex items-center gap-6">
          <Link
            {...eventHandlers}
            href={emailHref}
            className="flex items-center gap-1 text-blue-100 hover:text-white transition-colors duration-200"
          >
            <Mail className="w-5 h-5" />
            <span className="text-sm font-medium">Contact Us</span>
          </Link>
          <Link
            href={DISCORD_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-100 hover:text-white transition-colors duration-200"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">Discord</span>
          </Link>
        </div>
      </div>
    </div>
  )
}