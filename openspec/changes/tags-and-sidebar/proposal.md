## Why

目前導航頁面缺乏靈活的內容組織方式。用戶無法為連結添加跨分類的標籤屬性（如 #公益、#免費），也無法快速瀏覽特定分類的內容。需要新增標籤系統和分類側邊欄來提升內容發現效率。

## What Changes

- 新增標籤系統，支援為每個 Link 添加多個標籤
- 新增可收縮側邊欄，顯示分類列表作為導航入口
- 新增分類子頁面路由 `/:slug`，只顯示該分類的連結
- 標籤篩選使用 Query Parameter `?tag=slug`，可與分類組合使用
- LinkCard 顯示標籤徽章，點擊可篩選
- 側邊欄狀態使用 localStorage 持久化，手機版默認收起

## Capabilities

### New Capabilities

- `tag-system`: 標籤資料模型、CRUD API、與 Link 的多對多關聯
- `sidebar-navigation`: 可收縮側邊欄元件、分類列表顯示、響應式行為
- `category-pages`: 分類子頁面路由、標籤篩選 Query Parameter 支援

### Modified Capabilities

（無現有 capabilities 需要修改）

## Impact

**資料庫**
- 新增 `tags` 表：id, name, slug, created_at, updated_at
- 新增 `link_tags` 關聯表：link_id, tag_id（複合主鍵）

**後端 API**
- 新增 `/api/tags` 公開端點
- 新增 `/api/admin/tags` 管理端點（CRUD）
- 新增 `/api/admin/links/:id/tags` 標籤關聯端點
- 修改 `/api/links` 回傳包含標籤資訊

**前端路由**
- `/` 首頁加入側邊欄佈局
- `/:slug` 新增分類子頁面
- 支援 `?tag=slug` Query Parameter

**前端元件**
- 新增：Sidebar、TagBadge、CategoryPage
- 修改：HomePage、LinkCard、routes.tsx
