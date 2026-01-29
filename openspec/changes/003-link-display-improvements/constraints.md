# 約束集合 (Constraint Sets)

## 硬約束 (Hard Constraints)

### C1: 必須安裝 shadcn/ui Dialog 組件
- **來源**: `src/components/ui/` 目錄檢查顯示無 `dialog.tsx`
- **影響**: R1 無法使用現有組件,需先安裝
- **命令**: `npx shadcn@latest add dialog`
- **依賴**: `@radix-ui/react-dialog`

### C2: Modal 必須支援完整表單功能
- **來源**: `LinksPage.tsx:183-257` 現有表單功能
- **必須保留**:
  - 分類選擇 (`select#category_id`)
  - 標題/網址/描述/排序輸入
  - 標籤多選與新增標籤功能
  - 提交/取消按鈕

### C3: List 模式響應式必須使用 grid 佈局
- **來源**: Tailwind CSS v4 無 `flex` 等寬列的響應式方案
- **約束**: 必須改用 `grid grid-cols-{n}` 實現多列
- **斷點**: 使用 Tailwind 標準斷點 `sm`/`lg`/`xl`

### C4: 保持現有 styling 約定
- **來源**: `src/app.css` 和 `LinkCard.tsx` 的現有樣式
- **必須使用**:
  - `cn()` utility from `@/lib/utils` (clsx + tailwind-merge)
  - 現有的顏色變數: `--color-primary`, `--color-muted`, etc.
  - 現有的間距/圓角: `gap-3`, `rounded-lg`, etc.

### C5: CategoryPage 必須同步修改
- **來源**: Multi-model analysis (Codex)
- **約束**: `CategoryPage.tsx:110` 的 list mode 必須與 `CategorySection.tsx` 使用相同 grid classes
- **原因**: 保持不同頁面行為一致性

### C6: Dialog 提交中禁止關閉
- **來源**: User decision
- **約束**: 當 `createMutation` 或 `updateMutation` 或 `updateTagsMutation` 任一 `isPending` 時,禁用 ESC/遮罩點擊關閉
- **實現**: `onInteractOutside={(e) => isPending && e.preventDefault()}`

### C7: Dialog max-height 使用 dvh
- **來源**: User decision + Gemini analysis
- **約束**: 使用 `max-h-[90dvh]` 而非 `max-h-[90vh]`
- **原因**: 更好支援 mobile browser 動態視口

### C8: 提交按鈕 Loading 狀態
- **來源**: User decision
- **約束**: 提交時顯示 spinner + "儲存中..." 文字
- **實現**: `disabled={isPending}` + conditional rendering

### C9: 錯誤處理僅用 Toast
- **來源**: User decision
- **約束**: 提交失敗時僅使用 toast 顯示錯誤,不在 Dialog 內顯示 inline 錯誤
- **行為**: Dialog 保持開啟,表單內容保留

### C10: 標籤無限換行
- **來源**: User decision
- **約束**: Grid 模式下標籤允許無限換行,不限制顯示數量
- **實現**: `flex flex-wrap` 無 max-height 限制

## 軟約束 (Soft Constraints)

### SC1: 優先使用現有 shadcn/ui 組件
- **來源**: 專案已使用 Avatar, Button, Card, Input, Label
- **建議**: 使用 Dialog 而非自建 Modal
- **原因**: 保持設計一致性,減少維護成本

### SC2: Grid 模式標籤間距保持一致
- **來源**: `LinkCard.tsx:103` 使用 `gap-1.5`
- **建議**: 標籤獨立一行後仍使用 `gap-1.5`

### SC3: 沿用 shadcn Dialog 預設動畫
- **來源**: Codex analysis
- **建議**: 不新增 framer-motion,尊重 `reduced-motion`

### SC4: z-index 疊層規則
- **來源**: Codex analysis
- **建議**: Dialog overlay/content 使用 z-60~90,高於 header(z-50),低於 toast(z-100)

## 依賴關係 (Dependencies)

### D1: R1 (Modal) → 需安裝 Dialog 組件
- **阻塞**: 無法實現 R1 直到 Dialog 安裝完成
- **並行**: R2, R3 可獨立於 R1 進行

### D2: R2 (標籤顯示) → 無依賴
- **可獨立實施**: 僅修改 `LinkCard.tsx` 樣式

### D3: R3 (List 響應式) → 無依賴
- **可獨立實施**: 修改 `CategorySection.tsx` + `CategoryPage.tsx` 佈局

## 實施順序

1. **階段 1**: 安裝 Dialog 組件 (阻塞 R1)
2. **階段 2**: 並行實施 R2 + R3 (無依賴)
3. **階段 3**: 實施 R1 (Modal 改造)

## 成功判據 (Verifiable Success Criteria)

### VC1: Modal 編輯功能
```
1. 訪問 /admin/links
2. 點擊頁面底部連結的編輯按鈕
3. 預期: Modal 在視口中央彈出,無需滾動
4. 填寫表單並提交
5. 預期: 連結更新成功,Modal 關閉
```

### VC2: Grid 標籤獨立行
```
1. 訪問首頁
2. 切換到 Grid 模式
3. 選擇有標籤的連結卡片
4. 預期: 網域和標籤分兩行顯示,標籤在網域下方
```

### VC3: List 響應式多列
```
1. 訪問首頁
2. 切換到 List 模式
3. 調整瀏覽器寬度:
   - <640px: 預期 1 列
   - 640-1023px: 預期 2 列
   - 1024-1279px: 預期 3 列
   - ≥1280px: 預期 4 列
```

### VC4: CategoryPage 一致性
```
1. 訪問首頁,切換到 List 模式,記錄列數
2. 點擊任一分類進入 CategoryPage
3. 預期: 相同視窗寬度下列數一致
```

### VC5: 提交中禁止關閉
```
1. 訪問 /admin/links
2. 點擊編輯按鈕開啟 Modal
3. 點擊儲存按鈕
4. 在 spinner 顯示期間按 ESC 或點擊遮罩
5. 預期: Modal 不關閉
```

## 風險與緩解

| 風險 | 可能性 | 影響 | 緩解策略 |
|------|--------|------|---------|
| Dialog 安裝失敗 | 低 | 高 | 手動安裝 `@radix-ui/react-dialog` |
| List 模式卡片過窄 | 中 | 中 | 設置 `min-w-0` + `truncate` |
| Modal 在移動端溢出 | 低 | 中 | `max-h-[90dvh] overflow-y-auto` |
| CategoryPage 遺漏同步 | 中 | 中 | 明確列入 tasks.md |
