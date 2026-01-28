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
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold shrink-0">
          SimpleNavi
        </Link>
        {onSearchChange && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜尋連結..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
        <ThemeToggle />
      </Container>
    </header>
  )
}
