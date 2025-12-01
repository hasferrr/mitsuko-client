"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "../ui/button"

interface NavLinksProps {
  isMobile?: boolean
  onLinkClick?: () => void
}

const solutionItems = [
  "For Creators",
  "For Translators",
  "For Studios",
  "For Subbers",
  "For Individuals",
]

export default function NavLinks({
  isMobile = false,
  onLinkClick,
}: NavLinksProps) {
  const [isMobileSolutionsOpen, setIsMobileSolutionsOpen] = useState(false)

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick()
    }
  }

  const handleSolutionsToggle = () => {
    setIsMobileSolutionsOpen(!isMobileSolutionsOpen)
  }

  return (
    <>
      <Link
        href="/#features"
        className="block text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors scroll-smooth py-2"
        onClick={handleLinkClick}
      >
        Features
      </Link>
      {isMobile ? (
        <>
          <button
            onClick={handleSolutionsToggle}
            className="flex items-center justify-between text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors py-2 w-full text-left"
          >
            Solutions
            {isMobileSolutionsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {isMobileSolutionsOpen && (
            <div className="flex flex-col space-y-1">
              {solutionItems.map((item, index) => (
                <Button
                  key={`mobile-solution-${index}`}
                  variant="ghost"
                  className="font-normal w-full justify-start text-left block px-4 text-sm rounded-md"
                >
                  {item}
                </Button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="relative group">
          <button
            className="flex items-center text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors gap-1 py-2"
          >
            Solutions
            <ChevronDown size={16} />
          </button>
          <div
            className="absolute left-1/2 transform -translate-x-1/2 mt-0 w-48 rounded-md bg-background p-2 border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
          >
            {solutionItems.map((item, index) => (
              <Button
                key={`nav-solution-${index}`}
                variant="ghost"
                className="font-normal w-full text-left block px-4 py-2 text-sm rounded-md"
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      )}
      <Link
        href="/pricing"
        className="block text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors scroll-smooth py-2"
        onClick={handleLinkClick}
      >
        Pricing
      </Link>
      <Link
        href="/#faq"
        className="block text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors scroll-smooth py-2"
        onClick={handleLinkClick}
      >
        FAQ
      </Link>
      <Link
        href="/blog"
        className="block text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors scroll-smooth py-2"
        onClick={handleLinkClick}
      >
        Blog
      </Link>
    </>
  )
}
