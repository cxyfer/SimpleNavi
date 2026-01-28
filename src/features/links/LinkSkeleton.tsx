import { Skeleton } from '@/components/ui/skeleton'

export function LinkSkeleton() {
  return (
    <div className="flex items-start gap-5 rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur-md">
      <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-3 pt-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}
