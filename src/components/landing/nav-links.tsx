"use client"

import Link from "@/components/link"
import { useState } from "react"
import {
  AudioWaveform,
  BookOpen,
  Building2,
  Captions,
  ChevronDown,
  ChevronUp,
  FileStack,
  Languages,
  Layers,
  Video,
} from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { TrackedLink } from "@/components/analytics/tracked-link"

interface NavLinksProps {
  isMobile?: boolean
  onLinkClick?: () => void
}

const navLinkClass = "block text-foreground hover:text-muted-foreground transition-colors py-2"

const audienceItems = [
  {
    label: "Localization agencies",
    href: "/subtitle-localization-agencies",
    icon: Building2,
    description: "Batch drafts, context extraction, and human review workflows",
  },
  {
    label: "Anime and drama teams",
    href: "/anime-subtitle-translator",
    icon: Captions,
    description: "Translate tone, idioms, honorifics, and recurring voices",
  },
  {
    label: "Video creators",
    href: "/youtube-subtitle-translator",
    icon: Video,
    description: "Localize subtitles for international viewers",
  },
  {
    label: "Translators and editors",
    href: "/ass-subtitle-translator",
    icon: Languages,
    description: "Create review-ready drafts while preserving subtitle structure",
  },
]

const workflowItems = [
  {
    label: "ASS subtitle translation",
    href: "/ass-subtitle-translator",
    icon: FileStack,
    description: "Keep timing and style structure in the workflow",
  },
  {
    label: "Batch subtitle projects",
    href: "/batch-subtitle-translation",
    icon: Layers,
    description: "Translate multiple files with shared settings",
  },
  {
    label: "Audio to subtitles",
    href: "/audio-to-subtitles",
    icon: AudioWaveform,
    description: "Transcribe audio into timed subtitles",
  },
]

const resourceItem = {
  label: "Fansubbing workflow guide",
  href: "/blog/the-art-of-fansubbing-behind-the-scenes-of-anime-subtitles",
  icon: BookOpen,
  description: "Learn the roles, review steps, and craft behind anime subtitles",
}

const allSolutionItems = [
  ...(() => {
    const result = []
    const set = new Set()
    for (const item of [...audienceItems, ...workflowItems]) {
      if (set.has(item.href)) continue
      set.add(item.href)
      result.push(item)
    }
    return result
  })(),
  resourceItem,
]

export default function NavLinks({ isMobile = false, onLinkClick }: NavLinksProps) {
  if (isMobile) {
    return <MobileNavLinks onLinkClick={onLinkClick} />
  }

  return <DesktopNavLinks />
}

function DesktopNavLinks() {
  return (
    <NavigationMenu viewport={false} delayDuration={0}>
      <NavigationMenuList className="gap-8">
        <NavigationMenuItem>
          <Link href="/#features" className={navLinkClass}>
            Features
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-auto rounded-none bg-transparent px-0 py-2 text-base font-normal hover:bg-transparent hover:text-muted-foreground data-open:bg-transparent data-open:hover:bg-transparent data-open:hover:text-muted-foreground data-open:focus:bg-transparent data-popup-open:bg-transparent data-popup-open:hover:bg-transparent data-popup-open:hover:text-muted-foreground data-popup-open:focus:bg-transparent [&_svg]:size-4">
            Solutions
          </NavigationMenuTrigger>
          <NavigationMenuContent className="left-1/2 w-[min(calc(100vw-2rem),760px)] -translate-x-1/2 p-2 md:w-[760px]">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-lg bg-muted/30 p-2">
                <div className="px-2 py-1.5 text-[10px] font-medium uppercase text-muted-foreground">
                  Mitsuko for
                </div>
                <div className="grid gap-1">
                  {audienceItems.map((item) => (
                    <SolutionNavigationLink key={item.href} item={item} group="audience" />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div>
                  <div className="px-2 py-1.5 text-[10px] font-medium uppercase text-muted-foreground">
                    Workflows
                  </div>
                  <div className="grid gap-1">
                    {workflowItems.map((item) => (
                      <SolutionNavigationLink key={item.href} item={item} group="workflow" compact />
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-card p-2 ring-1 ring-foreground/10">
                  <div className="px-2 py-1.5 text-[10px] font-medium uppercase text-muted-foreground">
                    Resource
                  </div>
                  <SolutionNavigationLink item={resourceItem} group="resource" compact />
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/pricing" className={navLinkClass}>
            Pricing
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/#faq" className={navLinkClass}>
            FAQ
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/blog" className={navLinkClass}>
            Blog
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function MobileNavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false)

  return (
    <>
      <Link href="/#features" className={navLinkClass} onClick={onLinkClick}>
        Features
      </Link>

      <div className="py-2">
        <button
          onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
          className="flex w-full items-center justify-between text-left text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
        >
          Solutions
          {isSolutionsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isSolutionsOpen && (
          <div className="mt-3 flex flex-col gap-2">
            {allSolutionItems.map((item) => {
              const Icon = item.icon
              return (
                <TrackedLink
                  href={item.href}
                  key={item.href}
                  onClick={onLinkClick}
                  eventName="solutions_nav_clicked"
                  eventProperties={{ href: item.href, label: item.label, layout: "mobile" }}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{item.label}</span>
                    <span className="block text-xs leading-5 text-muted-foreground">{item.description}</span>
                  </span>
                </TrackedLink>
              )
            })}
          </div>
        )}
      </div>

      <Link href="/pricing" className={navLinkClass} onClick={onLinkClick}>
        Pricing
      </Link>
      <Link href="/#faq" className={navLinkClass} onClick={onLinkClick}>
        FAQ
      </Link>
      <Link href="/blog" className={navLinkClass} onClick={onLinkClick}>
        Blog
      </Link>
    </>
  )
}

function SolutionNavigationLink({
  item,
  group,
  compact,
}: {
  item: typeof audienceItems[number]
  group: "audience" | "workflow" | "resource"
  compact?: boolean
}) {
  const Icon = item.icon

  return (
    <NavigationMenuLink asChild>
      <TrackedLink
        href={item.href}
        eventName="solutions_nav_clicked"
        eventProperties={{ href: item.href, label: item.label, group, layout: "desktop" }}
        className="items-start"
      >
        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0">
          <span className="block font-medium text-foreground">{item.label}</span>
          <span className={compact ? "mt-0.5 block text-xs leading-5 text-muted-foreground" : "mt-1 block text-xs leading-5 text-muted-foreground"}>
            {item.description}
          </span>
        </span>
      </TrackedLink>
    </NavigationMenuLink>
  )
}
