import type { Category, Link, ViewMode } from '@/lib/types'
import { LinkCard } from './LinkCard'
import { cn } from '@/lib/utils'

interface CategorySectionProps {
  category: Category
  links: Link[]
  viewMode: ViewMode
}

export function CategorySection({ category, links, viewMode }: CategorySectionProps) {
  if (links.length === 0) return null

  const isGrid = viewMode === 'grid'

  return (
    <section className="scroll-mt-24">
      <div className="mb-8 flex items-center gap-4">
        {/* Neon accent bar */}
        <div className="relative h-8 w-1.5 rounded-full bg-gradient-to-b from-primary via-accent to-primary">
          <div className="absolute inset-0 rounded-full bg-primary blur-sm" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{category.name}</h2>
        {/* Decorative line with gradient */}
        <div className="relative h-px flex-1">
          <div className="absolute inset-0 bg-gradient-to-r from-border via-primary/30 to-transparent" />
          <div className="absolute left-0 top-0 h-px w-24 bg-gradient-to-r from-primary/60 to-transparent" />
        </div>
        {/* Link count badge */}
        <span className="rounded-md border border-border/60 bg-muted/50 px-2.5 py-1 font-mono text-xs text-muted-foreground">
          {links.length}
        </span>
      </div>
      <div className={cn(
        isGrid ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3"
      )}>
        {links.map((link) => (
          <LinkCard key={link.id} link={link} viewMode={viewMode} />
        ))}
      </div>
    </section>
  )
}
