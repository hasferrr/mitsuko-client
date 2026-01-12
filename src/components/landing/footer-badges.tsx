import { cn } from "@/lib/utils"

interface Badge {
  href: string
  imgSrc: string
  alt: string
  className?: string
}

export default function FooterBadges({ badges }: { badges: Badge[] }) {
  return (
    <ul className="flex flex-wrap items-center md:justify-center gap-2 mt-16 mb-8">
      {badges.map((badge, index) => (
        <li key={`badge-${index}`} className={cn("w-fit text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors")}>
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
      ))}
    </ul>
  )
}
