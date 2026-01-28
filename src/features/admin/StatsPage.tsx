import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StatsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: api.admin.stats,
  })

  if (isLoading) return <div>載入中...</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">統計數據</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">總連結數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalLinks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">總分類數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalCategories}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>熱門連結 Top 10</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topLinks.map((link, i) => (
              <div key={link.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-6">{i + 1}.</span>
                  <div>
                    <div className="font-medium">{link.title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">{link.url}</div>
                  </div>
                </div>
                <div className="text-sm font-medium">{link.click_count} 次</div>
              </div>
            ))}
            {data.topLinks.length === 0 && (
              <div className="text-muted-foreground text-center py-4">暫無數據</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>近 30 天點擊趨勢</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.dailyStats.slice(0, 14).map((stat) => (
              <div key={stat.day} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-24">{stat.day}</span>
                <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.min(100, (stat.total_clicks / Math.max(...data.dailyStats.map((s) => s.total_clicks), 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">{stat.total_clicks}</span>
              </div>
            ))}
            {data.dailyStats.length === 0 && (
              <div className="text-muted-foreground text-center py-4">暫無數據</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
