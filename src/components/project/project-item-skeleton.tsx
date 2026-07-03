import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export const ProjectItemSkeleton = () => (
  <Card size="sm" className="p-3">
    <div className="flex items-center gap-2 sm:gap-3">
      <Skeleton className="size-4 rounded shrink-0" />
      <Skeleton className="bg-secondary p-2 rounded-lg shrink-0">
        <div className="size-5 rounded" />
      </Skeleton>
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-[14px] w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="hidden sm:block h-3 w-12 shrink-0" />
      <div className="flex items-center gap-0.5 shrink-0">
        <Skeleton className="size-5 rounded" />
        <Skeleton className="size-5 rounded" />
        <Skeleton className="size-5 rounded" />
      </div>
    </div>
  </Card>
)
