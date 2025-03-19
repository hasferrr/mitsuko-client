import Link from "next/link"
import { Github, Twitter, DiscIcon as Discord } from "lucide-react"
import { GITHUB_LINK } from "@/constants/external-links"

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col gap-4 p-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              Documentation
            </Link>
            <Link href="#" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={GITHUB_LINK}
            className="text-muted-foreground hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sr-only">GitHub</span>
            <Github className="h-5 w-5" />
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            <span className="sr-only">Twitter</span>
            <Twitter className="h-5 w-5" />
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            <span className="sr-only">Discord</span>
            <Discord className="h-5 w-5" />
          </Link>
        </div>
      </div>
      <div className="border-t py-4">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Mitsuko. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
