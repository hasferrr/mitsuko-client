"use client"

import { useState } from "react"
import { Check, Globe, Target, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type ComparisonCategory = "context" | "cultural" | "timestamp" | "idiomatic" | "content"

const comparisonCategoriesData = [
  {
    id: "context" as ComparisonCategory,
    label: "Context Awareness",
    mitsukoLevel: "Advanced",
    mtlLevel: "Limited",
  },
  {
    id: "cultural" as ComparisonCategory,
    label: "Cultural Adaptation",
    mitsukoLevel: "Excellent",
    mtlLevel: "Poor",
  },
  {
    id: "idiomatic" as ComparisonCategory,
    label: "Idiomatic Expressions",
    mitsukoLevel: "Preserved",
    mtlLevel: "Literal",
  },
  {
    id: "content" as ComparisonCategory,
    label: "Nuance & Tone",
    mitsukoLevel: "Aligned",
    mtlLevel: "Ignored",
  },
  {
    id: "timestamp" as ComparisonCategory,
    label: "Timestamp Accuracy",
    mitsukoLevel: "Perfect",
    mtlLevel: "Not Available",
  },
]

interface ComparisonDetailText {
  original?: { label: string; content: string }
  mitsuko: { label: string; content: string | string[] }
  generic: { label: string; content: string }
  advantage: { title: string; description: string | string[] }
}

const comparisonDetailsTextData: Record<ComparisonCategory, ComparisonDetailText[]> = {
  context: [
    {
      original: { label: "Original Subtitle (Scene Context: Character is frustrated)", content: "もう我慢できない！" }, // "I can't stand it anymore!"
      mitsuko: { label: "Mitsuko Translation (Context-Aware)", content: "I've had enough of this!" }, // Captures frustration and intent
      generic: { label: "Generic Translation (Literal)", content: "I cannot endure anymore!" }, // Literal, less natural
      advantage: {
        title: "Context Awareness Advantage:",
        description: [
          "Understands the situation and character's emotion for accurate intent.",
          "Prioritizes meaning over rigid literal translation based on context.",
          "Maintains consistency with character voice across scenes.",
        ],
      },
    },
  ],
  cultural: [
    {
      original: { label: "Original Subtitle (Japanese idiom)", content: "彼は空気を読めない。" }, // "He can't read the air." (Meaning: Socially inept)
      mitsuko: { label: "Mitsuko Translation (Cultural Adaptation)", content: "He's clueless about social cues." }, // Translates the cultural meaning
      generic: { label: "Generic Translation (Literal)", content: "He cannot read the air." }, // Literal, meaning lost
      advantage: {
        title: "Cultural Adaptation Advantage:",
        description: "Accurately translates cultural nuances and idiomatic expressions, preserving the intended meaning for the target audience by referencing local equivalents.",
      },
    },
  ],
  timestamp: [
    {
      original: { label: "Audio Segment", content: "Audio waveform visualization showing speech." }, // Placeholder for visual concept
      mitsuko: { label: "Mitsuko Transcription (Perfect Timing)", content: ["00:01:15,250 --> 00:01:17,800 - We need to activate the device now!", "00:01:18,100 --> 00:01:19,500 - But is it stable?"] }, // Precise timing
      generic: { label: "Generic Transcription (Approximate Timing)", content: "00:01:14 --> 00:01:20 - We need to activate the device now! But is it stable?" }, // Less precise, potential overlap
      advantage: {
        title: "Timestamp Accuracy Advantage:",
        description: "Generates perfectly timed subtitles directly from audio, ensuring perfect synchronization with speech, crucial for viewing experience.",
      },
    },
  ],
  idiomatic: [
    {
      original: { label: "Original Subtitle (English Idiom)", content: "Okay team, let's hit the ground running." },
      mitsuko: { label: "Mitsuko Translation (Idiom Meaning Preserved)", content: "よしチーム、早速始めよう。" }, // "Alright team, let's get started right away."
      generic: { label: "Generic Translation (Literal)", content: "オーケーチーム、地面を走って打ちましょう。" }, // "Okay team, let's hit by running on the ground." (Nonsensical)
      advantage: {
        title: "Idiomatic Expressions Advantage:",
        description: [
          "Recognizes and translates the meaning of idiomatic expressions.",
          "Avoids awkward or incorrect literal interpretations.",
        ],
      },
    },
    {
      original: { label: "Original Subtitle (Figurative Speech)", content: "A song has come to me!" }, // Meaning inspiration/realization
      mitsuko: { label: "Mitsuko Translation (Meaning-Based)", content: "Aku tercerahkan!" }, // Indonesian for "I am enlightened!" / "I had a realization!"
      generic: { label: "Generic Translation (Literal)", content: "Sebuah lagu telah datang padaku." }, // Indonesian for "A song has come to me." (Literal, meaning lost)
      advantage: {
        title: "Idiomatic Expressions Advantage:",
        description: [
          "Prioritizes translating the *meaning* of idiomatic or figurative expressions over literal words.",
          "Researches and references local idioms in the target language to convey the same sense.",
          "Avoids awkward or nonsensical literal interpretations.",
        ],
      },
    },
  ],
  content: [
    {
      original: { label: "Original Subtitle (Character Tone: Sarcastic)", content: "Oh, *fantastic* work. Just brilliant." },
      mitsuko: { label: "Mitsuko Translation (Tonal Alignment)", content: "へえ、*素晴らしい*仕事だね。実に素晴らしい。" }, // Captures sarcastic tone with appropriate emphasis/phrasing
      generic: { label: "Generic Translation (Flat Tone)", content: "ああ、素晴らしい仕事です。ただ素晴らしい。" }, // Loses the sarcastic nuance
      advantage: {
        title: "Nuance & Tone Advantage:",
        description: [
          "Aligns translation tone with original character speech patterns.",
          "Captures subtle nuances like sarcasm, humor, or formality.",
          "Ensures consistent terminology for technical or specific content.",
        ],
      },
    },
  ],
}


export default function ComparisonSection() {
  const [hoveredCategory, setHoveredCategory] = useState<ComparisonCategory>("context")
  const [exampleIndex, setExampleIndex] = useState(0)

  const currentCategoryExamples = comparisonDetailsTextData[hoveredCategory]
  const details = currentCategoryExamples[exampleIndex]
  const hasMultipleExamples = currentCategoryExamples.length > 1

  const showNextExample = () => {
    setExampleIndex((prevIndex) => (prevIndex + 1) % currentCategoryExamples.length)
  }

  const handleMouseEnter = (category: ComparisonCategory) => {
    setHoveredCategory(category)
    setExampleIndex(0)
  }

  return (
    <div className="bg-white dark:bg-black py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Why Choose Mitsuko
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-12">
          See how Mitsuko outperforms machine translator and is comparable to human translation
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Comparison Table */}
          <div
            className="dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-8"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Mitsuko vs. Generic Translation
            </h3>

            <div className="flex justify-center gap-16 mb-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-2">
                  <Target size={24} className="text-white" />
                </div>
                <span className="text-gray-900 dark:text-white font-medium">Mitsuko</span>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-2"
                >
                  <Globe size={24} className="text-gray-500 dark:text-gray-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  MTL
                </span>
              </div>
            </div>

            {/* Comparison Rows - Mapped from constant */}
            <div>
              {comparisonCategoriesData.map((category) => (
                <div
                  key={category.id}
                  className={cn(
                    "border-b border-gray-300 dark:border-gray-700 transition-colors duration-200 rounded-md p-4 cursor-pointer",
                    hoveredCategory === category.id && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onMouseEnter={() => handleMouseEnter(category.id)} // Use updated handler
                >
                  <div className="flex justify-between items-center my-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category.label}
                    </span>
                    <div className="flex gap-4">
                      <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">{category.mitsukoLevel}</span>
                      <span
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 text-sm rounded-full"
                      >
                        {category.mtlLevel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - See the Difference - Rendered from text constant */}
          <div
            className="dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-8"
          >
            {/* Heading with Next Example Button */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                See the Difference
              </h3>
              {hasMultipleExamples && (
                <button
                  onClick={showNextExample}
                  className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  aria-label="Show next example"
                >
                  Next Example <ChevronRight size={16} />
                </button>
              )}
            </div>

            {/* Example Content */}
            <div className="space-y-6 animate-fadeIn">
              {/* Render Original */}
              {details.original && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {details.original.label}
                    </span>
                  </div>
                  <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-900">
                    {/* Special handling for timestamp visual placeholder */}
                    {hoveredCategory === "timestamp" ? (
                      <div className="italic text-gray-600 dark:text-gray-400">
                        {details.original.content} {/* Display placeholder text */}
                      </div>
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200">{details.original.content}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Render Mitsuko */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="flex items-center gap-1">
                    <Target size={16} className="text-blue-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {details.mitsuko.label}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-900">
                  {Array.isArray(details.mitsuko.content) ? (
                    // Handle array content (e.g., timestamp list)
                    <div className="space-y-1">
                      {details.mitsuko.content.map((item, index) => (
                        <p key={index} className="text-gray-800 dark:text-gray-200 font-mono text-sm"> {/* Use mono for timestamps */}
                          {item}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200">{details.mitsuko.content}</p>
                  )}
                </div>
              </div>

              {/* Render Generic */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="flex items-center gap-1">
                    <Globe size={16} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {details.generic.label}
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-900">
                  {/* Special handling for timestamp generic content */}
                  {hoveredCategory === "timestamp" ? (
                    <p className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                      {details.generic.content}
                    </p>
                  ) : (
                    <p className="text-gray-800 dark:text-gray-200">
                      {details.generic.content}
                    </p>
                  )}
                </div>
              </div>

              {/* Render Advantage */}
              <div className="mt-4">
                <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {details.advantage.title}
                </h4>
                {Array.isArray(details.advantage.description) ? (
                  <ul className="space-y-4">
                    {details.advantage.description.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="text-blue-400 mt-1 flex-shrink-0" size={18} />
                        <p className="text-gray-700 dark:text-gray-300">{item}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {details.advantage.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
