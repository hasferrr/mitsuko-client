"use client"

import { Languages, AudioWaveform, Layers } from "lucide-react"

export default function KeyFeatures() {
  return (
    <div className="mt-24 mb-12">
      <div className="relative text-center px-4">
        <div id="features" className="absolute -top-24" />
        <h2 className="md:text-4xl text-3xl font-semibold mb-4 tracking-tight">
          Key Features
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Everything you need for high-quality translation and transcription.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
        >
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl p-8 shadow-sm">
            <div className="text-[#3B82F6] mb-6">
              <Languages size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Subtitle Translator</h3>
            <p className="text-gray-600 dark:text-gray-400 -tracking-[0.02em]">
              Translate subtitles with frontier AI models like Gemini, Claude, Grok, and OpenAI.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl p-8 shadow-sm">
            <div className="text-red-500 mb-6">
              <div className="w-10 h-10 rounded-md bg-red-500 flex items-center justify-center">
                <AudioWaveform size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Audio Transcriber</h3>
            <p className="text-gray-600 dark:text-gray-400 -tracking-[0.02em]">
              Generate perfectly timed subtitles from audio files with custom instructions for precise results.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl p-8 shadow-sm">
            <div className="text-purple-500 mb-6">
              <Layers size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Context Extractor</h3>
            <p className="text-gray-600 dark:text-gray-400 -tracking-[0.02em]">
              Maintain context across episodes and scenes for consistent, accurate, and high-quality translations.
            </p>
          </div>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mx-auto"
        >
          {/* Context-aware translation component */}
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 text-[#3B82F6] mb-6">
              <Languages size={20} />
              <span>Subtitle Translation</span>
            </div>

            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Context-aware
            </h3>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border border-[#3B82F6] flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 -tracking-[0.02em]">
                  Prioritize the meaning over literal translation
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border border-[#3B82F6] flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 -tracking-[0.02em]">
                  Tonal alignment with character speech patterns
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border border-[#3B82F6] flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 -tracking-[0.02em]">
                  Adapt the cultural nuance and idiomatic usage
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border border-[#3B82F6] flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 -tracking-[0.02em]">
                  Guide the translation with custom instructions
                </p>
              </div>
            </div>
          </div>

          {/* Audio Transcription Component */}
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 text-red-500 mb-6">
              <AudioWaveform size={20} />
              <span>Audio Transcription</span>
            </div>

            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Subtitle Timing
            </h3>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border border-red-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 -tracking-[0.02em]">
                  Accurate audio to text transcription
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border border-red-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 -tracking-[0.02em]">
                  Precise spotting and subtitle timing
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border border-red-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 -tracking-[0.02em]">
                  Additional custom instructions before transcribing
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border border-red-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 -tracking-[0.02em]">
                  Intelligent sentence and clause-based segmentation
                </p>
              </div>
            </div>
          </div>

          {/* Context Extractor Component */}
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#222222] rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-2 text-purple-500 mb-6">
              <Layers size={20} />
              <span>Context Extractor</span>
            </div>

            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Context Generation
            </h3>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border border-purple-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 -tracking-[0.02em]">
                  Get context from subtitles, audio, or text sources
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border border-purple-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 -tracking-[0.02em]">
                  Inform the AI based on the context provided
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border border-purple-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 -tracking-[0.02em]">
                  Maintain consistency across episodes
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full border border-purple-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 -tracking-[0.02em]">
                  Improve translation quality
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
