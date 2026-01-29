# 連結顯示與編輯體驗優化

## 概述

對 SimpleNavi 進行三項 UX 改進：(1) Admin 後台編輯表單改用 Modal 對話框、(2) Grid 模式下標籤獨立一行顯示、(3) List 模式實現響應式多列佈局。

## 需求分析

### R1: Admin 編輯表單改用 Modal 對話框

**現狀問題**:
- `src/features/admin/LinksPage.tsx:177-260` 編輯表單固定在頁面最上方
- 當編輯頁面底部連結時,使用者需要向上滾動才能看到表單
- 編輯後需再次滾動回到原位置確認變更,體驗不佳

**目標**:
- 使用 Modal 對話框顯示編輯表單
- 點擊編輯時在當前視口彈出,無需滾動
- 保持表單功能完整性(新增/編輯連結、標籤管理)

### R2: Grid 模式標籤獨立一行

**現狀問題**:
- `src/features/links/LinkCard.tsx:97-109` 在 Grid 模式下,網址和標籤共用同一行
- 標籤使用 `flex items-center` 橫向排列,與網域在同一行
- 當標籤較多時會擠壓網域顯示空間

**目標**:
- 標籤在網域下方獨佔一行顯示
- 保持 Grid 模式的卡片視覺層次

### R3: List 模式響應式多列佈局

**現狀問題**:
- `src/features/links/CategorySection.tsx:35` List 模式使用 `flex flex-col`,每個連結佔據完整一行
- `src/features/links/LinkCard.tsx:71` List 卡片雖然緊湊,但單列佈局在大螢幕上浪費空間
- 現有 Grid 模式斷點: `sm:grid-cols-2 xl:grid-cols-3`

**目標**:
- List 模式實現響應式多列:小螢幕 1-2 列,中螢幕 2-3 列,大螢幕 3-4 列
- 保持 List 卡片的緊湊設計(h-10 icon, 小字體)
- 使用與 Grid 類似的 Tailwind 響應式斷點

## 技術約束

| 約束 | 說明 |
|------|------|
| UI 框架 | 使用現有 shadcn/ui (Dialog 組件) + Tailwind CSS v4 |
| 後端不相容 | 不修改 Cloudflare Functions 後端 API |
| 主題相容 | 保持深色/淺色模式相容 |
| 響應式斷點 | 使用 Tailwind 標準斷點: `sm`(640px), `md`(768px), `lg`(1024px), `xl`(1280px) |
| 保留功能 | Modal 須支援現有表單所有功能:標籤選擇、新增標籤、分類選擇 |

## 實現方案

### S1: Admin 編輯表單改用 Modal

**依賴檢查**:
```bash
# 檢查 shadcn/ui Dialog 組件是否存在
ls src/components/ui/dialog.tsx
```

**修改檔案**: `src/features/admin/LinksPage.tsx`

變更:
1. 引入 Dialog 組件:
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
```

2. 移除原有的條件渲染表單 (`{editing && <Card>...}`),改為 Dialog:
```typescript
<Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{isNew ? '新增連結' : '編輯連結'}</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 表單內容保持不變 */}
    </form>
  </DialogContent>
</Dialog>
```

**風險緩解**:
- Dialog 需要合適的 `max-w` 和 `max-h` 以避免在小螢幕溢出
- 表單提交失敗時 Dialog 應保持開啟以便修正

### S2: Grid 模式標籤獨立一行

**修改檔案**: `src/features/links/LinkCard.tsx:97-109`

變更:
```typescript
// 原有代碼 (Line 97-109)
<div className={cn(
  "text-muted-foreground/60 font-mono text-xs flex items-center",
  !isCompact ? "mt-3 gap-2" : "shrink-0 gap-3"
)}>
  <span className="truncate">{domain}</span>
  {link.tags && link.tags.length > 0 && !isCompact && (
    <div className="flex flex-wrap gap-1.5">
      {link.tags.map((tag) => (
        <TagBadge key={tag.id} name={tag.name} slug={tag.slug} />
      ))}
    </div>
  )}
</div>

// 修改後
<div className={cn("text-muted-foreground/60 font-mono text-xs", !isCompact ? "mt-3" : "shrink-0")}>
  <div className="flex items-center gap-2">
    <span className="truncate">{domain}</span>
  </div>
  {link.tags && link.tags.length > 0 && !isCompact && (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {link.tags.map((tag) => (
        <TagBadge key={tag.id} name={tag.name} slug={tag.slug} />
      ))}
    </div>
  )}
</div>
```

### S3: List 模式響應式多列佈局

**修改檔案**: `src/features/links/CategorySection.tsx:34-36`

變更:
```typescript
// 原有代碼
<div className={cn(
  isGrid ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3"
)}>

// 修改後
<div className={cn(
  isGrid
    ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
    : "grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
)}>
```

**響應式斷點設計**:
| 斷點 | 寬度 | 列數 | 說明 |
|------|------|------|------|
| 預設 | <640px | 1 | 手機直屏 |
| sm | ≥640px | 2 | 手機橫屏/小平板 |
| lg | ≥1024px | 3 | 桌面 |
| xl | ≥1280px | 4 | 大桌面 |

## 成功標準

1. **Modal 編輯**:
   - 點擊任意連結的編輯按鈕,對話框在當前視口中央彈出
   - 無需滾動即可完成編輯
   - 支援 ESC 鍵關閉、點擊遮罩關閉

2. **標籤顯示**:
   - Grid 模式下網域和標籤分兩行顯示
   - 標籤區域有足夠水平空間顯示多個標籤

3. **List 響應式**:
   - 小螢幕(<640px): 每行 1 個連結
   - 中螢幕(640-1023px): 每行 2 個連結
   - 大螢幕(1024-1279px): 每行 3 個連結
   - 超大螢幕(≥1280px): 每行 4 個連結

## 風險評估

| 風險 | 緩解策略 |
|------|---------|
| Dialog 組件未安裝 | 使用 `npx shadcn@latest add dialog` 安裝 |
| Modal 在小螢幕溢出 | 設置 `max-w-2xl max-h-[90vh] overflow-y-auto` |
| List 模式多列導致卡片過窄 | 設置 `min-w-0` 並使用 `truncate` 避免內容溢出 |
| 響應式斷點與 Grid 模式衝突 | List 使用更多列數以區分於 Grid 模式 |

## 依賴項

| 項目 | 狀態 | 說明 |
|------|------|------|
| shadcn/ui Dialog | 需確認 | 需安裝 `@radix-ui/react-dialog` |
| Tailwind CSS v4 | 已安裝 | package.json 顯示 v4.1.18 |
| React 19 | 已安裝 | 相容最新 React |
