import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { api } from '@/lib/api'
import { useViewMode } from '@/hooks/useViewMode'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { CategorySection } from './CategorySection'
import { LinkSkeleton } from './LinkSkeleton'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const tagFilter = searchParams.get('tag')
  const [viewMode, handleViewModeChange] = useViewMode()

  const { data, isLoading, error } = useQuery({
    queryKey: ['links'],
    queryFn: api.links.list,
  })

  const filteredLinks = useMemo(() => {
    if (!data?.links) return undefined
    let links = data.links

    if (tagFilter) {
      links = links.filter((l) => l.tags?.some((t) => t.slug === tagFilter))
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      links = links.filter(
        (link) =>
          link.title.toLowerCase().includes(query) ||
          link.description?.toLowerCase().includes(query)
      )
    }

    return links
  }, [data?.links, searchQuery, tagFilter])

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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent opacity-0 dark:opacity-100" />
      </div>

      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} viewMode={viewMode} onViewModeChange={handleViewModeChange} />

      <div className="flex">
        {data && <Sidebar categories={data.categories} className="sticky top-16 h-[calc(100vh-4rem)]" />}

        <main className="flex-1 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
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

            {isLoading && (
              <div className="space-y-16">
                {[1, 2, 3].map((i) => (
                  <section key={i}>
                    <div className="mb-8 flex items-center gap-4">
                      <div className="h-8 w-1.5 rounded-full bg-muted" />
                      <div className="h-7 w-32 animate-pulse rounded-lg bg-muted" />
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {[1, 2, 3].map((j) => (
                        <LinkSkeleton key={j} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 py-16 text-center">
                <p className="text-destructive">載入失敗，請重新整理頁面</p>
              </div>
            )}

            {data && filteredLinks && (
              <div className="space-y-16">
                {filteredLinks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 py-20 text-center backdrop-blur-sm">
                    <p className="font-mono text-muted-foreground">
                      {searchQuery ? (
                        <>找不到符合「<span className="text-primary">{searchQuery}</span>」的連結</>
                      ) : tagFilter ? (
                        <>沒有標籤為「<span className="text-primary">{tagFilter}</span>」的連結</>
                      ) : (
                        '暫無連結'
                      )}
                    </p>
                  </div>
                ) : (
                  data.categories.map((category) => (
                    <CategorySection
                      key={category.id}
                      category={category}
                      links={filteredLinks.filter((l) => l.category_id === category.id)}
                      viewMode={viewMode}
                    />
                  ))
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
