import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { Input } from '@/components/ui/input'
import { Container } from './Container'

interface HeaderProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-primary/60" />
          <span className="text-xl font-bold tracking-tight">SimpleNavi</span>
        </Link>
        {onSearchChange && (
          <div className="group relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 transition-colors group-focus-within:text-foreground" />
            <Input
              type="search"
              placeholder="搜尋連結..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-10 rounded-full border-border/50 bg-muted/50 pl-10 transition-all hover:bg-muted focus:bg-background"
            />
          </div>
        )}
        <ThemeToggle />
      </Container>
    </header>
  )
}
