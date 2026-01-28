import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const next = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const idx = order.indexOf(theme)
    setTheme(order[(idx + 1) % order.length])
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={next}
      aria-label="Toggle theme"
      className="relative h-10 w-10 rounded-xl transition-all duration-300 hover:bg-muted hover:shadow-[0_0_15px_-3px] hover:shadow-primary/30"
    >
      {theme === 'light' && <Sun className="h-5 w-5 text-amber-500" />}
      {theme === 'dark' && <Moon className="h-5 w-5 text-primary" />}
      {theme === 'system' && <Monitor className="h-5 w-5 text-muted-foreground" />}
    </Button>
  )
}
