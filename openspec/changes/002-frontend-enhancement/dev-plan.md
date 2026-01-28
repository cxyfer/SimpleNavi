# 開發計畫 - 前端設計增強與功能擴展

## 任務清單

### Task 1: Favicon 修復 (優先)

**目標**: 修改 `/api/favicon` 端點返回 302 重定向

**修改檔案**:
- `functions/api/favicon.ts`

**實現步驟**:
1. 修改 `onRequestGet` 返回 `Response.redirect(faviconUrl, 302)` 而非 JSON
2. 設置 `Cache-Control: public, max-age=604800` (7天)
3. 保留 404 錯誤處理

**驗收標準**:
- [ ] `/api/favicon?domain=github.com` 返回 302 重定向
- [ ] 前端 LinkCard favicon 正確顯示

---

### Task 2: 卡片視覺強化

**目標**: 增強 LinkCard 和 CategorySection 視覺效果

**修改檔案**:
- `src/features/links/LinkCard.tsx`
- `src/features/links/CategorySection.tsx`

**LinkCard 變更**:
```diff
- className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
+ className="group flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20"
```

**CategorySection 變更**:
- 分類標題添加視覺裝飾
- 增加區塊間距

**驗收標準**:
- [ ] 卡片 hover 時有陰影和位移效果
- [ ] 分類標題視覺層次清晰

---

### Task 3: 搜尋功能

**目標**: 在首頁添加即時搜尋過濾

**修改檔案**:
- `src/features/links/HomePage.tsx`
- `src/components/layout/Header.tsx`

**實現步驟**:

1. **Header.tsx** - 添加搜尋輸入框
   - 接收 `searchQuery` 和 `onSearchChange` props
   - 使用 shadcn/ui Input 組件
   - 添加搜尋圖標 (lucide-react Search)

2. **HomePage.tsx** - 添加搜尋邏輯
   - 新增 `searchQuery` state
   - 使用 `useMemo` 過濾連結
   - 將 props 傳遞給 Header

**驗收標準**:
- [ ] 搜尋框顯示在 Header
- [ ] 輸入關鍵字即時過濾連結
- [ ] 搜尋標題和描述
- [ ] 空搜尋顯示全部連結

---

## 執行順序

```
Task 1 (Favicon) → Task 2 (卡片) → Task 3 (搜尋)
```

Task 1 優先，因為這是 bug 修復，影響用戶體驗。
Task 2 和 Task 3 可並行，但建議先完成 Task 2 再做 Task 3。

## 測試計畫

1. **Favicon 測試**
   - 訪問 `/api/favicon?domain=github.com`，確認返回 302
   - 檢查前端 LinkCard 圖片是否正確載入

2. **視覺測試**
   - 檢查深色/淺色模式下卡片效果
   - 檢查響應式佈局

3. **搜尋測試**
   - 測試中英文搜尋
   - 測試空搜尋
   - 測試無結果情況
