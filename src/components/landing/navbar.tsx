"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/landing/theme-toggle"
import { useSessionStore } from "@/stores/use-session-store"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import NavLinks from "./nav-links"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const session = useSessionStore((state) => state.session)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isRoot, setIsRoot] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    setIsRoot(pathname === "/")
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 w-full flex justify-center">
      <div className="w-full lg:px-24 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="px-6 max-w-5xl mx-auto flex h-16 items-center justify-between relative">
          <div className="flex items-center gap-4 md:gap-8">
            <button
              className="md:hidden text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {isRoot ? (
              <a
                href="#"
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                mitsuko
              </a>
            ) : (
              <Link
                href="/"
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                mitsuko
              </Link>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-4 md:gap-6">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors"
            >
              {session ? (
                <div className="group relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.user_metadata?.avatar_url} />
                    <AvatarFallback>{session.user?.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="absolute right-0 mt-2 w-48 p-2 bg-background border rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[69]">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate sentry-mask">
                      {session.user?.user_metadata?.full_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate sentry-mask">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              ) : (
                "Sign In"
              )}
            </Link>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden w-full px-6 pb-4 border-t border-gray-200/30 dark:border-gray-800/30">
            <nav className="flex flex-col space-y-2 mt-2">
              <NavLinks isMobile onLinkClick={() => setIsMobileMenuOpen(false)} />
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

