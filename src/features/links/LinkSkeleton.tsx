import { Skeleton } from '@/components/ui/skeleton'

export function LinkSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border/50 p-5">
      <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2.5 pt-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}
