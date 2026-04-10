import { Skeleton } from "@/components/ui/skeleton"

export const ProjectItemSkeleton = () => (
  <div className="border border-border rounded-lg p-3 bg-background">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-3">
        <Skeleton className="size-5 rounded" />
        <Skeleton className="bg-secondary p-2 rounded-lg">
          <div className="size-5 rounded" />
        </Skeleton>
        <div className="space-y-1">
          <Skeleton className="h-[14px] w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="hidden sm:block h-3 w-16" />
        <Skeleton className="size-4 sm:mx-1 rounded" />
        <Skeleton className="size-4 sm:mx-1 rounded" />
        <Skeleton className="size-4 sm:mx-1 rounded" />
      </div>
    </div>
  </div>
)
