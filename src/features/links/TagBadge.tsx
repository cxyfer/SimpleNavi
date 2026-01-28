import { useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface TagBadgeProps {
  name: string
  slug: string
  className?: string
}

export function TagBadge({ name, slug, className }: TagBadgeProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const isActive = searchParams.get('tag') === slug

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isActive) {
      searchParams.delete('tag')
    } else {
      searchParams.set('tag', slug)
    }
    setSearchParams(searchParams)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
        className
      )}
    >
      #{name}
    </button>
  )
}
