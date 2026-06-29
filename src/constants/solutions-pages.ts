export type SolutionsProofExample = {
  contextLabel?: string
  context?: string
  sourceLabel: string
  source: string
  genericLabel: string
  generic: string
  mitsukoLabel: string
  mitsuko: string
  note: string
}

export type SolutionsFaq = {
  question: string
  answer: string
}

export type SolutionsLandingVariant = "anime" | "ass" | "batch" | "agency" | "audio" | "creator"

export type SolutionsLandingPage = {
  slug: string
  variant: SolutionsLandingVariant
  title: string
  description: string
  keywords: string[]
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
  proofTitle: string
  proofIntro: string
  proofExamples: SolutionsProofExample[]
  workflowTitle: string
  workflowIntro: string
  workflow: string[]
  audienceTitle: string
  audience: string[]
  faqs: SolutionsFaq[]
  relatedLinks: {
    label: string
    href: string
  }[]
}

const animeProofExamples: SolutionsProofExample[] = [
  {
    contextLabel: "Scene context",
    context: "A first-year student just knocked over the club room supplies while their strict senior is about to walk in.",
    sourceLabel: "Japanese sample line",
    source: "やばっ、また先輩にバレたら怒られるじゃん...",
    genericLabel: "Literal machine translation",
    generic: "Bad, if it is found out by senior again, I will be scolded, right...",
    mitsukoLabel: "Context-aware subtitle",
    mitsuko: "Oh no... if Senpai sees this, I'm dead.",
    note: "Uses the scene to turn バレたら and 怒られる into a natural subtitle threat instead of translating word by word.",
  },
  {
    sourceLabel: "Korean sample line",
    source: "진짜 눈치 없네.",
    genericLabel: "Literal machine translation",
    generic: "You really have no sense.",
    mitsukoLabel: "Context-aware subtitle",
    mitsuko: "You really can't read the room.",
    note: "Translates the social meaning instead of the surface wording.",
  },
]

const formatProofExamples: SolutionsProofExample[] = [
  {
    sourceLabel: "ASS dialogue sample",
    source: "{\\an8}Don't move! That sign is the clue.",
    genericLabel: "Generic output",
    generic: "Jangan bergerak! Tanda itu adalah petunjuk.",
    mitsukoLabel: "Subtitle-localized output",
    mitsuko: "{\\an8}Jangan bergerak! Papan itu petunjuknya.",
    note: "Focuses translation on dialogue text while keeping inline ASS override tags in place.",
  },
  {
    sourceLabel: "English sample line",
    source: "Let's keep this between us.",
    genericLabel: "Literal Indonesian",
    generic: "Mari kita simpan ini di antara kita.",
    mitsukoLabel: "Natural Indonesian subtitle",
    mitsuko: "Ini rahasia kita, ya.",
    note: "Adapts the phrase for natural subtitle reading instead of mirroring English structure.",
  },
]

const agencyProofExamples: SolutionsProofExample[] = [
  {
    contextLabel: "Project terminology",
    context: "User glossary: 도련님 = Mr. Park, 한강그룹 = Han River Holdings. The speaker is a secretary addressing the heir of a family-owned company.",
    sourceLabel: "Korean drama sample line",
    source: "도련님, 한강그룹 사람들이 벌써 로비에 와 있습니다.",
    genericLabel: "Literal machine translation",
    generic: "Young master, Hangang Group people already to the lobby have come.",
    mitsukoLabel: "Context-aware translation",
    mitsuko: "Mr. Park, the Han River Holdings representatives are already waiting in the lobby.",
    note: "Follows the user's glossary and role context instead of translating the Korean address and company name literally.",
  },
  {
    sourceLabel: "Review workflow sample",
    source: "Previously on episode seven, Rina broke the promise.",
    genericLabel: "Single-file translation",
    generic: "Sebelumnya di episode tujuh, Rina melanggar janji.",
    mitsukoLabel: "Series-aware subtitle",
    mitsuko: "Di episode tujuh sebelumnya, Rina mengingkari janjinya.",
    note: "Uses episode context and agency instructions before the file reaches editorial review.",
  },
]

