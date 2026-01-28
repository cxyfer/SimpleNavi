## Context

SimpleNavi 是一個基於 React + Vite 前端和 Cloudflare Pages Functions 後端的導航網站。目前使用 D1 資料庫存儲分類 (categories) 和連結 (links)，分類已有 slug 欄位。前端使用 TanStack Query 進行資料獲取，react-router-dom v7 處理路由。

現有架構：
- 前端：單一 HomePage 顯示所有分類和連結
- 後端：`/api/links` 回傳 categories + links
- 資料庫：categories、links、click_stats_daily 三張表

## Goals / Non-Goals

**Goals:**
- 實現標籤系統，支援 Link 與 Tag 的多對多關係
- 新增可收縮側邊欄，提供分類導航入口
- 支援分類子頁面和標籤篩選
- 保持現有功能不受影響

**Non-Goals:**
- 標籤的層級結構（保持扁平）
- 標籤的顏色自定義
- 側邊欄的拖拽排序
- 標籤的搜尋功能

## Decisions

### 1. 資料庫設計

**決策**：新增 `tags` 表和 `link_tags` 關聯表

```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE link_tags (
  link_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (link_id, tag_id),
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

**理由**：標準的多對多關係設計，使用複合主鍵避免重複關聯。

### 2. API 回傳標籤資訊

**決策**：修改 `/api/links` 回傳結構，在每個 link 物件中包含 tags 陣列

```typescript
interface Link {
  // ...existing fields
  tags: { id: number; name: string; slug: string }[]
}
```

**替代方案**：分開請求標籤資訊 → 增加請求次數，不採用

**理由**：一次請求獲取完整資料，減少前端複雜度。

### 3. 標籤篩選 URL 設計

**決策**：使用 Query Parameter `?tag=slug`

- `/?tag=charity` - 首頁篩選
- `/tools?tag=charity` - 分類頁面 + 標籤篩選

**替代方案**：獨立路由 `/tag/:slug` → 無法組合分類篩選

**理由**：Query Parameter 可與分類路由組合，更靈活。

### 4. 分類子頁面路由

**決策**：使用 `/:slug` 動態路由

**衝突處理**：
- 保留 slug 列表：`admin`, `api`, `auth`, `login`, `logout`（已在後端驗證）
- 路由匹配順序：具體路由優先於動態路由

### 5. 側邊欄狀態管理

**決策**：使用 localStorage + React state

```typescript
const SIDEBAR_KEY = 'sidebar-collapsed'
const isMobile = window.innerWidth < 768
const defaultCollapsed = isMobile ? true : localStorage.getItem(SIDEBAR_KEY) === 'true'
```

**理由**：簡單有效，無需額外狀態管理庫。

### 6. 前端元件結構

**決策**：建立共用佈局元件

```
src/
├── components/
│   └── layout/
│       └── Sidebar.tsx          # 新增
├── features/
│   └── links/
│       ├── HomePage.tsx         # 修改：加入側邊欄
│       ├── CategoryPage.tsx     # 新增
│       ├── LinkCard.tsx         # 修改：顯示標籤
│       └── TagBadge.tsx         # 新增
```

## Risks / Trade-offs

**[風險] 路由衝突**
- `/:slug` 可能與未來新增的頁面衝突
- **緩解**：維護保留 slug 列表，新增頁面時檢查

**[風險] 資料庫遷移**
- 新增表需要執行 migration
- **緩解**：提供 SQL migration 腳本，可在 D1 console 執行

**[取捨] 標籤篩選為前端過濾**
- 首次載入所有資料，前端進行篩選
- **優點**：減少 API 請求，即時響應
- **缺點**：大量資料時效能下降
- **決策**：目前資料量小，採用前端過濾；未來可改為後端篩選

**[取捨] 側邊欄動畫**
- 使用 CSS transition 而非 framer-motion
- **理由**：簡單的展開/收起不需要複雜動畫庫
