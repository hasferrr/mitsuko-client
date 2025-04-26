import Link from "next/link"
import { ArrowRight } from "lucide-react"
import HeroSignIn from "./hero-sign-in"

export default function HeroSection() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col h-full">
      <div className="mb-10 flex mx-auto items-center gap-2 text-blue-400 rounded-full bg-blue-400/10 px-4 py-2">
        <span className="text-blue-400 text-center text-sm md:text-base">
          AI-Powered Subtitle Translator
        </span>
      </div>

      <div className="flex flex-col items-center text-center max-w-3xl mx-auto px-4">
        <h1 className="sr-only">AI Subtitle Translator Mitsuko: Fast & Accurate Translations.</h1>
        <div className="flex flex-col-reverse">
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm md:text-lg sm:text-base">
            Get accurate SRT/ASS translations & precise audio transcription by Mitsuko.
            Experience natural, context-aware results in 100+ languages. Try it now!
          </p>
          <p className="text-4xl md:text-6xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Effortlessly translate subtitles with high-quality results using AI
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md flex items-center gap-2 transition-colors"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>
          <HeroSignIn />
        </div>
      </div>
    </div>
  )
}
