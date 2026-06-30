import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "@/components/link"
import { MarkdownProse } from "@/components/markdown-prose"
import { DEPLOYMENT_URL } from "@/constants/external-links"
import type { SolutionsLandingPage as SolutionsLandingPageData } from "@/constants/solutions-pages"
import type { SolutionContentMeta } from "@/lib/solutions-content"

type SolutionsContentPageProps = {
  shell: SolutionsLandingPageData
  meta: SolutionContentMeta
  content: string
}

export function SolutionsContentPage({ shell, meta, content }: SolutionsContentPageProps) {
  const pageUrl = `${DEPLOYMENT_URL}/solutions/${shell.slug}`
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Mitsuko",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: pageUrl,
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
      <section className="mx-auto w-full max-w-3xl px-4 pt-14 pb-6 md:px-6 md:pt-18">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{shell.eyebrow}</Badge>
            {shell.badges.map(badge => (
              <Badge key={badge} variant="outline">
                {badge}
              </Badge>
            ))}
          </div>
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
              {shell.h1}
            </h1>
            <p className="text-base leading-7 text-muted-foreground md:text-lg">{shell.intro}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full px-5">
              <Link href={shell.primaryCta.href}>
                {shell.primaryCta.label}
                <ArrowRight />
              </Link>
            </Button>
            {shell.secondaryCta && (
              <Button asChild variant="outline" size="lg" className="rounded-full px-5">
                <Link href={shell.secondaryCta.href}>{shell.secondaryCta.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <article className="mx-auto w-full max-w-3xl px-4 py-6 text-left md:px-6 md:py-8">
        <MarkdownProse content={content} />

        {shell.faqs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight">Frequently asked questions</h2>
            <div className="mt-4 grid gap-3">
              {shell.faqs.map(faq => (
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
          </div>
        )}

        {shell.relatedLinks.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold tracking-tight">Related workflows</h2>
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
        <div className="flex flex-col gap-5 rounded-3xl bg-gray-50/70 p-6 ring-1 ring-foreground/10 dark:bg-[#121212] md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Ready to try this workflow?</h2>
            <p className="mt-2 text-muted-foreground">{shell.intro}</p>
          </div>
          <Button asChild size="lg" className="rounded-full px-5">
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
