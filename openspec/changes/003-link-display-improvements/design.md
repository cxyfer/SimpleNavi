# 技術設計 (Technical Design)

## 概述

本文件描述 003-link-display-improvements 的技術實現細節,所有決策點已消除歧義。

## R1: Admin 編輯表單改用 Modal Dialog

### 檔案變更
- `src/features/admin/LinksPage.tsx`

### 實現細節

#### 1. 引入 Dialog 組件
```typescript
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
```

#### 2. 計算 isPending 狀態
```typescript
const isPending = createMutation.isPending || updateMutation.isPending || updateTagsMutation.isPending
```

#### 3. Dialog 結構
```typescript
<Dialog
  open={!!editing}
  onOpenChange={(open) => {
    if (!open && !isPending) {
      setEditing(null)
      setIsNew(false)
      setSelectedTagIds([])
      setNewTagName('')
    }
  }}
>
  <DialogContent
    className="max-w-2xl max-h-[90dvh] overflow-y-auto"
    onInteractOutside={(e) => isPending && e.preventDefault()}
    onEscapeKeyDown={(e) => isPending && e.preventDefault()}
  >
    <DialogHeader>
      <DialogTitle>{isNew ? '新增連結' : '編輯連結'}</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 表單內容保持不變 */}
    </form>
  </DialogContent>
</Dialog>
```

#### 4. 提交按鈕 Loading 狀態
```typescript
<Button type="submit" disabled={isPending}>
  {isPending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      儲存中...
    </>
  ) : (
    isNew ? '新增' : '更新'
  )}
</Button>
```

#### 5. 移除原有條件渲染
- 移除 `{editing && <Card>...}` 區塊
- 表單內容移入 DialogContent

### 狀態管理
- `open` 狀態由 `!!editing` 決定
- 所有關閉路徑統一重置: `editing`, `isNew`, `selectedTagIds`, `newTagName`
- 提交中禁止關閉 (ESC/遮罩)

---

## R2: Grid 模式標籤獨立一行

### 檔案變更
- `src/features/links/LinkCard.tsx`

### 實現細節

#### 修改位置: Line 97-109

**Before:**
```typescript
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
```

**After:**
```typescript
<div className={cn(
  "text-muted-foreground/60 font-mono text-xs",
  !isCompact ? "mt-3" : "shrink-0"
)}>
  <div className={cn("flex items-center", !isCompact ? "" : "gap-3")}>
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

### 視覺效果
- Grid 模式: 網域獨立一行,標籤在下方獨立一行
- List 模式 (isCompact): 保持原有行為,標籤不顯示

---

## R3: List 模式響應式多列佈局

### 檔案變更
- `src/features/links/CategorySection.tsx`
- `src/features/links/CategoryPage.tsx`

### 實現細節

#### CategorySection.tsx (Line 34-36)

**Before:**
```typescript
<div className={cn(
  isGrid ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3"
)}>
```

**After:**
```typescript
<div className={cn(
  isGrid
    ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
    : "grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
)}>
```

#### CategoryPage.tsx (Line 110)

**Before:**
```typescript
<div className={cn(
  isGrid ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3"
)}>
```

**After:**
```typescript
<div className={cn(
  isGrid
    ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
    : "grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
)}>
```

### 響應式斷點

| 斷點 | 寬度 | List 列數 | Grid 列數 |
|------|------|-----------|-----------|
| 預設 | <640px | 1 | 1 |
| sm | ≥640px | 2 | 2 |
| lg | ≥1024px | 3 | 2 |
| xl | ≥1280px | 4 | 3 |

---

## PBT 屬性 (Property-Based Testing)

### P1: Modal 生命週期完整性
- **不變量**: `editing` 存在時 Modal 開啟; `editing` 為 null 時 Modal 關閉
- **偽造策略**: 隨機序列觸發開啟/關閉/提交,檢查 open 狀態同步

### P2: 提交反饋狀態
- **不變量**: 提交時按鈕顯示 spinner + "儲存中...",禁用狀態
- **偽造策略**: 提交後檢查按鈕內容與 disabled 狀態

### P3: 錯誤反饋持久性
- **不變量**: 提交失敗時 Modal 保持開啟,表單內容保留
- **偽造策略**: 模擬 API 失敗,檢查 Modal 狀態與表單內容

### P4: 視口約束尺寸
- **不變量**: Modal 最大高度 90dvh,內容可滾動
- **偽造策略**: 縮小視窗高度,檢查 Modal 是否溢出

### P5: Grid 標籤隔離
- **不變量**: Grid 模式下標籤在網域下方獨立一行
- **偽造策略**: 檢查 DOM 順序,標籤區塊必須在網域之後

### P6: List 佈局同步
- **不變量**: CategoryPage 與 CategorySection 的 List 列數規則一致
- **偽造策略**: 同一寬度下比較兩處渲染結果列數

---

## 依賴項

| 項目 | 狀態 | 說明 |
|------|------|------|
| shadcn/ui Dialog | 需安裝 | `npx shadcn@latest add dialog` |
| Loader2 icon | 已有 | `lucide-react` |
| Tailwind CSS v4 | 已安裝 | 支援 dvh 單位 |
