"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Loader2, CircleDollarSign, AlertCircle } from "lucide-react"
import { useThemeStore } from "@/stores/ui/use-theme-store"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { useProjectStore } from "@/stores/data/use-project-store"
import { useSessionStore } from "@/stores/ui/use-session-store"
import { useQuery } from "@tanstack/react-query"
import { fetchUserCreditData } from "@/lib/api/user-credit"
import { UserCreditData } from "@/types/user"
import { cn } from "@/lib/utils"
import { FeedbackWrapper } from "@/components/feedback/feedback-wrapper"
import { ProcessingPopover } from "@/components/layout/processing-popover"

interface Breadcrumb {
  name: string
  link: string
}

export function Navbar() {
  const session = useSessionStore(state => state.session)
  const { data: user, isLoading, isFetching, isError } = useQuery<UserCreditData>({
    queryKey: ["user", session?.user?.id],
    queryFn: fetchUserCreditData,
    enabled: !!session?.user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const isDarkMode = useThemeStore(state => state.isDarkMode)
  const setIsDarkMode = useThemeStore(state => state.setIsDarkMode)
  const currentProject = useProjectStore(state => state.currentProject)

  const breadcrumbs: Breadcrumb[] = [
    { name: "Dashboard", link: "/dashboard" },
    ...(currentProject ? [{ name: currentProject.name, link: currentProject.isBatch ? "/batch" : "/project" }] : []),
  ]

  const handleToggle = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 pr-8">
      <div className="flex h-14 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 data-vertical:self-center" />
        </div>
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.flatMap((breadcrumb, index) => [
              index > 0 && <BreadcrumbSeparator key={`sep-${index}`} />,
              <BreadcrumbItem key={index}>
                <Link href={breadcrumb.link}>
                  <BreadcrumbPage className="line-clamp-1 hover:underline">
                    {breadcrumb.name}
                  </BreadcrumbPage>
                </Link>
              </BreadcrumbItem>,
            ])}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2 ml-auto">
          <FeedbackWrapper>
            <Button variant="outline" size="sm">
              Feedback
            </Button>
          </FeedbackWrapper>

          <ProcessingPopover />

          <Button variant="ghost" size="sm" className="text-sm" asChild>
            <Link
              href="/auth/login"
              className="flex gap-2"
            >
              {isFetching || isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-muted-foreground">Loading credits...</span>
                </>
              ) : isError ? (
                <>
                  <AlertCircle className="size-4 text-destructive" />
                  <span className="text-destructive">Error</span>
                </>
              ) : user ? (
                <>
                  <CircleDollarSign className="size-4" />
                  <span className={cn(user.credit < 0 && "text-destructive")}>
                    {Math.round(user.credit).toLocaleString()} credits
                  </span>
                </>
              ) : (
                "Sign In"
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="transition-none"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
