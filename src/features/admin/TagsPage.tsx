import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { Tag } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function TagsPage() {
  const [editing, setEditing] = useState<Tag | null>(null)
  const [isNew, setIsNew] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: tags, isLoading } = useQuery({
    queryKey: ['admin', 'tags'],
    queryFn: api.admin.tags.list,
  })

  const createMutation = useMutation({
    mutationFn: api.admin.tags.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] })
      setEditing(null)
      setIsNew(false)
      toast({ title: '標籤已新增' })
    },
    onError: (err: Error) => toast({ title: '新增失敗', description: err.message, variant: 'destructive' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tag> }) => api.admin.tags.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] })
      setEditing(null)
      toast({ title: '標籤已更新' })
    },
    onError: (err: Error) => toast({ title: '更新失敗', description: err.message, variant: 'destructive' }),
  })

  const deleteMutation = useMutation({
    mutationFn: api.admin.tags.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] })
      toast({ title: '標籤已刪除' })
    },
    onError: (err: Error) => toast({ title: '刪除失敗', description: err.message, variant: 'destructive' }),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = form.get('name') as string
    const slug = (form.get('slug') as string) || undefined

    if (isNew) {
      createMutation.mutate({ name, slug })
    } else if (editing) {
      updateMutation.mutate({ id: editing.id, data: { name, slug: slug || editing.slug } })
    }
  }

  if (isLoading) return <div>載入中...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">標籤管理</h1>
        <Button onClick={() => { setIsNew(true); setEditing({} as Tag) }}>
          <Plus className="h-4 w-4 mr-1" /> 新增標籤
        </Button>
      </div>

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>{isNew ? '新增標籤' : '編輯標籤'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">名稱</Label>
                  <Input id="name" name="name" defaultValue={editing.name} required maxLength={50} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug（選填，自動生成）</Label>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={editing.slug}
                    maxLength={50}
                    pattern="^[a-z0-9-]*$"
                    title="只能使用小寫字母、數字和連字號"
                    placeholder="留空自動生成"
                  />
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
              <th className="px-4 py-3 text-left text-sm font-medium">名稱</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Slug</th>
              <th className="px-4 py-3 text-right text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {tags?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  尚無標籤
                </td>
              </tr>
            )}
            {tags?.map((tag: Tag) => (
              <tr key={tag.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">#{tag.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{tag.slug}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(tag); setIsNew(false) }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(tag.id)}>
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
