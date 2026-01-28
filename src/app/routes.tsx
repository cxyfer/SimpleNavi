import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('@/features/links/HomePage'))
const LoginPage = lazy(() => import('@/features/admin/LoginPage'))
const AdminLayout = lazy(() => import('@/features/admin/AdminLayout'))
const LinksPage = lazy(() => import('@/features/admin/LinksPage'))
const CategoriesPage = lazy(() => import('@/features/admin/CategoriesPage'))
const StatsPage = lazy(() => import('@/features/admin/StatsPage'))

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )
}

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  { path: '/', element: withSuspense(HomePage) },
  { path: '/admin', element: withSuspense(LoginPage) },
  {
    path: '/admin',
    element: withSuspense(AdminLayout),
    children: [
      { path: 'links', element: withSuspense(LinksPage) },
      { path: 'categories', element: withSuspense(CategoriesPage) },
      { path: 'stats', element: withSuspense(StatsPage) },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
