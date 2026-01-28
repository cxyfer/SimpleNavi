import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Header } from '@/components/layout/Header'
import { Container } from '@/components/layout/Container'
import { CategorySection } from './CategorySection'
import { LinkSkeleton } from './LinkSkeleton'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading, error } = useQuery({
    queryKey: ['links'],
    queryFn: api.links.list,
  })

  const filteredLinks = useMemo(() => {
    if (!data?.links || !searchQuery.trim()) return data?.links
    const query = searchQuery.toLowerCase()
    return data.links.filter(
      (link) =>
        link.title.toLowerCase().includes(query) ||
        link.description?.toLowerCase().includes(query)
    )
  }, [data?.links, searchQuery])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="py-10 md:py-12">
        <Container>
          {isLoading && (
            <div className="space-y-12">
              {[1, 2, 3].map((i) => (
                <section key={i}>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-7 w-1 rounded-full bg-muted" />
                    <div className="h-6 w-24 animate-pulse rounded-lg bg-muted" />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((j) => (
                      <LinkSkeleton key={j} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 py-12 text-center text-destructive">
              載入失敗，請重新整理頁面
            </div>
          )}

          {data && filteredLinks && (
            <div className="space-y-12">
              {filteredLinks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/30 py-16 text-center text-muted-foreground">
                  找不到符合「{searchQuery}」的連結
                </div>
              ) : (
                data.categories.map((category) => (
                  <CategorySection
                    key={category.id}
                    category={category}
                    links={filteredLinks.filter((l) => l.category_id === category.id)}
                  />
                ))
              )}
            </div>
          )}
        </Container>
      </main>
    </div>
  )
}
