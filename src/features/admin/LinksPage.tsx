import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Reorder } from 'framer-motion'
import { Plus, Pencil, Trash2, X, GripVertical } from 'lucide-react'
import { api } from '@/lib/api'
import type { Link, Category, Tag } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function LinksPage() {
  const [editing, setEditing] = useState<Link | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [orderedByCategory, setOrderedByCategory] = useState<Record<number, Link[]>>({})
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

  const { data: tags } = useQuery({
    queryKey: ['admin', 'tags'],
    queryFn: api.admin.tags.list,
  })

  const linksByCategory = useMemo(() => {
    const grouped: Record<number, Link[]> = {}
    for (const link of links || []) {
      if (!grouped[link.category_id]) grouped[link.category_id] = []
      grouped[link.category_id].push(link)
    }
    return grouped
  }, [links])

  const createMutation = useMutation({
    mutationFn: api.admin.links.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'links'] })
      setEditing(null)
      setIsNew(false)
      setOrderedByCategory({})
      toast({ title: '連結已新增' })
    },
    onError: (err: Error) => toast({ title: '新增失敗', description: err.message, variant: 'destructive' }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Link> }) => api.admin.links.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'links'] })
      setEditing(null)
      setOrderedByCategory({})
      toast({ title: '連結已更新' })
    },
    onError: (err: Error) => toast({ title: '更新失敗', description: err.message, variant: 'destructive' }),
  })

  const deleteMutation = useMutation({
    mutationFn: api.admin.links.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'links'] })
      setOrderedByCategory({})
      toast({ title: '連結已刪除' })
    },
    onError: (err: Error) => toast({ title: '刪除失敗', description: err.message, variant: 'destructive' }),
  })

  const updateTagsMutation = useMutation({
    mutationFn: ({ id, tagIds }: { id: number; tagIds: number[] }) => api.admin.links.updateTags(id, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'links'] })
    },
    onError: (err: Error) => toast({ title: '標籤更新失敗', description: err.message, variant: 'destructive' }),
  })

  const createTagMutation = useMutation({
    mutationFn: api.admin.tags.create,
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tags'] })
      setSelectedTagIds([...selectedTagIds, newTag.id])
      setNewTagName('')
    },
    onError: (err: Error) => toast({ title: '標籤建立失敗', description: err.message, variant: 'destructive' }),
  })

  const reorderMutation = useMutation({
    mutationFn: api.admin.links.reorder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'links'] })
      setOrderedByCategory({})
      toast({ title: '排序已更新' })
    },
    onError: (err: Error) => toast({ title: '排序失敗', description: err.message, variant: 'destructive' }),
  })

  const startEditing = (link: Link, isNewLink: boolean) => {
    setEditing(link)
    setIsNew(isNewLink)
    setSelectedTagIds(link.tags?.map((t) => t.id) || [])
    setNewTagName('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const newLink = await createMutation.mutateAsync(data)
      if (selectedTagIds.length > 0) {
        await updateTagsMutation.mutateAsync({ id: newLink.id, tagIds: selectedTagIds })
      }
    } else if (editing) {
      await updateMutation.mutateAsync({ id: editing.id, data })
      await updateTagsMutation.mutateAsync({ id: editing.id, tagIds: selectedTagIds })
    }
  }

  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      createTagMutation.mutate({ name: newTagName.trim() })
    }
  }

  const toggleTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleReorder = (categoryId: number, newOrder: Link[]) => {
    setOrderedByCategory(prev => ({ ...prev, [categoryId]: newOrder }))
  }

  const handleSaveOrder = (categoryId: number) => {
    const ordered = orderedByCategory[categoryId]
    if (ordered && ordered.length > 0) {
      reorderMutation.mutate(ordered.map(l => l.id))
    }
  }

  const hasOrderChanged = (categoryId: number) => {
    const ordered = orderedByCategory[categoryId]
    const original = linksByCategory[categoryId]
    return ordered && ordered.length > 0 &&
      JSON.stringify(ordered.map(l => l.id)) !== JSON.stringify(original?.map(l => l.id))
  }

  if (isLoading) return <div>載入中...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">連結管理</h1>
        <Button onClick={() => startEditing({} as Link, true)}>
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
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground"
                    required
                  >
                    <option value="" className="bg-background text-foreground">選擇分類</option>
                    {categories?.map((c: Category) => (
                      <option key={c.id} value={c.id} className="bg-background text-foreground">{c.name}</option>
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
                <div className="space-y-2 sm:col-span-2">
                  <Label>標籤</Label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-md border border-input bg-transparent min-h-[42px]">
                    {tags?.map((tag: Tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                          selectedTagIds.includes(tag.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        #{tag.name}
                        {selectedTagIds.includes(tag.id) && <X className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="新增標籤..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewTag())}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddNewTag} disabled={!newTagName.trim()}>
                      新增
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {isNew ? '新增' : '更新'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setEditing(null); setIsNew(false); setSelectedTagIds([]); setNewTagName('') }}>
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {categories?.map((category: Category) => {
        const categoryLinks = orderedByCategory[category.id] || linksByCategory[category.id] || []
        if (categoryLinks.length === 0) return null

        return (
          <div key={category.id} className="rounded-lg border">
            <div className="border-b bg-muted/50 px-4 py-3 flex items-center justify-between">
              <h2 className="font-semibold">{category.name}</h2>
              {hasOrderChanged(category.id) && (
                <Button size="sm" onClick={() => handleSaveOrder(category.id)} disabled={reorderMutation.isPending}>
                  儲存排序
                </Button>
              )}
            </div>
            <div className="border-b bg-muted/30 px-4 py-2 grid grid-cols-[auto_2fr_1fr_auto_auto] gap-4 text-xs font-medium text-muted-foreground">
              <span className="w-6"></span>
              <span>標題</span>
              <span>標籤</span>
              <span>點擊</span>
              <span className="text-right w-20">操作</span>
            </div>
            <Reorder.Group
              axis="y"
              values={categoryLinks}
              onReorder={(newOrder) => handleReorder(category.id, newOrder)}
              className="divide-y"
            >
              {categoryLinks.map((link: Link) => (
                <Reorder.Item
                  key={link.id}
                  value={link}
                  className="px-4 py-3 grid grid-cols-[auto_2fr_1fr_auto_auto] gap-4 items-center bg-background cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{link.title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">{link.url}</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {link.tags?.map((tag) => (
                      <span key={tag.id} className="inline-flex items-center rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm">{link.click_count}</span>
                  <div className="text-right w-20">
                    <Button variant="ghost" size="icon" onClick={() => startEditing(link, false)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(link.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )
      })}
    </div>
  )
}
