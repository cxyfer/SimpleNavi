import type { Category, Link } from '@/lib/types'
import { LinkCard } from './LinkCard'

interface CategorySectionProps {
  category: Category
  links: Link[]
}

export function CategorySection({ category, links }: CategorySectionProps) {
  if (links.length === 0) return null

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">{category.name}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </section>
  )
}
