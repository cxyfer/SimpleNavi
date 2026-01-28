import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Home, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types'

const SIDEBAR_KEY = 'sidebar-collapsed'

interface SidebarProps {
  categories: Category[]
  className?: string
}

export function Sidebar({ categories, className }: SidebarProps) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    const isMobile = window.innerWidth < 768
    if (isMobile) return true
    return localStorage.getItem(SIDEBAR_KEY) === 'true'
  })

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed))
  }, [collapsed])

  const currentSlug = location.pathname === '/' ? null : location.pathname.slice(1).split('?')[0]

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border/40 bg-background/50 backdrop-blur-sm transition-all duration-300',
        collapsed ? 'w-14' : 'w-56',
        className
      )}
    >
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          <Link
            to="/"
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              currentSlug === null
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            )}
          >
            <Home className="h-4 w-4 shrink-0" />
            {!collapsed && <span>全部</span>}
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/${category.slug}`}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                currentSlug === category.slug
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              )}
            >
              <Folder className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{category.name}</span>}
            </Link>
          ))}
        </nav>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
        aria-label={collapsed ? '展開側邊欄' : '收起側邊欄'}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  )
}
