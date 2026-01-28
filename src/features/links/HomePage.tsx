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
    <div className="min-h-screen">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="py-8">
        <Container>
          {isLoading && (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <section key={i}>
                  <div className="mb-4 h-6 w-20 animate-pulse rounded bg-muted" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((j) => (
                      <LinkSkeleton key={j} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center text-destructive">
              載入失敗，請重新整理頁面
            </div>
          )}

          {data && filteredLinks && (
            <div className="space-y-8">
              {filteredLinks.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
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
