"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface Badge {
  href: string
  imgSrc: string
  alt: string
  className?: string
}

function BadgeItem({ badge }: { badge: Badge }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const probe = new Image()
    probe.onload = () => setVisible(true)
    probe.onerror = () => setVisible(false)
    probe.src = badge.imgSrc
  }, [badge.imgSrc])

  if (!visible) return null

  return (
    <li className="w-fit text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
      <a href={badge.href} target="_blank" rel="noopener">
        <img
          src={badge.imgSrc}
          alt={badge.alt}
          width="auto"
          height="auto"
          className={cn("h-[35px] md:h-[38px] object-contain", badge.className)}
        />
      </a>
    </li>
  )
}

export default function FooterBadges({ badges }: { badges: Badge[] }) {
  return (
    <ul className="flex flex-wrap items-center md:justify-center gap-2 mt-16 mb-8">
      {badges.map((badge, index) => (
        <BadgeItem key={`badge-${index}`} badge={badge} />
      ))}
    </ul>
  )
}
