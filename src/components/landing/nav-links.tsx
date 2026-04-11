"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronUp, Video, Languages, Building2, Captions, User } from "lucide-react"

interface NavLinksProps {
  isMobile?: boolean
  onLinkClick?: () => void
}

const navLinkClass = "block text-foreground hover:text-muted-foreground transition-colors py-2"

const solutionItems = [
  {
    label: "Creators",
    href: "/blog/introducing-mitsuko-blog",
    icon: Video,
    description: "Expand your content globally",
  },
  {
    label: "Translators",
    href: "/blog/introducing-mitsuko-blog",
    icon: Languages,
    description: "Boost translation productivity",
  },
  {
    label: "Studios",
    href: "/blog/introducing-mitsuko-blog",
    icon: Building2,
    description: "Streamline localization workflow",
  },
  {
    label: "Subbers",
    href: "/blog/introducing-mitsuko-blog",
    icon: Captions,
    description: "Create subtitles faster",
  },
  {
    label: "Personal Use",
    href: "/blog/introducing-mitsuko-blog",
    icon: User,
    description: "Translate for your own needs",
  },
]

export default function NavLinks({ isMobile = false, onLinkClick }: NavLinksProps) {
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isSolutionsOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSolutionsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isSolutionsOpen])

  return (
    <>
      <Link href="/#features" className={navLinkClass} onClick={onLinkClick}>
        Features
      </Link>

      <div ref={dropdownRef}>
        {isMobile ? (
          <MobileSolutionsDropdown
            isOpen={isSolutionsOpen}
            onToggle={() => setIsSolutionsOpen(!isSolutionsOpen)}
            onLinkClick={() => {
              setIsSolutionsOpen(false)
              onLinkClick?.()
            }}
          />
        ) : (
          <DesktopSolutionsDropdown
            isOpen={isSolutionsOpen}
            onToggle={() => setIsSolutionsOpen(!isSolutionsOpen)}
            onLinkClick={() => {
              setIsSolutionsOpen(false)
              onLinkClick?.()
            }}
          />
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

function MobileSolutionsDropdown({
  isOpen,
  onToggle,
  onLinkClick,
}: {
  isOpen: boolean
  onToggle: () => void
  onLinkClick?: () => void
}) {
  return (
    <div className="py-2">
      <button
        onClick={onToggle}
        className="flex items-center justify-between text-foreground hover:text-muted-foreground transition-colors w-full text-left"
      >
        Solutions
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="mt-3 ml-2 flex flex-col gap-1">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2">
            Mitsuko for
          </span>
          {solutionItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                href={item.href}
                key={item.label}
                onClick={onLinkClick}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Icon size={18} className="text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DesktopSolutionsDropdown({
  isOpen,
  onToggle,
  onLinkClick,
}: {
  isOpen: boolean
  onToggle: () => void
  onLinkClick?: () => void
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center text-foreground hover:text-muted-foreground transition-colors gap-1 py-2"
      >
        Solutions
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
          <div className="w-64 rounded-xl bg-background border shadow-lg p-2">
            <div className="px-2 py-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Mitsuko for
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              {solutionItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    onClick={onLinkClick}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Icon size={18} className="text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
