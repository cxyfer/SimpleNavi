import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Zap, LayoutGrid, List } from 'lucide-react'
import { api } from '@/lib/api'
import type { ViewMode } from '@/lib/types'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { Input } from '@/components/ui/input'
import { Container } from './Container'
import { cn } from '@/lib/utils'

interface HeaderProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function Header({ searchQuery, onSearchChange, viewMode, onViewModeChange }: HeaderProps) {
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: api.settings.get,
  })

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      {/* Top accent line */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <Container className="flex h-16 items-center justify-between gap-6">
        <Link to="/" className="group flex items-center gap-3 shrink-0">
          {/* Logo with neon effect */}
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent transition-all duration-300 group-hover:shadow-[0_0_20px_-3px] group-hover:shadow-primary/50">
            <Zap className="h-5 w-5 text-primary-foreground" />
            <div className="absolute inset-0 rounded-lg bg-primary/20 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <span className="text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
            {settings?.siteName || 'SimpleNavi'}
          </span>
        </Link>

        {onSearchChange && (
          <div className="group relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors duration-300 group-focus-within:text-primary" />
            <Input
              type="search"
              placeholder="搜尋連結..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-11 rounded-xl border-border/50 bg-muted/40 pl-11 pr-4 font-mono text-sm transition-all duration-300 placeholder:text-muted-foreground/50 hover:border-border hover:bg-muted/60 focus:border-primary/50 focus:bg-background focus:shadow-[0_0_20px_-5px] focus:shadow-primary/20"
            />
            {/* Focus glow effect */}
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 opacity-0 blur-sm transition-opacity duration-300 group-focus-within:opacity-100" />
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border-r border-border/40 pr-2 mr-2">
            <button
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={cn(
                "p-2 rounded-md transition-all hover:bg-accent",
                viewMode === 'grid' ? "text-primary bg-accent/50" : "text-muted-foreground"
              )}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={cn(
                "p-2 rounded-md transition-all hover:bg-accent",
                viewMode === 'list' ? "text-primary bg-accent/50" : "text-muted-foreground"
              )}
            >
              <List size={18} />
            </button>
          </div>
          <ThemeToggle />
        </div>
      </Container>
    </header>
  )
}
