# 前端設計增強與功能擴展

## 概述

對 SimpleNavi 前端進行三項改進：卡片視覺強化、搜尋功能、Favicon 修復。

## 需求分析

### R1: 卡片視覺強化

**現狀問題**:
- `src/features/links/LinkCard.tsx` 卡片樣式過於簡單
- 缺乏視覺層次和互動回饋
- 分類區塊 `src/features/links/CategorySection.tsx` 視覺呈現單調

**目標**:
- 增強卡片陰影、邊框、圓角效果
- 添加 hover 過渡動畫
- 改善分類標題視覺層次

### R2: 搜尋功能

**現狀問題**:
- 無任何搜尋或過濾機制
- 連結數量增加後難以快速定位

**目標**:
- 前端即時過濾（資料已載入，無需 API）
- 搜尋範圍：連結標題 + 描述
- 搜尋框置於 Header 或頁面頂部

### R3: Favicon 修復

**現狀問題**:
- `LinkCard.tsx:32` 將 `/api/favicon?domain=${domain}` 直接作為 `<img src>`
- `/api/favicon` 返回 JSON `{ url: faviconUrl }` 而非圖片
- 導致所有 favicon 載入失敗，僅顯示首字母 fallback

**目標**:
- 修正 favicon 載入邏輯
- 正確顯示網站 favicon

## 技術約束

| 約束 | 說明 |
|------|------|
| UI 框架 | 使用現有 shadcn/ui + Tailwind CSS |
| 主題相容 | 保持深色/淺色模式相容 |
| 響應式 | 維持 Mobile First 設計 |
| 後台無影響 | 不修改 admin 相關功能 |

## 實現方案

### S1: 卡片視覺強化

**修改檔案**: `src/features/links/LinkCard.tsx`

變更:
- 增加 `shadow-sm hover:shadow-md` 陰影效果
- 添加 `transition-all duration-200` 過渡動畫
- hover 時輕微上移 `hover:-translate-y-0.5`
- 增強邊框對比度

**修改檔案**: `src/features/links/CategorySection.tsx`

變更:
- 分類標題添加底線或背景裝飾
- 增加分類區塊間距

### S2: 搜尋功能

**新增/修改檔案**:
- `src/features/links/HomePage.tsx` - 添加搜尋狀態和過濾邏輯
- `src/components/layout/Header.tsx` - 添加搜尋輸入框

實現:
```typescript
// HomePage.tsx
const [searchQuery, setSearchQuery] = useState('')

const filteredLinks = useMemo(() => {
  if (!searchQuery.trim()) return data?.links
  const query = searchQuery.toLowerCase()
  return data?.links.filter(link =>
    link.title.toLowerCase().includes(query) ||
    link.description?.toLowerCase().includes(query)
  )
}, [data?.links, searchQuery])
```

### S3: Favicon 修復

**方案 A**: 前端先調用 API 獲取 URL，再設置圖片 src

```typescript
// LinkCard.tsx
const [faviconUrl, setFaviconUrl] = useState<string | null>(null)

useEffect(() => {
  if (!link.icon_url) {
    api.favicon.get(domain).then(res => setFaviconUrl(res.url)).catch(() => {})
  }
}, [domain, link.icon_url])
```

**方案 B (推薦)**: 修改後端 API 直接返回圖片重定向

```typescript
// functions/api/favicon.ts
export const onRequestGet: PagesFunction<Env> = async (context) => {
  // ...
  if (!faviconUrl) return error('Favicon not found', 404)

  // 返回 302 重定向到實際 favicon URL
  return Response.redirect(faviconUrl, 302)
}
```

前端無需修改，`/api/favicon?domain=xxx` 直接作為圖片 src 即可。

## 成功標準

1. **卡片視覺**: hover 時有明顯視覺回饋（陰影、位移）
2. **搜尋功能**: 輸入關鍵字後即時過濾顯示匹配連結
3. **Favicon**: 網站 favicon 正確顯示，非首字母 fallback

## 風險評估

| 風險 | 緩解策略 |
|------|---------|
| Favicon 重定向可能被瀏覽器快取 | 設置適當的 Cache-Control header |
| 搜尋效能（大量連結） | 使用 useMemo 避免重複計算 |
| 動畫效能 | 僅使用 transform/opacity 觸發 GPU 加速 |
