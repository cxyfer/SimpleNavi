import { useMemo } from 'react'
import { useParams, useSearchParams, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { api } from '@/lib/api'
import { useViewMode } from '@/hooks/useViewMode'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { LinkCard } from './LinkCard'
import { LinkSkeleton } from './LinkSkeleton'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string | undefined
  const [searchParams, setSearchParams] = useSearchParams()
  const tagFilter = searchParams.get('tag')
  const [viewMode, handleViewModeChange] = useViewMode()

  const { data, isLoading, error } = useQuery({
    queryKey: ['links'],
    queryFn: api.links.list,
  })

  const category = useMemo(() => {
    return data?.categories.find((c) => c.slug === slug)
  }, [data?.categories, slug])

  const filteredLinks = useMemo(() => {
    if (!data?.links || !category) return []
    let links = data.links.filter((l) => l.category_id === category.id)
    if (tagFilter) {
      links = links.filter((l) => l.tags?.some((t) => t.slug === tagFilter))
    }
    return links
  }, [data?.links, category, tagFilter])

  if (!isLoading && data && !category) {
    return <Navigate to="/" replace />
  }

  const clearTagFilter = () => {
    searchParams.delete('tag')
    setSearchParams(searchParams)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 cyber-grid opacity-30 dark:opacity-20" />
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <Header viewMode={viewMode} onViewModeChange={handleViewModeChange} />

      <div className="flex">
        {data && <Sidebar categories={data.categories} className="sticky top-16 h-[calc(100vh-4rem)]" />}

        <main className="flex-1 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {isLoading && (
              <div>
                <div className="mb-8 flex items-center gap-4">
                  <div className="h-8 w-1.5 rounded-full bg-muted" />
                  <div className="h-7 w-32 animate-pulse rounded-lg bg-muted" />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3].map((j) => (
                    <LinkSkeleton key={j} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 py-16 text-center">
                <p className="text-destructive">載入失敗，請重新整理頁面</p>
              </div>
            )}

            {data && category && (
              <div>
                <div className="mb-8 flex items-center gap-4">
                  <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-primary to-accent" />
                  <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                </div>

                {tagFilter && (
                  <div className="mb-6 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">篩選標籤：</span>
                    <button
                      onClick={clearTagFilter}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
                    >
                      #{tagFilter}
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {filteredLinks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-20 text-center backdrop-blur-sm">
                    <p className="font-mono text-muted-foreground">
                      {tagFilter ? `此分類中沒有標籤為「${tagFilter}」的連結` : '此分類暫無連結'}
                    </p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3"}>
                    {filteredLinks.map((link) => (
                      <LinkCard key={link.id} link={link} viewMode={viewMode} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  )
}
