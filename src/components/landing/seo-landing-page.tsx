import {
  ArrowRight,
  AudioWaveform,
  Captions,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Sparkles,
  UploadCloud,
} from "lucide-react"
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrackedLink } from "@/components/analytics/tracked-link"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import type { SeoLandingPage as SeoLandingPageData } from "@/constants/seo-pages"

type SeoLandingPageProps = {
  page: SeoLandingPageData
}

export function SeoLandingPage({ page }: SeoLandingPageProps) {
  const pageUrl = `${DEPLOYMENT_URL}/${page.slug}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Mitsuko",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: pageUrl,
        description: page.description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Mitsuko",
            item: DEPLOYMENT_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: page.h1,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  }

  return (
    <main className="w-full">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-14 md:px-6 md:py-18">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{page.eyebrow}</Badge>
              {page.badges.map((badge) => (
                <Badge key={badge} variant="outline">
                  {badge}
                </Badge>
              ))}
            </div>
            <div className="flex max-w-3xl flex-col gap-5">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
                {page.h1}
              </h1>
              <p className="text-base leading-7 text-muted-foreground md:text-lg">
                {page.intro}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-5">
                <TrackedLink
                  href={page.primaryCta.href}
                  eventName={page.primaryCta.event}
                  eventProperties={{ page: page.slug, placement: "hero_primary" }}
                >
                  {page.primaryCta.label}
                  <ArrowRight />
                </TrackedLink>
              </Button>
              {page.secondaryCta && (
                <Button asChild variant="outline" size="lg" className="rounded-full px-5">
                  <TrackedLink
                    href={page.secondaryCta.href}
                    eventName={page.secondaryCta.event}
                    eventProperties={{ page: page.slug, placement: "hero_secondary" }}
                  >
                    {page.secondaryCta.label}
                  </TrackedLink>
                </Button>
              )}
            </div>
          </div>

          <WorkflowPreview page={page} />
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 md:px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">{page.workflowTitle}</h2>
            <p className="mt-3 text-muted-foreground">{page.workflowIntro}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {page.workflow.map((item) => (
              <div key={item} className="flex min-h-28 flex-col gap-3 rounded-lg bg-card p-4 ring-1 ring-foreground/10">
                <CheckCircle2 className="size-4 text-sidebar-primary" />
                <p className="text-sm leading-6">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 md:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <ProofPanel page={page} />
        <AudiencePanel page={page} />
      </section>

      <section className="bg-muted/30">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-12 md:grid-cols-3 md:px-6">
          {page.faqs.map((faq) => (
            <Card key={faq.question} size="sm" className="shadow-xs">
              <CardHeader>
                <CardTitle>{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-5 rounded-3xl bg-gray-50/70 p-6 ring-1 ring-foreground/10 dark:bg-[#121212] md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Ready to try this workflow?</h2>
            <p className="mt-2 text-muted-foreground">{page.proofIntro}</p>
          </div>
          <Button asChild size="lg" className="rounded-full px-5">
            <TrackedLink
              href={page.primaryCta.href}
              eventName={page.primaryCta.event}
              eventProperties={{ page: page.slug, placement: "bottom_cta" }}
            >
              {page.primaryCta.label}
              <ArrowRight />
            </TrackedLink>
          </Button>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  )
}

function WorkflowPreview({ page }: { page: SeoLandingPageData }) {
  switch (page.variant) {
    case "batch":
      return <BatchPreview />
    case "agency":
      return <AgencyPreview />
    case "audio":
      return <AudioPreview />
    case "ass":
      return <AssPreview />
    case "anime":
      return <AnimePreview />
    case "creator":
      return <CreatorPreview />
  }
}

function PreviewFrame({ children, label }: { children: ReactNode, label: string }) {
  return (
    <div className="rounded-2xl bg-gray-50/70 p-4 ring-1 ring-foreground/10 dark:bg-[#121212]">
      <div className="mb-3 flex items-center justify-between">
        <Badge variant="secondary">{label}</Badge>
        <span className="text-xs text-muted-foreground">Mitsuko workflow</span>
      </div>
      {children}
    </div>
  )
}

function BatchPreview() {
  const files = ["episode-01.srt", "episode-02.srt", "special.ass"]

  return (
    <PreviewFrame label="Bulk upload">
      <div className="grid gap-3">
        <div className="rounded-xl bg-background p-3 ring-1 ring-foreground/10">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <UploadCloud className="size-4 text-sidebar-primary" />
            Drop multiple subtitle files
          </div>
          <div className="grid gap-2">
            {files.map((file) => (
              <div key={file} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  {file}
                </span>
                <Badge variant="outline">Queued</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["Build context", "One target language", "Bulk export"].map((item) => (
            <div key={item} className="rounded-lg bg-primary/10 p-3 text-sm font-medium text-sidebar-primary">
              {item}
            </div>
          ))}
        </div>
      </div>
    </PreviewFrame>
  )
}

function AgencyPreview() {
  const columns = [
    {
      label: "Client files",
      icon: FolderOpen,
      accent: "text-sidebar-primary",
      items: [
        { name: "ep-01_ja.srt", sub: "Japanese" },
        { name: "ep-02_ja.srt", sub: "Japanese" },
        { name: "movie_zh.vtt", sub: "Chinese" },
      ],
    },
    {
      label: "Translation",
      icon: Sparkles,
      accent: "text-sidebar-primary",
      items: [
        { name: "ep-01_ja.srt", sub: "Done", progress: 100 },
        { name: "ep-02_ja.srt", sub: "In progress", progress: 65 },
        { name: "movie_zh.vtt", sub: "Queued", progress: 0 },
      ],
    },
    {
      label: "Review",
      icon: ClipboardCheck,
      accent: "text-sidebar-primary",
      items: [
        { name: "ep-01_en.srt", sub: "0 issues flagged" },
      ],
    },
    {
      label: "Delivery",
      icon: CheckCircle2,
      accent: "text-sidebar-primary",
      items: [
        { name: "ep-01_en.srt", sub: "Delivered" },
      ],
    },
  ]

  return (
    <PreviewFrame label="Agency pipeline">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => {
          const Icon = col.icon
          return (
            <div key={col.label} className="flex flex-col gap-2 rounded-xl bg-background p-3 ring-1 ring-foreground/10">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon className={`size-4 ${col.accent}`} />
                {col.label}
              </div>
              <div className="flex flex-col gap-1.5">
                {col.items.map((item) => (
                  <div key={item.name} className="rounded-lg bg-muted/50 px-2.5 py-2">
                    <p className="truncate text-xs font-medium">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                    {"progress" in item && item.progress > 0 && (
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-foreground/10">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 rounded-xl bg-muted/50 p-3 text-sm leading-6 text-muted-foreground">
        Agencies use Mitsuko to translate with scene context, terminology, and project instruction guidelines before editorial review and QC.
      </div>
    </PreviewFrame>
  )
}

function AudioPreview() {
  const bars = [18, 30, 24, 42, 20, 36, 50, 28, 44, 22, 34, 48, 26, 38, 20, 32]

  return (
    <PreviewFrame label="Audio first">
      <div className="rounded-xl bg-background p-4 ring-1 ring-foreground/10">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium">
          <AudioWaveform className="size-4 text-sidebar-primary" />
          Speech to timed subtitles
        </div>
        <div className="flex h-20 items-end gap-1">
          {bars.map((height, index) => (
            <div key={`${height}-${index}`} className="w-full rounded-t bg-primary/30" style={{ height }} />
          ))}
        </div>
      </div>
      <div className="mt-3 grid gap-2">
        {[
          "00:00:14,569 --> 00:00:19,599\n寄り添う二人の物語",
          "00:00:19,889 --> 00:00:25,399\n色を付け道になり交ざり合う",
        ].map((cue) => (
          <div key={cue} className="rounded-lg bg-muted/50 px-3 py-2 font-mono text-xs">
            {cue.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        ))}
      </div>
    </PreviewFrame>
  )
}

function AssPreview() {
  return (
    <PreviewFrame label="ASS format">
      <div className="rounded-xl bg-background p-4 ring-1 ring-foreground/10">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Captions className="size-4 text-sidebar-primary" />
          Dialogue changes, structure stays
        </div>
        <div className="grid gap-2 font-mono text-xs leading-6">
          <span className="rounded-lg bg-muted/50 p-2">Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text</span>
          <span className="rounded-lg bg-muted/50 p-2">
            Dialogue: 0,0:03:18.56,0:03:21.43,Signs,sign,0000,0000,0000,,
            {"{\\c&H8A9B96&\\b1\\fs14\\pos(317,51)\\bord2\\3c&HECF4F1&}"}
            98th Annual Graduation Ceremony
          </span>
          <span className="rounded-lg bg-primary/10 p-2 text-sidebar-primary">
            Dialogue: 0,0:03:18.56,0:03:21.43,Signs,sign,0000,0000,0000,,
            {"{\\c&H8A9B96&\\b1\\fs14\\pos(317,51)\\bord2\\3c&HECF4F1&}"}
            Upacara Kelulusan Tahun ke-98
          </span>
        </div>
      </div>
    </PreviewFrame>
  )
}

function AnimePreview() {
  return (
    <PreviewFrame label="Character context">
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["Rintaro Tsumugi", "A tall, blond-haired high school student whose intimidating appearance causes others to misjudge him as a scary delinquent. - Tends to be self-deprecating and quick to blame himself. - Dorms a connection with Kaoruko."],
          ["Kaoruko Waguri", "A small-statured high school girl who is a frequent and enthusiastic customer at Patiseri Plain. - Polite and direct, not easily intimidated. - A student at Kikyo Academy who defends Rintaro's character and is not afraid of his appearance."],
          ["Rintaro's Mother", "The cheerful and supportive owner of Patiseri Plain. - Encouraging and positive. - Rintaro's mother."],
          ["Glossary: Patiseri Plain", "The pastry shop owned and operated by Rintaro's family, where he occasionally works and first properly meets Kaoruko."],
        ].map(([name, tone]) => (
          <div key={name} className="rounded-xl bg-background p-3 ring-1 ring-foreground/10">
            <div className="text-sm font-semibold">{name}</div>
            <p className="mt-2 text-xs text-muted-foreground">{tone}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-primary/10 p-3 text-sm leading-6 text-sidebar-primary">
        Translate the line with scene context, relationship, and recurring terms.
      </div>
    </PreviewFrame>
  )
}

function CreatorPreview() {
  return (
    <PreviewFrame label="Creator localization">
      <div className="rounded-xl bg-background p-3 ring-1 ring-foreground/10">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-linear-to-b from-sky-3 to-sky-6 dark:from-sky-8 dark:to-sky-10">
          <div className="relative flex h-full flex-col justify-end p-3">
            <svg className="absolute inset-0 size-full" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" fill="none">
              <rect x="0" y="0" width="160" height="90" className="fill-foreground/5" />
              <circle cx="80" cy="36" r="14" className="fill-foreground/10 stroke-foreground/15 stroke-1" />
              <polygon points="75,30 75,42 86,36" className="fill-foreground/25" />
              <rect x="4" y="70" width="152" height="16" rx="3" className="fill-foreground/8" />
              <rect x="8" y="75" width="30" height="4" rx="1" className="fill-foreground/15" />
              <rect x="44" y="75" width="20" height="4" rx="1" className="fill-foreground/12" />
              <rect x="130" y="75" width="18" height="4" rx="1" className="fill-foreground/12" />
              <rect x="0" y="0" width="160" height="4" className="fill-foreground/6" />
              <circle cx="10" cy="8" r="2" className="fill-foreground/12" />
              <circle cx="18" cy="8" r="2" className="fill-foreground/12" />
              <circle cx="26" cy="8" r="2" className="fill-foreground/12" />
            </svg>
            <div className="relative flex flex-col items-center gap-1 pb-1">
              <div className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">本当にそう思う？</div>
              <div className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white">Do you really think so?</div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["English SRT", "Indonesian VTT", "Spanish SRT", "Japanese SRT"].map((item) => (
            <Badge key={item} variant="outline">{item}</Badge>
          ))}
        </div>
      </div>
    </PreviewFrame>
  )
}

function ProofPanel({ page }: { page: SeoLandingPageData }) {
  const example = page.proofExamples[0]

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{page.proofTitle}</CardTitle>
        <CardDescription>{page.proofIntro}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-lg bg-background p-3 ring-1 ring-foreground/10">
          <div className="text-xs font-medium text-muted-foreground">{example.sourceLabel}</div>
          {example.context ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{example.context}</p> : null}
          <p className="mt-1 leading-6">{example.source}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="text-xs font-medium text-muted-foreground">{example.genericLabel}</div>
          <p className="mt-1 leading-6">{example.generic}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <div className="text-xs font-medium text-sidebar-primary">{example.mitsukoLabel}</div>
          <p className="mt-1 leading-6">{example.mitsuko}</p>
        </div>
        <p className="text-sm text-muted-foreground">{example.note}</p>
      </CardContent>
    </Card>
  )
}

function AudiencePanel({ page }: { page: SeoLandingPageData }) {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>{page.audienceTitle}</CardTitle>
        <CardDescription>Use this page when the workflow matches the job.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-3">
          {page.audience.map((item) => (
            <div key={item} className="flex gap-3 text-sm leading-6">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sidebar-primary" />
              <p>{item}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-2 border-t border-border pt-4">
          {page.relatedLinks.slice(0, 3).map((link) => (
            <TrackedLink
              key={link.href}
              href={link.href}
              eventName="seo_related_link_clicked"
              eventProperties={{ page: page.slug, href: link.href }}
              className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-muted"
            >
              <span>{link.label}</span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </TrackedLink>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
