import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Reorder } from 'framer-motion'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import { api } from '@/lib/api'
import type { Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function CategoriesPage() {
  const [editing, setEditing] = useState<Category | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [orderedCategories, setOrderedCategories] = useState<Category[]>([])
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: api.admin.categories.list,
  })

  const displayCategories = orderedCategories.length > 0 ? orderedCategories : (categories || [])

  const createMutation = useMutation({
    mutationFn: api.admin.categories.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      setEditing(null)
      setIsNew(false)
      setOrderedCategories([])
      toast({ title: '分類已新增' })
    },
    onError: (err: Error) => toast({ title: '新增失敗', description: err.message, variant: 'destructive' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) => api.admin.categories.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      setEditing(null)
      setOrderedCategories([])
      toast({ title: '分類已更新' })
    },
    onError: (err: Error) => toast({ title: '更新失敗', description: err.message, variant: 'destructive' }),
  })

  const deleteMutation = useMutation({
    mutationFn: api.admin.categories.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      setOrderedCategories([])
      toast({ title: '分類已刪除' })
    },
    onError: (err: Error) => toast({ title: '刪除失敗', description: err.message, variant: 'destructive' }),
  })

  const reorderMutation = useMutation({
    mutationFn: api.admin.categories.reorder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      setOrderedCategories([])
      toast({ title: '排序已更新' })
    },
    onError: (err: Error) => toast({ title: '排序失敗', description: err.message, variant: 'destructive' }),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const data = {
      name: form.get('name') as string,
      slug: form.get('slug') as string,
      sort_order: Number(form.get('sort_order')) || 0,
    }

    if (isNew) {
      createMutation.mutate(data)
    } else if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    }
  }

  const handleReorder = (newOrder: Category[]) => {
    setOrderedCategories(newOrder)
  }

  const handleSaveOrder = () => {
    if (orderedCategories.length > 0) {
      reorderMutation.mutate(orderedCategories.map(c => c.id))
    }
  }

  const hasOrderChanged = orderedCategories.length > 0 &&
    JSON.stringify(orderedCategories.map(c => c.id)) !== JSON.stringify(categories?.map(c => c.id))

  if (isLoading) return <div>載入中...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">分類管理</h1>
        <div className="flex gap-2">
          {hasOrderChanged && (
            <Button onClick={handleSaveOrder} disabled={reorderMutation.isPending}>
              儲存排序
            </Button>
          )}
          <Button onClick={() => { setIsNew(true); setEditing({} as Category) }}>
            <Plus className="h-4 w-4 mr-1" /> 新增分類
          </Button>
        </div>
      </div>

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>{isNew ? '新增分類' : '編輯分類'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">名稱</Label>
                  <Input id="name" name="name" defaultValue={editing.name} required maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={editing.slug}
                    required
                    maxLength={50}
                    pattern="^[a-z0-9-]+$"
                    title="只能使用小寫字母、數字和連字號"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">排序</Label>
                  <Input id="sort_order" name="sort_order" type="number" defaultValue={editing.sort_order || 0} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {isNew ? '新增' : '更新'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setEditing(null); setIsNew(false) }}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border">
        <div className="border-b bg-muted/50 px-4 py-3 grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 text-sm font-medium">
          <span className="w-6"></span>
          <span>名稱</span>
          <span>Slug</span>
          <span>排序</span>
          <span className="text-right w-20">操作</span>
        </div>
        <Reorder.Group axis="y" values={displayCategories} onReorder={handleReorder} className="divide-y">
          {displayCategories.map((category: Category) => (
            <Reorder.Item
              key={category.id}
              value={category}
              className="px-4 py-3 grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 items-center bg-background cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{category.name}</span>
              <span className="text-sm text-muted-foreground">{category.slug}</span>
              <span className="text-sm">{category.sort_order}</span>
              <div className="text-right w-20">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(category); setIsNew(false) }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(category.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </div>
  )
}
