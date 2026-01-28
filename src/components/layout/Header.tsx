import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { Container } from './Container'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-14 items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          SimpleNavi
        </Link>
        <ThemeToggle />
      </Container>
    </header>
  )
}
