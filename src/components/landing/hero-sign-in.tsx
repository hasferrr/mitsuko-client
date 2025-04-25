"use client"

import { useSessionStore } from "@/stores/use-session-store"
import Link from "next/link"

export default function HeroSignIn() {
  const session = useSessionStore((state) => state.session)

  return (
    <Link
      href="/auth/login"
      className="border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 text-gray-900 dark:text-white px-6 py-3 rounded-md transition-colors"
    >
      {session ? "My Account" : "Sign In"}
    </Link>
  )
}