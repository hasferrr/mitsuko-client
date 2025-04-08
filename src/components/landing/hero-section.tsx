import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HeroSection() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col h-full">
      <div className="mb-10 flex mx-auto items-center gap-2 text-blue-400 rounded-full bg-blue-400/10 px-4 py-2">
        <span className="text-blue-400 text-center text-sm md:text-base">
          AI-Powered Subtitle Translator & Audio Transcription
        </span>
      </div>

      <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl sm:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
          Translate subtitles with <span className="text-blue-400">context-aware</span>{" "}
          <span className="block">precision using AI</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm md:text-lg sm:text-base">
          Mitsuko translates subtitles between 100+ languages & transcribes audio with perfect timing.
          It utilizes artificial intelligence to deliver translations that capture nuance and intent.
        </p>
        <div className="flex gap-4">
          <Link
            href="#"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md flex items-center gap-2 transition-colors"
          >
            Get Started
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#"
            className="border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-md transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
