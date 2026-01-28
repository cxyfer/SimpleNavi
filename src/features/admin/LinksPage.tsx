import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { Link, Category } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function LinksPage() {
  const [editing, setEditing] = useState<Link | null>(null)
  const [isNew, setIsNew] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: links, isLoading } = useQuery({
    queryKey: ['admin', 'links'],
    queryFn: api.admin.links.list,
  })

  const { data: categories } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: api.admin.categories.list,
  })

  const createMutation = useMutation({
    mutationFn: api.admin.links.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'links'] })
      setEditing(null)
      setIsNew(false)
      toast({ title: '連結已新增' })
    },
    onError: (err: Error) => toast({ title: '新增失敗', description: err.message, variant: 'destructive' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Link> }) => api.admin.links.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'links'] })
      setEditing(null)
      toast({ title: '連結已更新' })
    },
    onError: (err: Error) => toast({ title: '更新失敗', description: err.message, variant: 'destructive' }),
  })

  const deleteMutation = useMutation({
    mutationFn: api.admin.links.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'links'] })
      toast({ title: '連結已刪除' })
    },
    onError: (err: Error) => toast({ title: '刪除失敗', description: err.message, variant: 'destructive' }),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const data = {
      category_id: Number(form.get('category_id')),
      title: form.get('title') as string,
      url: form.get('url') as string,
      description: form.get('description') as string || undefined,
      sort_order: Number(form.get('sort_order')) || 0,
    }

    if (isNew) {
      createMutation.mutate(data)
    } else if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    }
  }

  const getCategoryName = (id: number) => categories?.find((c: Category) => c.id === id)?.name || ''

  if (isLoading) return <div>載入中...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">連結管理</h1>
        <Button onClick={() => { setIsNew(true); setEditing({} as Link) }}>
          <Plus className="h-4 w-4 mr-1" /> 新增連結
        </Button>
      </div>

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>{isNew ? '新增連結' : '編輯連結'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category_id">分類</Label>
                  <select
                    id="category_id"
                    name="category_id"
                    defaultValue={editing.category_id}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    required
                  >
                    <option value="">選擇分類</option>
                    {categories?.map((c: Category) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">標題</Label>
                  <Input id="title" name="title" defaultValue={editing.title} required maxLength={100} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="url">網址</Label>
                  <Input id="url" name="url" type="url" defaultValue={editing.url} required maxLength={2048} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">描述</Label>
                  <Input id="description" name="description" defaultValue={editing.description || ''} maxLength={500} />
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
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">標題</th>
              <th className="px-4 py-3 text-left text-sm font-medium">分類</th>
              <th className="px-4 py-3 text-left text-sm font-medium">點擊</th>
              <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {links?.map((link: Link) => (
              <tr key={link.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{link.title}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-xs">{link.url}</div>
                </td>
                <td className="px-4 py-3 text-sm">{getCategoryName(link.category_id)}</td>
                <td className="px-4 py-3 text-sm">{link.click_count}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(link); setIsNew(false) }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(link.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
