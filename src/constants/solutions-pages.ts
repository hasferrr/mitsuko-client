export type SolutionsFaq = {
  question: string
  answer: string
}

export type SolutionsLandingPage = {
  slug: string
  eyebrow: string
  h1: string
  intro: string
  badges: string[]
  primaryCta: {
    label: string
    href: string
  }
  secondaryCta?: {
    label: string
    href: string
  }
  faqs: SolutionsFaq[]
  relatedLinks: {
    label: string
    href: string
  }[]
}

export const SOLUTIONS_LANDING_PAGES: Record<string, SolutionsLandingPage> = {
  "anime-subtitle-translator": {
    slug: "anime-subtitle-translator",
    eyebrow: "Anime and drama localization",
    h1: "Translate anime subtitles without flattening the character voice.",
    intro:
      "Add scene context, names, and tone rules so Mitsuko can draft anime subtitles that keep the character voice.",
    badges: ["SRT, VTT, ASS", "Character tone", "Idioms and nuance", "100+ languages"],
    primaryCta: {
      label: "Translate subtitles",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "Read the fansubbing guide",
      href: "/blog/the-art-of-fansubbing-behind-the-scenes-of-anime-subtitles",
    },
    faqs: [
      {
        question: "Can it handle Japanese anime subtitles?",
        answer: "Yes. Add names, honorific rules, and context before translating Japanese subtitle files.",
      },
      {
        question: "Does it support ASS files?",
        answer: "Yes. Mitsuko supports ASS, SRT, and VTT subtitle workflows.",
      },
      {
        question: "Can it follow character tone?",
        answer:
          "Yes. Add custom instructions for speech style, honorifics, recurring terms, and relationship context.",
      },
    ],
    relatedLinks: [
      { label: "ASS subtitle translator", href: "/solutions/ass-subtitle-translator" },
      { label: "Batch subtitle translation", href: "/solutions/batch-subtitle-translation" },
      { label: "Subtitle localization for agencies", href: "/solutions/subtitle-localization-agencies" },
      {
        label: "Fansubbing workflow guide",
        href: "/blog/the-art-of-fansubbing-behind-the-scenes-of-anime-subtitles",
      },
    ],
  },
  "ass-subtitle-translator": {
    slug: "ass-subtitle-translator",
    eyebrow: "ASS subtitle workflow",
    h1: "Translate ASS subtitles without rebuilding the file.",
    intro:
      "Translate ASS dialogue while keeping timing, styles, and override tags ready for review.",
    badges: ["ASS support", "Timing preserved", "Inline tags", "Review-ready output"],
    primaryCta: {
      label: "Translate ASS subtitles",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "Compare anime workflows",
      href: "/solutions/anime-subtitle-translator",
    },
    faqs: [
      {
        question: "Can it translate ASS files?",
        answer: "Yes. Mitsuko supports ASS import and export alongside SRT and VTT.",
      },
      {
        question: "Does it preserve styling?",
        answer: "It keeps ASS structure in the workflow while translating dialogue for review.",
      },
      {
        question: "Can I set term rules?",
        answer: "Yes. Use custom instructions for names, terms, tone, and honorific choices.",
      },
    ],
    relatedLinks: [
      { label: "Anime subtitle translator", href: "/solutions/anime-subtitle-translator" },
      { label: "Batch subtitle translation", href: "/solutions/batch-subtitle-translation" },
      { label: "YouTube subtitle translator", href: "/solutions/youtube-subtitle-translator" },
      { label: "Mitsuko workflow guide", href: "/blog/mitsuko-mastery-guide" },
    ],
  },
  "batch-subtitle-translation": {
    slug: "batch-subtitle-translation",
    eyebrow: "Batch subtitle projects",
    h1: "Upload subtitle files in bulk and translate them right away.",
    intro:
      "Translate multiple SRT, VTT, or ASS files in one project with shared instructions and batch export.",
    badges: ["Batch files", "Shared settings", "Context documents", "SRT, VTT, ASS"],
    primaryCta: {
      label: "Start a batch project",
      href: "/batch",
    },
    secondaryCta: {
      label: "For agencies",
      href: "/solutions/subtitle-localization-agencies",
    },
    faqs: [
      {
        question: "Can I upload many subtitle files?",
        answer: "Yes. Batch projects are built for multiple SRT, VTT, and ASS files.",
      },
      {
        question: "Can files share settings?",
        answer: "Yes. Reuse target language, model, custom instructions, and context across the batch.",
      },
      {
        question: "Can I translate a whole season?",
        answer: "Yes. Add episode files to one batch and translate them together.",
      },
    ],
    relatedLinks: [
      { label: "Subtitle localization for agencies", href: "/solutions/subtitle-localization-agencies" },
      { label: "ASS subtitle translator", href: "/solutions/ass-subtitle-translator" },
      { label: "Audio to subtitles", href: "/solutions/audio-to-subtitles" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  "subtitle-localization-agencies": {
    slug: "subtitle-localization-agencies",
    eyebrow: "For localization agencies",
    h1: "Translate agency subtitle projects with context and instructions.",
    intro:
      "Move client subtitle files into editorial review with drafts that follow project terms, tone, and agency rules.",
    badges: ["Batch translation", "Context extraction", "Custom instructions", "SRT, VTT, ASS"],
    primaryCta: {
      label: "Contact us",
      href: "mailto:support@mitsuko.app?subject=Subtitle%20localization%20workflow",
    },
    secondaryCta: {
      label: "Try Mitsuko",
      href: "/dashboard",
    },
    faqs: [
      {
        question: "Does Mitsuko replace translators?",
        answer:
          "No. Mitsuko translates subtitles with context and instructions, while your team keeps final review and QC.",
      },
      {
        question: "Can agencies batch files?",
        answer: "Yes. Batch projects support multiple subtitle translations at once with shared context, saves a lot of time.",
      },
      {
        question: "Can we control terminology?",
        answer:
          "Yes. Add custom instructions for names, terms, tone, formatting preferences, and client rules.",
      },
    ],
    relatedLinks: [
      { label: "Batch subtitle translation", href: "/solutions/batch-subtitle-translation" },
      { label: "Audio to subtitles", href: "/solutions/audio-to-subtitles" },
      { label: "ASS subtitle translator", href: "/solutions/ass-subtitle-translator" },
      { label: "YouTube subtitle translator", href: "/solutions/youtube-subtitle-translator" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  "audio-to-subtitles": {
    slug: "audio-to-subtitles",
    eyebrow: "Audio to subtitles",
    h1: "Start from audio when no subtitle file exists.",
    intro:
      "Transcribe audio into subtitles, review the captions, then translate them inside Mitsuko.",
    badges: ["Audio transcription", "Timed subtitles", "Review workflow", "100+ languages"],
    primaryCta: {
      label: "Transcribe audio",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "Creator workflow",
      href: "/solutions/youtube-subtitle-translator",
    },
    faqs: [
      {
        question: "Can Mitsuko create subtitles from audio?",
        answer: "Yes. Use the transcription workflow to create timed subtitle text.",
      },
      {
        question: "Can I translate after transcription?",
        answer: "Yes. Review the transcript, then translate it inside Mitsuko.",
      },
      {
        question: "How precise are the transcription timestamps?",
        answer: "Word-level timestamps with natural pacing for readable, in-sync subtitles.",
      },
    ],
    relatedLinks: [
      { label: "YouTube subtitle translator", href: "/solutions/youtube-subtitle-translator" },
      { label: "Batch subtitle translation", href: "/solutions/batch-subtitle-translation" },
      { label: "Subtitle localization for agencies", href: "/solutions/subtitle-localization-agencies" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  "youtube-subtitle-translator": {
    slug: "youtube-subtitle-translator",
    eyebrow: "For video creators",
    h1: "Turn one video into subtitles for more viewers.",
    intro:
      "Upload subtitles or start from audio, then localize your video with natural phrasing and channel tone.",
    badges: ["Creator workflow", "Audio transcription", "100+ languages", "SRT, VTT, ASS"],
    primaryCta: {
      label: "Localize a video",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "See pricing",
      href: "/pricing",
    },
    faqs: [
      {
        question: "Can Mitsuko translate YouTube subtitles?",
        answer: "Yes. Upload SRT, VTT, or ASS subtitles, or transcribe audio first.",
      },
      {
        question: "Can I keep my channel tone?",
        answer: "Yes. Add custom instructions for tone, terminology, and audience.",
      },
      {
        question: "How many languages are supported?",
        answer: "Mitsuko supports subtitle translation for 100+ languages.",
      },
    ],
    relatedLinks: [
      { label: "Audio to subtitles", href: "/solutions/audio-to-subtitles" },
      { label: "Batch subtitle translation", href: "/solutions/batch-subtitle-translation" },
      { label: "Subtitle localization for agencies", href: "/solutions/subtitle-localization-agencies" },
      { label: "Anime subtitle translator", href: "/solutions/anime-subtitle-translator" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
}

export const SOLUTIONS_LANDING_PAGE_SLUGS = Object.keys(SOLUTIONS_LANDING_PAGES)
