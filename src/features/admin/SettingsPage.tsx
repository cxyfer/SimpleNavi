import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: api.admin.settings.get,
  })

  const mutation = useMutation({
    mutationFn: api.admin.settings.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast({ title: '設定已儲存' })
    },
    onError: (err: Error) => {
      toast({
        title: '儲存失敗',
        description: err.message,
        variant: 'destructive'
      })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const siteName = formData.get('siteName') as string
    const siteSubtitle = formData.get('siteSubtitle') as string | null

    if (siteName.length < 2 || siteName.length > 50) {
      toast({
        title: '驗證錯誤',
        description: '站點名稱長度需在 2 到 50 個字元之間',
        variant: 'destructive'
      })
      return
    }

    if (siteSubtitle && siteSubtitle.length > 100) {
      toast({
        title: '驗證錯誤',
        description: '副標題長度不能超過 100 個字元',
        variant: 'destructive'
      })
      return
    }

    mutation.mutate({ siteName, siteSubtitle: siteSubtitle || undefined })
  }

  if (isLoading) {
    return <div>載入中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">系統設定</h1>

      <Card>
        <CardHeader>
          <CardTitle>一般設定</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">站點名稱</Label>
              <Input
                id="siteName"
                name="siteName"
                defaultValue={settings?.siteName}
                placeholder="SimpleNavi"
                minLength={2}
                maxLength={50}
                required
              />
              <p className="text-sm text-muted-foreground">
                顯示在瀏覽器標題和導航列的名稱
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteSubtitle">副標題（選填）</Label>
              <Input
                id="siteSubtitle"
                name="siteSubtitle"
                defaultValue={settings?.siteSubtitle}
                placeholder="我的個人書籤管理"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground">
                顯示在站點名稱下方的簡短描述
              </p>
            </div>

            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? '儲存中...' : '儲存設定'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