const creatorProofExamples: SolutionsProofExample[] = [
  {
    sourceLabel: "English creator sample",
    source: "Here's the mistake that ruined my first export.",
    genericLabel: "Literal Indonesian",
    generic: "Ini adalah kesalahan yang merusak ekspor pertama saya.",
    mitsukoLabel: "Natural Indonesian subtitle",
    mitsuko: "Ini kesalahan yang bikin ekspor pertamaku gagal total.",
    note: "Keeps creator voice conversational instead of sounding like a manual.",
  },
  {
    sourceLabel: "English creator sample",
    source: "Stick around, because the last step saves the most time.",
    genericLabel: "Literal Indonesian",
    generic: "Tetaplah di sekitar, karena langkah terakhir menghemat waktu paling banyak.",
    mitsukoLabel: "Natural Indonesian subtitle",
    mitsuko: "Tonton sampai akhir, karena langkah terakhir paling menghemat waktu.",
    note: "Adapts the call-to-action to wording viewers expect in subtitles.",
  },
]

const batchProofExamples: SolutionsProofExample[] = [
  {
    sourceLabel: "Series batch sample",
    source: "Episode 03: The Council calls the artifact the Moon Key again.",
    genericLabel: "One-file translation risk",
    generic: "Dewan menyebut artefak itu Kunci Rembulan lagi.",
    mitsukoLabel: "Context-guided batch draft",
    mitsuko: "Dewan menyebut artefak itu Kunci Bulan lagi.",
    note: "Keeps recurring terms stable across files when the project context says which name to use.",
  },
  {
    sourceLabel: "Course subtitle sample",
    source: "Drag the clip into the timeline, then export the captions.",
    genericLabel: "Literal draft risk",
    generic: "Seret klip ke garis waktu, lalu ekspor keterangan.",
    mitsukoLabel: "Workflow-aware subtitle",
    mitsuko: "Seret klip ke timeline, lalu ekspor caption-nya.",
    note: "Lets teams keep product and workflow terminology consistent across lessons or modules.",
  },
]

const audioProofExamples: SolutionsProofExample[] = [
  {
    sourceLabel: "Spoken creator sample",
    source: "Okay, so we're gonna export this and fix the timing later.",
    genericLabel: "Raw transcript style",
    generic: "Okay so we are going to export this and fix the timing later",
    mitsukoLabel: "Subtitle-ready text",
    mitsuko: "Okay, we'll export this and fix the timing later.",
    note: "Turns speech into cleaner subtitle text that is easier to review before translation.",
  },
  {
    sourceLabel: "Spoken lesson sample",
    source: "This formula matters because it tells us when the reaction slows down.",
    genericLabel: "Unpolished transcript",
    generic: "This formula matters because it tells us when reaction slows down",
    mitsukoLabel: "Timed subtitle draft",
    mitsuko: "This formula matters because it tells us when the reaction slows down.",
    note: "Adds readable punctuation and phrasing for timed captions and subtitles.",
  },
]

