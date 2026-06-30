export type AlternativeFaq = {
  question: string
  answer: string
}

export type AlternativeComparisonRow = {
  label: string
  competitor: string
  mitsuko: string
}

export type AlternativeLandingPage = {
  slug: string
  competitorName: string
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
  comparisonRows: AlternativeComparisonRow[]
  faqs: AlternativeFaq[]
  relatedLinks: {
    label: string
    href: string
  }[]
}

const sharedMitsukoPosition =
  "Context-aware subtitle translation for SRT, VTT, and ASS files with project instructions, batch workflows, and transcription when you need it."

export const ALTERNATIVES_LANDING_PAGES: Record<string, AlternativeLandingPage> = {
  "gpt-subtitler-alternative": {
    slug: "gpt-subtitler-alternative",
    competitorName: "GPT Subtitler",
    eyebrow: "GPT Subtitler alternative",
    h1: "A GPT Subtitler alternative for context-aware subtitle translation.",
    intro:
      "Use Mitsuko when the job is not just translating lines, but preserving names, tone, terminology, and subtitle structure across SRT, VTT, and ASS files.",
    badges: ["SRT, VTT, ASS", "Context instructions", "Batch translation", "Audio transcription"],
    primaryCta: {
      label: "Try Mitsuko",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "See batch workflow",
      href: "/solutions/batch-subtitle-translation",
    },
    comparisonRows: [
      {
        label: "Best fit",
        competitor: "AI subtitle translation and transcription workflows.",
        mitsuko: sharedMitsukoPosition,
      },
      {
        label: "Subtitle formats",
        competitor: "Subtitle-file workflows for common formats.",
        mitsuko: "SRT, VTT, and ASS workflows with format-aware import and export.",
      },
      {
        label: "Context control",
        competitor: "Useful when you want a GPT-style translation flow.",
        mitsuko: "Add project context, tone rules, recurring names, glossary notes, and custom instructions.",
      },
      {
        label: "Batch translation",
        competitor: "Good for individual subtitle jobs.",
        mitsuko: "Translate multiple subtitle files at once with shared context, language settings, and instructions.",
      },
    ],
    faqs: [
      {
        question: "What is the best GPT Subtitler alternative for subtitle translation?",
        answer:
          "Mitsuko is a strong fit when you need context-aware SRT, VTT, and ASS translation with project instructions and batch consistency.",
      },
      {
        question: "Can Mitsuko replace a GPT-style subtitle translation workflow?",
        answer:
          "Yes, if your main workflow is uploading subtitles, adding context, translating, reviewing, and exporting files for delivery.",
      },
      {
        question: "Does Mitsuko support transcription too?",
        answer:
          "Yes. Mitsuko includes audio transcription workflows when you need to create timed subtitles before translation.",
      },
    ],
    relatedLinks: [
      { label: "Batch subtitle translation", href: "/solutions/batch-subtitle-translation" },
      { label: "ASS subtitle translator", href: "/solutions/ass-subtitle-translator" },
      { label: "Audio to subtitles", href: "/solutions/audio-to-subtitles" },
    ],
  },
  "maestra-alternative": {
    slug: "maestra-alternative",
    competitorName: "Maestra",
    eyebrow: "Maestra alternative",
    h1: "A Maestra alternative for SRT, VTT, and ASS subtitle translation.",
    intro:
      "Choose Mitsuko when you want a focused subtitle localization workflow that keeps translation context, terminology, and file structure close to the editor.",
    badges: ["Subtitle localization", "Context documents", "Review-ready drafts", "100+ languages"],
    primaryCta: {
      label: "Translate subtitles",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "For agencies",
      href: "/solutions/subtitle-localization-agencies",
    },
    comparisonRows: [
      {
        label: "Best fit",
        competitor: "Media transcription, subtitles, translation, and dubbing workflows.",
        mitsuko: sharedMitsukoPosition,
      },
      {
        label: "Subtitle focus",
        competitor: "Broad media localization platform.",
        mitsuko: "Focused subtitle translation and transcription workflows for teams that already work with subtitle files.",
      },
      {
        label: "Editorial control",
        competitor: "Useful for broad content localization operations.",
        mitsuko: "Built around project context, custom instructions, and review-ready subtitle drafts.",
      },
      {
        label: "Agency work",
        competitor: "Good when teams need a full media platform.",
        mitsuko: "Good when agencies need consistent subtitle drafts across client files and batches.",
      },
    ],
    faqs: [
      {
        question: "What is the best Maestra alternative for subtitle translation?",
        answer:
          "Mitsuko is a focused option for teams that care most about SRT, VTT, and ASS subtitle translation with context and terminology control.",
      },
      {
        question: "Is Mitsuko a full dubbing platform like Maestra?",
        answer:
          "Mitsuko focuses on subtitle translation, transcription, and localization workflows rather than trying to be a broad video dubbing suite.",
      },
      {
        question: "Can agencies use Mitsuko for client subtitle work?",
        answer:
          "Yes. Mitsuko supports batch projects, shared context, custom instructions, and review workflows for agency-style subtitle localization.",
      },
    ],
    relatedLinks: [
      { label: "Subtitle localization for agencies", href: "/solutions/subtitle-localization-agencies" },
      { label: "Batch subtitle translation", href: "/solutions/batch-subtitle-translation" },
      { label: "YouTube subtitle translator", href: "/solutions/youtube-subtitle-translator" },
    ],
  },
  "veed-alternative": {
    slug: "veed-alternative",
    competitorName: "VEED.io",
    eyebrow: "VEED.io alternative",
    h1: "A VEED.io alternative for subtitle translation workflows.",
    intro:
      "Mitsuko is for creators and localization teams who already have subtitle files, or need to create them, and want cleaner translation control than a general video editor workflow.",
    badges: ["Creator localization", "Subtitle files", "Project context", "Batch export"],
    primaryCta: {
      label: "Localize a video",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "Creator workflow",
      href: "/solutions/youtube-subtitle-translator",
    },
    comparisonRows: [
      {
        label: "Best fit",
        competitor: "Online video editing, subtitles, translation, and creator workflows.",
        mitsuko: sharedMitsukoPosition,
      },
      {
        label: "Workflow style",
        competitor: "Video-first editing and publishing workflow.",
        mitsuko: "Subtitle-file-first workflow for teams that review, translate, and export subtitles.",
      },
      {
        label: "Context control",
        competitor: "Good for fast creator edits.",
        mitsuko: "Better fit when names, terms, tone, and repeated phrases need explicit instructions.",
      },
      {
        label: "Batch work",
        competitor: "Useful for individual videos inside an editor.",
        mitsuko: "Designed for many subtitle files that share language settings and project context.",
      },
    ],
    faqs: [
      {
        question: "What is the best VEED.io alternative for subtitle translation?",
        answer:
          "Mitsuko is a strong alternative when you want a subtitle localization workspace instead of a general video editor.",
      },
      {
        question: "Should I use Mitsuko or VEED.io for YouTube subtitles?",
        answer:
          "Use Mitsuko when your priority is translating SRT, VTT, or ASS subtitles with context and exporting files for upload or review.",
      },
      {
        question: "Can Mitsuko translate subtitles for many videos?",
        answer:
          "Yes. Batch projects let you translate multiple subtitle files with shared target language, model, context, and instructions.",
      },
    ],
    relatedLinks: [
      { label: "YouTube subtitle translator", href: "/solutions/youtube-subtitle-translator" },
      { label: "Batch subtitle translation", href: "/solutions/batch-subtitle-translation" },
      { label: "Audio to subtitles", href: "/solutions/audio-to-subtitles" },
    ],
  },
  "kapwing-alternative": {
    slug: "kapwing-alternative",
    competitorName: "Kapwing",
    eyebrow: "Kapwing alternative",
    h1: "A Kapwing alternative for AI subtitle translation.",
    intro:
      "Mitsuko gives subtitle-heavy teams a focused place to translate, review, and export SRT, VTT, and ASS files with project-level context.",
    badges: ["AI subtitle translation", "SRT and VTT", "ASS workflows", "Custom instructions"],
    primaryCta: {
      label: "Translate a subtitle file",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "See subtitle workflows",
      href: "/solutions/ass-subtitle-translator",
    },
    comparisonRows: [
      {
        label: "Best fit",
        competitor: "Online video editing with subtitle translation features.",
        mitsuko: sharedMitsukoPosition,
      },
      {
        label: "Workflow style",
        competitor: "Video editor workspace with creator tools.",
        mitsuko: "Subtitle translation workspace for file-based review and localization.",
      },
      {
        label: "Subtitle structure",
        competitor: "Good for quick video subtitle jobs.",
        mitsuko: "Keeps subtitle files central, including SRT, VTT, and ASS workflows.",
      },
      {
        label: "Consistency",
        competitor: "Useful for standalone videos.",
        mitsuko: "Useful when a course, playlist, series, or client batch needs consistent terminology.",
      },
    ],
    faqs: [
      {
        question: "What is the best Kapwing alternative for subtitle translation?",
        answer:
          "Mitsuko is a focused alternative for translating subtitle files with context, custom instructions, and batch workflows.",
      },
      {
        question: "Can Mitsuko translate SRT and VTT files?",
        answer: "Yes. Mitsuko supports SRT, VTT, and ASS subtitle translation workflows.",
      },
      {
        question: "Can Mitsuko help with subtitle consistency across many videos?",
        answer:
          "Yes. Use batch projects and shared context to keep recurring terms and names consistent across multiple files.",
      },
    ],
    relatedLinks: [
      { label: "ASS subtitle translator", href: "/solutions/ass-subtitle-translator" },
      { label: "Batch subtitle translation", href: "/solutions/batch-subtitle-translation" },
      { label: "Anime subtitle translator", href: "/solutions/anime-subtitle-translator" },
    ],
  },
  "happy-scribe-alternative": {
    slug: "happy-scribe-alternative",
    competitorName: "Happy Scribe",
    eyebrow: "Happy Scribe alternative",
    h1: "A Happy Scribe alternative for subtitle translation and localization.",
    intro:
      "Mitsuko helps teams move from transcript or subtitle file to translated subtitle draft with project context, custom instructions, and batch control.",
    badges: ["Transcription", "Subtitle translation", "Localization review", "SRT, VTT, ASS"],
    primaryCta: {
      label: "Start translating",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "Audio to subtitles",
      href: "/solutions/audio-to-subtitles",
    },
    comparisonRows: [
      {
        label: "Best fit",
        competitor: "Transcription, subtitles, and translation workflows.",
        mitsuko: sharedMitsukoPosition,
      },
      {
        label: "Workflow style",
        competitor: "Strong fit when transcription is the center of the job.",
        mitsuko: "Strong fit when subtitle translation quality, context, and file export are the center of the job.",
      },
      {
        label: "Translation control",
        competitor: "Good for transcript and subtitle production.",
        mitsuko: "Add project context, names, tone rules, and terminology before translation.",
      },
      {
        label: "Batch projects",
        competitor: "Useful for individual media files and subtitle tasks.",
        mitsuko: "Useful for recurring subtitle projects with shared rules across files.",
      },
    ],
    faqs: [
      {
        question: "What is the best Happy Scribe alternative for subtitle translation?",
        answer:
          "Mitsuko is a focused alternative when you need context-aware subtitle translation for SRT, VTT, and ASS files.",
      },
      {
        question: "Can Mitsuko transcribe audio before translating subtitles?",
        answer:
          "Yes. Mitsuko can create timed subtitles from audio, then translate them inside the same localization workflow.",
      },
      {
        question: "Does Mitsuko support human review?",
        answer:
          "Mitsuko creates review-ready subtitle drafts. Your team can then review, edit, and export the final subtitle files.",
      },
    ],
    relatedLinks: [
      { label: "Audio to subtitles", href: "/solutions/audio-to-subtitles" },
      { label: "Subtitle localization for agencies", href: "/solutions/subtitle-localization-agencies" },
      { label: "Batch subtitle translation", href: "/solutions/batch-subtitle-translation" },
    ],
  },
}

export const ALTERNATIVES_PAGE_SLUGS = Object.keys(ALTERNATIVES_LANDING_PAGES)
