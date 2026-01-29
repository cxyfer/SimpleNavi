import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from './ThemeProvider'
import { useToast } from '@/components/ui/use-toast'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const next = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const idx = order.indexOf(theme)
    const newTheme = order[(idx + 1) % order.length]
    setTheme(newTheme)

    const themeNames = {
      light: '明亮模式',
      dark: '黑暗模式',
      system: '跟隨系統'
    }
    toast({ title: `已切換到${themeNames[newTheme]}` })
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
