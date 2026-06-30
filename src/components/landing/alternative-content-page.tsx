import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "@/components/link"
import { MarkdownProse } from "@/components/markdown-prose"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import type { AlternativeLandingPage as AlternativeLandingPageData } from "@/constants/alternatives-pages"
import type { AlternativeContentMeta } from "@/lib/alternatives-content"

type AlternativeContentPageProps = {
  shell: AlternativeLandingPageData
  meta: AlternativeContentMeta
  content: string
}

export function AlternativeContentPage({ shell, meta, content }: AlternativeContentPageProps) {
  const pageUrl = `${DEPLOYMENT_URL}/alternatives/${shell.slug}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: meta.title,
        description: meta.description,
        url: pageUrl,
        dateModified: meta.updated,
        isPartOf: {
          "@type": "WebSite",
          name: "Mitsuko",
          url: DEPLOYMENT_URL,
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "Mitsuko",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: DEPLOYMENT_URL,
        description: meta.description,
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
            name: "Alternatives",
            item: `${DEPLOYMENT_URL}/alternatives`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: shell.h1,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: shell.faqs.map(faq => ({
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
      <section className="border-b border-border bg-white dark:bg-[#0f0f0f]">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-14 md:px-6 md:py-18">
          <div className="flex flex-col justify-center gap-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{shell.eyebrow}</Badge>
              {shell.badges.map(badge => (
                <Badge key={badge} variant="outline">
                  {badge}
                </Badge>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
                {shell.h1}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">{shell.intro}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full">
                <Link href={shell.primaryCta.href}>
                  {shell.primaryCta.label}
                  <ArrowRight />
                </Link>
              </Button>
              {shell.secondaryCta && (
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link href={shell.secondaryCta.href}>{shell.secondaryCta.label}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <article className="mx-auto w-full max-w-3xl px-4 py-6 text-left md:px-6 md:py-8">
        <section className="mb-10">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-sidebar-primary">Buyer-fit snapshot</div>
            <h2 className="text-2xl font-semibold tracking-tight">Quick comparison</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              A practical look at where {shell.competitorName} fits and where Mitsuko is built to go deeper.
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-lg bg-white shadow-[0_18px_55px_rgb(0_0_0/0.08)] ring-1 ring-foreground/10 dark:bg-[#111111] dark:shadow-none">
            <div className="border-b border-border bg-muted/30 px-4 py-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold">Subtitle workflow fit</p>
                <p className="text-xs text-muted-foreground">Neutral comparison, Mitsuko-specific strengths highlighted</p>
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-sm">
                <colgroup>
                  <col className="w-[23%]" />
                  <col className="w-[36%]" />
                  <col className="w-[41%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Decision point</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">{shell.competitorName}</th>
                    <th className="border-l border-primary/20 bg-primary/10 px-4 py-3 text-left text-xs font-semibold uppercase text-sidebar-primary">
                      Mitsuko
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shell.comparisonRows.map((row, index) => (
                    <tr key={row.label} className="group border-b border-border last:border-b-0">
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 font-mono text-xs text-muted-foreground">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="font-semibold">{row.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-muted-foreground group-hover:bg-muted/30">
                        {row.competitor}
                      </td>
                      <td className="border-l border-primary/20 bg-primary/5 px-4 py-4 align-top group-hover:bg-primary/10">
                        <span className="flex gap-2">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sidebar-primary" />
                          <span>{row.mitsuko}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-3 md:hidden">
              {shell.comparisonRows.map((row, index) => (
                <div key={row.label} className="rounded-lg bg-background p-3 ring-1 ring-foreground/10">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold">{row.label}</h3>
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase text-muted-foreground">{shell.competitorName}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{row.competitor}</p>
                    </div>
                    <div className="rounded-lg bg-primary/10 p-3">
                      <p className="text-xs font-medium uppercase text-sidebar-primary">Mitsuko</p>
                      <p className="mt-1 flex gap-2 text-sm leading-6">
                        <CheckCircle2 className="mt-1 size-4 shrink-0 text-sidebar-primary" />
                        <span>{row.mitsuko}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MarkdownProse content={content} />

        {shell.faqs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
            <div className="mt-4 grid gap-3">
              {shell.faqs.map(faq => (
                <div key={faq.question} className="rounded-lg p-4 ring-1 ring-foreground/10">
                  <h3 className="text-base font-semibold">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {shell.relatedLinks.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight">Related Mitsuko workflows</h2>
            <div className="mt-4 grid gap-2">
              {shell.relatedLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-muted"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <section className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-5 rounded-lg bg-gray-50/70 p-6 ring-1 ring-foreground/10 dark:bg-[#121212] md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Translate one subtitle file with context.</h2>
            <p className="mt-2 text-muted-foreground">Upload SRT, VTT, or ASS, add the rules that matter, and export a review-ready draft.</p>
          </div>
          <Button asChild size="lg" className="rounded-full">
            <Link href={shell.primaryCta.href}>
              {shell.primaryCta.label}
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  )
}
