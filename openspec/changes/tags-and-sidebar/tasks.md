## 1. Database Schema

- [x] 1.1 建立 `tags` 表 migration SQL
- [x] 1.2 建立 `link_tags` 關聯表 migration SQL
- [x] 1.3 在 D1 執行 migration

## 2. Backend Types & Utilities

- [x] 2.1 在 `functions/_lib/db.ts` 新增 Tag 和 LinkTag 介面
- [x] 2.2 新增 `getActiveTags` 和 `getLinksWithTags` 函數

## 3. Backend API - Tags

- [x] 3.1 建立 `functions/api/tags.ts` - GET /api/tags 公開端點
- [x] 3.2 建立 `functions/api/admin/tags/index.ts` - GET/POST 管理端點
- [x] 3.3 建立 `functions/api/admin/tags/[id].ts` - PUT/DELETE 管理端點

## 4. Backend API - Link Tags

- [x] 4.1 建立 `functions/api/admin/links/[id]/tags.ts` - PUT 更新連結標籤
- [x] 4.2 修改 `functions/api/links.ts` - 回傳包含標籤資訊

## 5. Frontend Types

- [x] 5.1 在 `src/lib/types.ts` 新增 Tag 介面
- [x] 5.2 更新 Link 介面，新增 tags 欄位
- [x] 5.3 在 `src/lib/api.ts` 新增標籤相關 API 函數

## 6. Frontend Components - Sidebar

- [x] 6.1 建立 `src/components/layout/Sidebar.tsx` 可收縮側邊欄元件
- [x] 6.2 實作 localStorage 狀態持久化
- [x] 6.3 實作響應式行為（手機默認收起）

## 7. Frontend Components - Tags

- [x] 7.1 建立 `src/features/links/TagBadge.tsx` 標籤徽章元件
- [x] 7.2 修改 `src/features/links/LinkCard.tsx` 顯示標籤徽章

## 8. Frontend Pages & Routing

- [x] 8.1 建立 `src/features/links/CategoryPage.tsx` 分類子頁面
- [x] 8.2 修改 `src/features/links/HomePage.tsx` 加入側邊欄佈局
- [x] 8.3 修改 `src/app/routes.tsx` 新增 /:slug 路由
- [x] 8.4 實作 ?tag=slug Query Parameter 篩選邏輯

## 9. Admin Panel

- [x] 9.1 建立 `src/features/admin/TagsPage.tsx` 標籤管理頁面
- [x] 9.2 修改 `src/features/admin/LinksPage.tsx` 新增標籤編輯功能
- [x] 9.3 更新 AdminLayout 導航，新增標籤管理入口
