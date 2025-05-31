"use client"

import ComparisonInteractive from "./comparison-interactive"

type ComparisonCategory = "context" | "cultural" | "timestamp" | "idiomatic" | "content"

const comparisonCategoriesData = [
  {
    id: "context" as ComparisonCategory,
    label: "Context Awareness",
    mitsukoLevel: "Advanced",
    mtlLevel: "Limited",
  },
  {
    id: "idiomatic" as ComparisonCategory,
    label: "Idiomatic Expressions",
    mitsukoLevel: "Preserved",
    mtlLevel: "Literal",
  },
  {
    id: "cultural" as ComparisonCategory,
    label: "Cultural Adaptation",
    mitsukoLevel: "Excellent",
    mtlLevel: "Poor",
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
      mitsuko: { label: "Mitsuko Transcription (Perfect Timing)", content: ["00:01:15,250 --> 00:01:17,800\nWe need to activate the device now!", "00:01:18,100 --> 00:01:19,500\nBut is it stable?"] }, // Precise timing
      generic: { label: "Generic Transcription (Approximate Timing)", content: "00:01:14 --> 00:01:20\nWe need to activate the device now! But is it stable?" }, // Less precise, potential overlap
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
    {
      original: { label: "Original Subtitle (English Idiom & Numbers)", content: "How about we divide and conquer?\nSakamoto 15M, Shin 10M, Lu 5M, Total: 30M" },
      mitsuko: { label: "Mitsuko Translation (Meaning & Formatting)", content: "Bagaimana kalau kita bagi tugas?\nSakamoto 15Jt, Shin 10Jt, Lu 5Jt, Total: 30Jt" }, // Translates idiom meaning ("bagi tugas" = divide tasks) and adapts number format (M -> Jt)
      generic: { label: "Generic Translation (Literal)", content: "Bagaimana kalau kita membagi dan menaklukkan?\nSakamoto 15Jt, Shin 10Jt, Lu 5Jt, Total: 30Jt" }, // Translates idiom literally ("membagi dan menaklukkan" = divide and conquer)
      advantage: {
        title: "Idiomatic Expressions & Formatting Advantage:",
        description: [
          "Accurately translates the intended meaning of idioms, not just the words.",
          "Adapts formatting conventions (like number abbreviations) to the target language.",
          "Ensures natural and culturally appropriate phrasing.",
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
  return (
    <div className="bg-white dark:bg-black py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div>
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Why Choose Mitsuko
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-3xl mx-auto mb-12">
            See how Mitsuko outperforms machine translator and is comparable to human translation
          </p>
        </div>

        <div>
          <ComparisonInteractive
            comparisonCategoriesData={comparisonCategoriesData}
            comparisonDetailsTextData={comparisonDetailsTextData}
          />
        </div>
      </div>
    </div>
  )
}
