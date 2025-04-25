"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/landing/theme-toggle"
import { Button } from "../ui/button"
import { useSessionStore } from "@/stores/use-session-store"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function Navbar() {
  const session = useSessionStore((state) => state.session)

  return (
    <header
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-gray-200 dark:border-gray-800"
    >
      <div className="max-w-6xl mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link
            href="/#top"
            className="text-xl font-medium text-gray-900 dark:text-white"
          >
            Mitsuko
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/#features"
              className="text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors scroll-smooth"
            >
              Features
            </Link>
            <div className="relative group">
              <button
                className="flex items-center text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors gap-1"
              >
                Solutions
                <ChevronDown size={16} />
              </button>
              <div
                className="absolute left-0 mt-2 w-48 rounded-md bg-white dark:bg-gray-900 p-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
              >
                <Button
                  variant="ghost"
                  className="font-normal w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md"
                >
                  For Content Creators
                </Button>
                <Button
                  variant="ghost"
                  className="font-normal w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md"
                >
                  For Translators
                </Button>
                <Button
                  variant="ghost"
                  className="font-normal w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md"
                >
                  For Studios
                </Button>
                <Button
                  variant="ghost"
                  className="font-normal w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md"
                >
                  For Individuals
                </Button>
              </div>
            </div>
            <Link
              href="/pricing"
              className="text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors scroll-smooth"
            >
              Pricing
            </Link>
            <Link
              href="/#faq"
              className="text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors scroll-smooth"
            >
              FAQ
            </Link>
          </nav>
        </div>

        {/* Right Side - Theme Toggle & Auth Buttons */}
        <div className="flex items-center gap-6">
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
                <div className="absolute right-0 mt-2 w-48 p-2 bg-white dark:bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {session.user?.user_metadata?.full_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
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
    </header>
  )
}