export const SOLUTIONS_LANDING_PAGES: Record<string, SolutionsLandingPage> = {
  "anime-subtitle-translator": {
    slug: "anime-subtitle-translator",
    variant: "anime",
    title: "Anime Subtitle Translator - Context-Aware AI Subtitle Localization | Mitsuko",
    description: "Translate anime and drama subtitles with scene context, character tone, idioms, honorifics, and series consistency. Mitsuko supports SRT, VTT, and ASS workflows.",
    keywords: [
      "anime subtitle translator",
      "drama subtitle translator",
      "AI anime subtitle translation",
      "context aware subtitle translation",
      "Japanese subtitle translator",
    ],
    eyebrow: "Anime and drama localization",
    h1: "Translate anime subtitles without flattening the character voice.",
    intro: "Give Mitsuko the subtitle file, scene context, names, and tone rules. It drafts lines that respect relationships, jokes, honorifics, and recurring terms.",
    badges: ["SRT, VTT, ASS", "Character tone", "Idioms and nuance", "100+ languages"],
    primaryCta: {
      label: "Translate subtitles",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "Read the fansubbing guide",
      href: "/blog/the-art-of-fansubbing-behind-the-scenes-of-anime-subtitles",
    },
    proofTitle: "Literal subtitles miss the relationship",
    proofIntro: "The draft should carry who is speaking, who they are speaking to, and how the scene feels.",
    proofExamples: animeProofExamples,
    workflowTitle: "Anime localization flow",
    workflowIntro: "Built for legal, owned, licensed, or authorized anime and drama subtitle work.",
    workflow: [
      "Upload the episode subtitle file.",
      "Add character, honorific, and term rules.",
      "Review the localized draft before export.",
    ],
    audienceTitle: "Use it for",
    audience: [
      "Anime and drama localization teams.",
      "Subtitle editors handling character-heavy dialogue.",
      "Creators localizing original animation.",
    ],
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
        answer: "Yes. Add custom instructions for speech style, honorifics, recurring terms, and relationship context.",
      },
    ],
    relatedLinks: [
      { label: "ASS subtitle translator", href: "/solutions/ass-subtitle-translator" },
      { label: "Batch subtitle translation", href: "/solutions/batch-subtitle-translation" },
      { label: "Subtitle localization for agencies", href: "/solutions/subtitle-localization-agencies" },
      { label: "Fansubbing workflow guide", href: "/blog/the-art-of-fansubbing-behind-the-scenes-of-anime-subtitles" },
    ],
  },
  "ass-subtitle-translator": {
    slug: "ass-subtitle-translator",
    variant: "ass",
    title: "ASS Subtitle Translator - Preserve Timing, Style, and Context | Mitsuko",
    description: "Translate ASS subtitle files with context-aware AI while keeping subtitle timing and style structure ready for review and export.",
    keywords: [
      "ASS subtitle translator",
      "translate ASS subtitles",
      "AI ASS subtitle translation",
      "preserve ASS subtitle styling",
      "subtitle style translation",
    ],
    eyebrow: "ASS subtitle workflow",
    h1: "Translate ASS subtitles without rebuilding the file.",
    intro: "Upload ASS subtitles, translate the dialogue, and keep timing, styles, and inline override tags in the review workflow.",
    badges: ["ASS support", "Timing preserved", "Inline tags", "Review-ready output"],
    primaryCta: {
      label: "Translate ASS subtitles",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "Compare anime workflows",
      href: "/solutions/anime-subtitle-translator",
    },
    proofTitle: "Keep the format work you already did",
    proofIntro: "ASS files carry positioning, style names, and override tags that should not be flattened into plain text.",
    proofExamples: formatProofExamples,
    workflowTitle: "ASS translation flow",
    workflowIntro: "For editors who need translated dialogue inside a subtitle file workflow.",
    workflow: [
      "Upload the ASS file.",
      "Translate dialogue with context and instructions.",
      "Export for timing, styling, and QC review.",
    ],
    audienceTitle: "Use it for",
    audience: [
      "Subtitle editors working with ASS files.",
      "Anime and drama projects with styling.",
      "Translators who need an editable first draft.",
    ],
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
    variant: "batch",
    title: "Batch Subtitle Translation - Translate Multiple SRT, VTT, and ASS Files | Mitsuko",
    description: "Translate multiple subtitle files with shared context, consistent terminology, custom instructions, and review-ready exports for series, courses, and agency projects.",
    keywords: [
      "batch subtitle translation",
      "batch subtitle translator",
      "translate multiple subtitle files",
      "batch SRT translator",
      "subtitle project workflow",
    ],
    eyebrow: "Batch subtitle projects",
    h1: "Upload subtitle files in bulk and translate them right away.",
    intro: "Drop multiple SRT, VTT, or ASS files into one batch project, choose the target language, reuse the same instructions, and export the translated files after review.",
    badges: ["Batch files", "Shared settings", "Context documents", "SRT, VTT, ASS"],
    primaryCta: {
      label: "Start a batch project",
      href: "/batch",
    },
    secondaryCta: {
      label: "For agencies",
      href: "/solutions/subtitle-localization-agencies",
    },
    proofTitle: "One queue, one set of rules",
    proofIntro: "Batch translation keeps files moving without setting up every subtitle one by one.",
    proofExamples: batchProofExamples,
    workflowTitle: "Bulk subtitle flow",
    workflowIntro: "Built for projects where many subtitle files share the same language, context, and delivery rules.",
    workflow: [
      "Upload multiple subtitles at once.",
      "Apply shared language and instruction settings.",
      "Review and export translated files in bulk.",
    ],
    audienceTitle: "Use it for",
    audience: [
      "Episodes, courses, playlists, and recurring client work.",
      "Teams that want one setup for many files.",
      "Agencies producing review-ready subtitle drafts.",
    ],
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
    variant: "agency",
    title: "Subtitle Localization Workflow for Agencies | Mitsuko",
    description: "Context-aware subtitle translation, custom instructions, batch processing, and review workflows for localization agencies and subtitle teams.",
    keywords: [
      "subtitle localization agency workflow",
      "AI subtitle localization",
      "subtitle translation workflow",
      "batch subtitle translation",
      "localization agency tools",
    ],
    eyebrow: "For localization agencies",
    h1: "Translate agency subtitle projects with context and instructions.",
    intro: "Mitsuko translates subtitle files with scene context, project terminology, and custom instructions. Agency teams can move from client files to editorial review with subtitles that already understand tone, names, and localization rules.",
    badges: ["Batch translation", "Context extraction", "Custom instructions", "SRT, VTT, ASS"],
    primaryCta: {
      label: "Contact us",
      href: "mailto:support@mitsuko.app?subject=Subtitle%20localization%20workflow",
    },
    secondaryCta: {
      label: "Try Mitsuko",
      href: "/dashboard",
    },
    proofTitle: "Translate with agency context",
    proofIntro: "Mitsuko reads file context and follows your instructions for names, terms, tone, and client rules before your team reviews the result.",
    proofExamples: agencyProofExamples,
    workflowTitle: "Agency localization flow",
    workflowIntro: "A context-aware translation workflow for subtitle teams, vendors, and small localization agencies.",
    workflow: [
      "Import client subtitle files and project context.",
      "Translate with instructions for terms, tone, and style.",
      "Review, QC, and deliver final subtitles.",
    ],
    audienceTitle: "Use it for",
    audience: [
      "Small and mid-sized localization agencies.",
      "Subtitle vendors handling recurring files.",
      "Translator teams that need consistent context-aware translation before QC.",
    ],
    faqs: [
      {
        question: "Does Mitsuko replace translators?",
        answer: "No. Mitsuko translates subtitles with context and instructions, while your team keeps final review and QC.",
      },
      {
        question: "Can agencies batch files?",
        answer: "Yes. Batch projects support multiple subtitle translations at once with shared context, saves a lot of time.",
      },
      {
        question: "Can we control terminology?",
        answer: "Yes. Add custom instructions for names, terms, tone, formatting preferences, and client rules.",
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
    variant: "audio",
    title: "Audio to Subtitles - Transcribe Audio into Timed Subtitle Files | Mitsuko",
    description: "Transcribe audio into timed subtitles, review the result, and localize it into 100+ languages with Mitsuko's context-aware subtitle workflow.",
    keywords: [
      "audio to subtitles",
      "transcribe audio to subtitles",
      "audio to SRT",
      "AI subtitle transcription",
      "video audio subtitles",
    ],
    eyebrow: "Audio to subtitles",
    h1: "Start from audio when no subtitle file exists.",
    intro: "Transcribe speech into timed subtitle text, review the captions, then translate them into other languages inside Mitsuko.",
    badges: ["Audio transcription", "Timed subtitles", "Review workflow", "100+ languages"],
    primaryCta: {
      label: "Transcribe audio",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "Creator workflow",
      href: "/solutions/youtube-subtitle-translator",
    },
    proofTitle: "A transcript is not enough",
    proofIntro: "Subtitle work needs readable lines, timestamps, and review before translation.",
    proofExamples: audioProofExamples,
    workflowTitle: "Audio-first subtitle flow",
    workflowIntro: "For videos, lessons, interviews, and recordings that do not already have subtitles.",
    workflow: [
      "Upload single or multiple audio.",
      "Review timed subtitle text result.",
      "Translate or export the subtitle file.",
    ],
    audienceTitle: "Use it for",
    audience: [
      "Creators starting from raw video.",
      "Course teams that need captions first.",
      "Agencies receiving media without subtitle files.",
    ],
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
    variant: "creator",
    title: "YouTube Subtitle Translator - Localize Videos into 100+ Languages | Mitsuko",
    description: "Turn YouTube subtitles or audio into natural localized subtitles for international viewers with context-aware AI, transcription, and subtitle export.",
    keywords: [
      "YouTube subtitle translator",
      "translate YouTube subtitles",
      "video subtitle translator",
      "creator localization",
      "AI subtitle localization",
    ],
    eyebrow: "For video creators",
    h1: "Turn one video into subtitles for more viewers.",
    intro: "Upload subtitles or start from audio, then localize your video with natural phrasing, channel tone, and export-ready subtitle files.",
    badges: ["Creator workflow", "Audio transcription", "100+ languages", "SRT, VTT, ASS"],
    primaryCta: {
      label: "Localize a video",
      href: "/dashboard",
    },
    secondaryCta: {
      label: "See pricing",
      href: "/pricing",
    },
    proofTitle: "Keep the creator voice",
    proofIntro: "Creator subtitles should sound like the channel, not like a translated manual.",
    proofExamples: creatorProofExamples,
    workflowTitle: "Creator localization flow",
    workflowIntro: "For videos that need natural subtitles in another language.",
    workflow: [
      "Upload subtitles or transcribe audio.",
      "Translate with channel tone instructions.",
      "Export subtitles for publishing.",
    ],
    audienceTitle: "Use it for",
    audience: [
      "YouTubers growing international audiences.",
      "Educators and course creators.",
      "Creators who want subtitle control instead of full automation.",
    ],
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
