import type { Category, Link } from '@/lib/types'
import { LinkCard } from './LinkCard'

interface CategorySectionProps {
  category: Category
  links: Link[]
}

export function CategorySection({ category, links }: CategorySectionProps) {
  if (links.length === 0) return null

  return (
    <section className="scroll-mt-24">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-7 w-1 rounded-full bg-primary" />
        <h2 className="text-xl font-bold tracking-tight">{category.name}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </section>
  )
}
