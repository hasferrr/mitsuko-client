"use client"

import Link from "next/link"
import { DISCORD_LINK } from "@/constants/external-links"

interface NavLinksProps {
  isMobile: boolean
  setOpen?: (open: boolean) => void
}

export const NavLinks = ({ isMobile, setOpen }: NavLinksProps) => {
  const closeSheet = () => {
    if (isMobile && setOpen) {
      setOpen(false)
    }
  }

  return (
    <>
      <Link
        href="#"
        className="transition-colors hover:text-foreground/80 text-foreground/60"
        onClick={closeSheet}
      >
        About
      </Link>
      <Link
        href={DISCORD_LINK}
        className="transition-colors hover:text-foreground/80 text-foreground/60"
        target="_blank"
        rel="noopener noreferrer"
        onClick={closeSheet}
      >
        Discord
      </Link>
      <Link
        href="/"
        className="transition-colors hover:text-foreground/80 text-foreground/60"
        onClick={closeSheet}
      >
        Translation
      </Link>
      <Link
        href="/extract-context"
        className="transition-colors hover:text-foreground/80 text-foreground/60"
        onClick={closeSheet}
      >
        Extract Context
      </Link>
    </>
  )
}
