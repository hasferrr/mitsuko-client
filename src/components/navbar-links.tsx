"use client"

import Link from "next/link"
import { CHANGE_LOG_LINK, DISCORD_LINK } from "@/constants/external-links"

export const NavbarLinks = () => {
  return (
    <>
      <Link
        href={DISCORD_LINK}
        className="transition-colors hover:text-foreground/80 text-foreground/60 dark:text-foreground/80"
        target="_blank"
        rel="noopener noreferrer"
      >
        Discord
      </Link>
      <Link
        href={CHANGE_LOG_LINK}
        className="transition-colors hover:text-foreground/80 text-foreground/60 dark:text-foreground/80"
        target="_blank"
        rel="noopener noreferrer"
      >
        Changelog
      </Link>
    </>
  )
}
