import { Skeleton } from '@/components/ui/skeleton'

export function LinkSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  )
}
