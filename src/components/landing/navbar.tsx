"use client"

import Link from "next/link"
import { ChevronDown, Moon, Sun } from "lucide-react"
import { useEffect } from "react"
import { useThemeStore } from "@/stores/use-theme-store"

export default function Navbar() {
  const isDarkMode = useThemeStore(state => state.isDarkMode)
  const setIsDarkMode = useThemeStore(state => state.setIsDarkMode)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800"
    >
      <div className="max-w-6xl mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <span className="text-xl font-medium text-gray-900 dark:text-white">Mitsuko</span>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#"
              className="text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors"
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
                <Link
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md"
                >
                  For Content Creators
                </Link>
                <Link
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md"
                >
                  For Translators
                </Link>
                <Link
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 rounded-md"
                >
                  For Studios
                </Link>
              </div>
            </div>
            <Link
              href="#"
              className="text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors"
            >
              FAQ
            </Link>
          </nav>
        </div>

        {/* Right Side - Theme Toggle & Auth Buttons */}
        <div className="flex items-center gap-6">
          <button
            className="text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link
            href="/auth/login"
            className="text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  )
}

