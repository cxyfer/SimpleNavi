# 實施任務 (Implementation Tasks)

## 階段 1: 安裝依賴

### T1: 安裝 shadcn/ui Dialog 組件
- **檔案**: N/A (CLI 命令)
- **命令**: `npx shadcn@latest add dialog`
- **驗證**: `ls src/components/ui/dialog.tsx` 存在
- **阻塞**: T4, T5, T6
- [x] 已完成

---

## 階段 2: 並行實施 (R2 + R3)

### T2: Grid 模式標籤獨立一行
- **檔案**: `src/features/links/LinkCard.tsx`
- **位置**: Line 97-109
- **變更**:
  1. 移除外層 `flex items-center`
  2. 網域 `<span>` 包裹在獨立 `<div>` 內
  3. 標籤區塊加上 `mt-2` 間距
- **驗證**: VC2 (Grid 標籤獨立行)

### T3: List 模式響應式多列 - CategorySection
- **檔案**: `src/features/links/CategorySection.tsx`
- **位置**: Line 34-36
- **變更**:
  ```diff
  - isGrid ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3"
  + isGrid
  +   ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
  +   : "grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  ```
- **驗證**: VC3 (List 響應式多列)

### T3.1: List 模式響應式多列 - CategoryPage
- **檔案**: `src/features/links/CategoryPage.tsx`
- **位置**: Line 110
- **變更**: 與 T3 相同的 grid classes
- **驗證**: VC4 (CategoryPage 一致性)

---

## 階段 3: Modal 改造 (R1)

### T4: 引入 Dialog 組件
- **檔案**: `src/features/admin/LinksPage.tsx`
- **位置**: imports 區塊
- **變更**:
  ```typescript
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog'
  import { Loader2 } from 'lucide-react'
  ```

### T5: 新增 isPending 計算
- **檔案**: `src/features/admin/LinksPage.tsx`
- **位置**: mutations 定義之後
- **變更**:
  ```typescript
  const isPending = createMutation.isPending || updateMutation.isPending || updateTagsMutation.isPending
  ```

### T6: 替換表單為 Dialog
- **檔案**: `src/features/admin/LinksPage.tsx`
- **位置**: 原 `{editing && <Card>...}` 區塊
- **變更**:
  1. 移除 `{editing && <Card>...}` 條件渲染
  2. 新增 `<Dialog>` 包裹
  3. 設置 `open={!!editing}`
  4. 設置 `onOpenChange` 重置所有狀態 (僅在 `!isPending` 時)
  5. DialogContent 設置:
     - `className="max-w-2xl max-h-[90dvh] overflow-y-auto"`
     - `onInteractOutside={(e) => isPending && e.preventDefault()}`
     - `onEscapeKeyDown={(e) => isPending && e.preventDefault()}`
  6. 表單內容移入 DialogContent
- **驗證**: VC1 (Modal 編輯功能), VC5 (提交中禁止關閉)

### T7: 提交按鈕 Loading 狀態
- **檔案**: `src/features/admin/LinksPage.tsx`
- **位置**: 提交按鈕
- **變更**:
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

### T8: 移除取消按鈕 (可選)
- **檔案**: `src/features/admin/LinksPage.tsx`
- **說明**: Dialog 有內建關閉按鈕,取消按鈕可移除或保留
- **決策**: 保留取消按鈕,但在 `isPending` 時禁用
  ```typescript
  <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={isPending}>
    取消
  </Button>
  ```

---

## 驗證清單

| 任務 | 驗證項目 | 通過條件 |
|------|---------|---------|
| T1 | Dialog 組件存在 | `dialog.tsx` 檔案存在 |
| T2 | VC2 | Grid 模式標籤在網域下方 |
| T3 | VC3 | List 模式響應式列數正確 |
| T3.1 | VC4 | CategoryPage 列數與首頁一致 |
| T6 | VC1 | Modal 彈出無需滾動 |
| T6 | VC5 | 提交中 ESC/遮罩無法關閉 |
| T7 | - | 提交時顯示 spinner + "儲存中..." |

---

## 任務依賴圖

```
T1 (安裝 Dialog)
 │
 ├──> T4 (引入 Dialog)
 │     │
 │     └──> T5 (isPending)
 │           │
 │           └──> T6 (替換表單)
 │                 │
 │                 └──> T7 (Loading 狀態)
 │                       │
 │                       └──> T8 (取消按鈕)
 │
 │ (並行)
 │
 ├──> T2 (Grid 標籤)
 │
 └──> T3 (List CategorySection)
       │
       └──> T3.1 (List CategoryPage)
```
