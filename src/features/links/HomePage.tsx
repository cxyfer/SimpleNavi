import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Header } from '@/components/layout/Header'
import { Container } from '@/components/layout/Container'
import { CategorySection } from './CategorySection'
import { LinkSkeleton } from './LinkSkeleton'

export default function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['links'],
    queryFn: api.links.list,
  })

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <Container>
          {isLoading && (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <section key={i}>
                  <div className="mb-4 h-6 w-20 animate-pulse rounded bg-muted" />
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

          {data && (
            <div className="space-y-8">
              {data.categories.map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  links={data.links.filter((l) => l.category_id === category.id)}
                />
              ))}
            </div>
          )}
        </Container>
      </main>
    </div>
  )
}
