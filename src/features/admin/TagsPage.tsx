import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Reorder } from 'framer-motion'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
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
  const [orderedTags, setOrderedTags] = useState<Tag[]>([])
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: tags, isLoading } = useQuery({
    queryKey: ['admin', 'tags'],
    queryFn: api.admin.tags.list,
  })

  const displayTags = orderedTags.length > 0 ? orderedTags : (tags || [])

  const createMutation = useMutation({
    mutationFn: api.admin.tags.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] })
      setEditing(null)
      setIsNew(false)
      setOrderedTags([])
      toast({ title: '標籤已新增' })
    },
    onError: (err: Error) => toast({ title: '新增失敗', description: err.message, variant: 'destructive' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Tag> }) => api.admin.tags.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] })
      setEditing(null)
      setOrderedTags([])
      toast({ title: '標籤已更新' })
    },
    onError: (err: Error) => toast({ title: '更新失敗', description: err.message, variant: 'destructive' }),
  })

  const deleteMutation = useMutation({
    mutationFn: api.admin.tags.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] })
      setOrderedTags([])
      toast({ title: '標籤已刪除' })
    },
    onError: (err: Error) => toast({ title: '刪除失敗', description: err.message, variant: 'destructive' }),
  })

  const reorderMutation = useMutation({
    mutationFn: api.admin.tags.reorder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] })
      setOrderedTags([])
      toast({ title: '排序已更新' })
    },
    onError: (err: Error) => toast({ title: '排序失敗', description: err.message, variant: 'destructive' }),
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

  const handleReorder = (newOrder: Tag[]) => {
    setOrderedTags(newOrder)
  }

  const handleSaveOrder = () => {
    if (orderedTags.length > 0) {
      reorderMutation.mutate(orderedTags.map(t => t.id))
    }
  }

  const hasOrderChanged = orderedTags.length > 0 &&
    JSON.stringify(orderedTags.map(t => t.id)) !== JSON.stringify(tags?.map(t => t.id))

  if (isLoading) return <div>載入中...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">標籤管理</h1>
        <div className="flex gap-2">
          {hasOrderChanged && (
            <Button onClick={handleSaveOrder} disabled={reorderMutation.isPending}>
              儲存排序
            </Button>
          )}
          <Button onClick={() => { setIsNew(true); setEditing({} as Tag) }}>
            <Plus className="h-4 w-4 mr-1" /> 新增標籤
          </Button>
        </div>
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
                    maxLength={100}
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
        <div className="border-b bg-muted/50 px-4 py-3 grid grid-cols-[auto_1fr_1fr_auto] gap-4 text-sm font-medium">
          <span className="w-6"></span>
          <span>名稱</span>
          <span>Slug</span>
          <span className="text-right w-20">操作</span>
        </div>
        <Reorder.Group axis="y" values={displayTags} onReorder={handleReorder} className="divide-y">
          {displayTags.length === 0 && (
            <div className="px-4 py-8 text-center text-muted-foreground">
              尚無標籤
            </div>
          )}
          {displayTags.map((tag: Tag) => (
            <Reorder.Item
              key={tag.id}
              value={tag}
              className="px-4 py-3 grid grid-cols-[auto_1fr_1fr_auto] gap-4 items-center bg-background cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">#{tag.name}</span>
              <span className="text-sm text-muted-foreground">{tag.slug}</span>
              <div className="text-right w-20">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(tag); setIsNew(false) }}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(tag.id)}>
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
