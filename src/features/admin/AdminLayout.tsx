import { useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LayoutGrid, Link2, BarChart3, LogOut, Tag } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/Container'
import { ThemeToggle } from '@/features/theme/ThemeToggle'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/admin/links', label: '連結', icon: Link2 },
  { path: '/admin/categories', label: '分類', icon: LayoutGrid },
  { path: '/admin/tags', label: '標籤', icon: Tag },
  { path: '/admin/stats', label: '統計', icon: BarChart3 },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['auth'],
    queryFn: api.auth.me,
    retry: false,
  })

  const logout = useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      queryClient.clear()
      navigate('/admin')
    },
  })

  useEffect(() => {
    if (!isLoading && (error || !data?.authenticated)) {
      navigate('/admin')
    }
  }, [isLoading, error, data, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!data?.authenticated) return null

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <Container className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold">
              SimpleNavi
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link key={path} to={path}>
                  <Button
                    variant={location.pathname === path ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(location.pathname === path && 'bg-secondary')}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => logout.mutate()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </Container>
      </header>
      <main className="py-8">
        <Container>
          <Outlet />
        </Container>
      </main>
    </div>
  )
}
