"use client"

import { Check } from "lucide-react"

const generalFeaturesList = [
  {
    feature: "Flexible Credit System",
    description: "Utilize credits for various features, available through plans or purchased separately.",
  },
  {
    feature: "Subtitle Translation",
    description: "Translate subtitles (SRT, VTT, ASS) using all available AI models for over 100+ languages.",
  },
  {
    feature: "Extract Context Feature",
    description: "Analyze content to extract characters, settings, plot, and relationships.",
  },
  {
    feature: "Audio Transcription",
    description: "Convert audio into subtitle text. Supports large files and background processing.",
  },
  {
    feature: "Batch Translation",
    description: "Translate multiple files simultaneously to improve workflow efficiency and save time.",
  },
  {
    feature: "Project Management & Backup",
    description: "Efficiently manage, organize, backup and transfer your translation projects, subtitles, and related assets.",
  },
  {
    feature: "Access to All Models",
    description: "Select from a wide range of AI models available on the platform.",
  },
  {
    feature: "Support Options",
    description: "Access Discord community and email support resources.",
  },
]

export function GeneralFeaturesSection() {
  return (
    <div
      className="mt-8 rounded-xl bg-white dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 overflow-hidden max-w-5xl mx-auto shadow-sm"
    >
      <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Key Platform Features
        </h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {generalFeaturesList.map((item) => (
          <div key={item.feature} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span className="text-base font-medium text-gray-800 dark:text-gray-200">
                {item.feature}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 pl-7">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}