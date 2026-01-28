# SimpleNavi 實施計劃

## Phase 1: 專案初始化

### 1.1 建立 Vite + React 專案
```bash
npm create vite@latest . -- --template react-ts
npm install
```

### 1.2 安裝核心依賴
```bash
# UI 框架
npm install tailwindcss postcss autoprefixer
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge

# 路由與狀態
npm install react-router-dom @tanstack/react-query

# 表單驗證
npm install react-hook-form zod @hookform/resolvers

# 動畫
npm install framer-motion

# 工具
npm install lucide-react
```

### 1.3 配置 Tailwind CSS
- 建立 `tailwind.config.ts`
- 配置 shadcn/ui 主題色
- 設置深色模式 (`class` 策略)

### 1.4 初始化 shadcn/ui
```bash
npx shadcn@latest init
npx shadcn@latest add button card input label toast avatar skeleton
```

### 1.5 建立 Cloudflare 配置
- 建立 `wrangler.toml`
- 配置 D1 Binding
- 配置 Rate Limiting Binding

---

## Phase 2: 數據庫設計

### 2.1 建立 Migration 檔案
位置: `migrations/0001_init.sql`

包含表:
- `categories`
- `links`
- `click_stats_daily`
- `sessions`

### 2.2 建立 D1 Database
```bash
npx wrangler d1 create simplenavi-db
npx wrangler d1 migrations apply simplenavi-db
```

### 2.3 建立種子數據 (可選)
- 預設分類: 工作、工具、娛樂
- 測試連結數據

---

## Phase 3: API 實現

### 3.1 通用工具函式
| 檔案 | 功能 |
|------|------|
| `functions/_lib/db.ts` | D1 連接與查詢輔助 |
| `functions/_lib/auth.ts` | Session 驗證、Cookie 處理 |
| `functions/_lib/rate-limit.ts` | Rate Limiting 封裝 |
| `functions/_lib/favicon.ts` | Favicon 獲取邏輯 |
| `functions/_lib/response.ts` | 標準化 JSON 響應 |

### 3.2 Public API
| 端點 | 檔案 | 功能 |
|------|------|------|
| `GET /api/links` | `functions/api/links.ts` | 獲取所有分類與連結 |
| `POST /api/click` | `functions/api/click.ts` | 記錄點擊統計 |
| `GET /api/favicon` | `functions/api/favicon.ts` | 代理獲取 favicon |

### 3.3 Auth API
| 端點 | 檔案 | 功能 |
|------|------|------|
| `POST /api/auth/login` | `functions/api/auth/login.ts` | 密碼驗證、發放 Session |
| `POST /api/auth/logout` | `functions/api/auth/logout.ts` | 清除 Session |
| `GET /api/auth/me` | `functions/api/auth/me.ts` | 驗證當前 Session |

### 3.4 Admin API
| 端點 | 檔案 | 功能 |
|------|------|------|
| `GET/POST /api/admin/links` | `functions/api/admin/links.ts` | 連結列表/新增 |
| `PUT/DELETE /api/admin/links/[id]` | `functions/api/admin/links/[id].ts` | 連結修改/刪除 |
| `GET/POST /api/admin/categories` | `functions/api/admin/categories.ts` | 分類列表/新增 |
| `PUT/DELETE /api/admin/categories/[id]` | `functions/api/admin/categories/[id].ts` | 分類修改/刪除 |
| `GET /api/admin/stats` | `functions/api/admin/stats.ts` | 統計數據 |

---

## Phase 4: 前端實現

### 4.1 基礎架構
| 檔案 | 功能 |
|------|------|
| `src/app/App.tsx` | 根組件、Provider 配置 |
| `src/app/routes.tsx` | React Router 路由配置 |
| `src/lib/api.ts` | API Client (fetch 封裝) |
| `src/lib/types.ts` | TypeScript 類型定義 |
| `src/lib/utils.ts` | 工具函式 |

### 4.2 共用組件
| 組件 | 功能 |
|------|------|
| `components/layout/Header.tsx` | 頁頭 (Logo + 主題切換) |
| `components/layout/Container.tsx` | 頁面容器 |
| `components/theme/ThemeProvider.tsx` | 深色模式 Context |
| `components/theme/ThemeToggle.tsx` | 主題切換按鈕 |

### 4.3 前台頁面
| 頁面 | 路徑 | 功能 |
|------|------|------|
| `features/links/HomePage.tsx` | `/` | 導航頁主頁 |
| `features/links/LinkCard.tsx` | - | 連結卡片組件 |
| `features/links/CategorySection.tsx` | - | 分類區塊組件 |
| `features/links/LinkSkeleton.tsx` | - | 載入骨架屏 |

### 4.4 後台頁面
| 頁面 | 路徑 | 功能 |
|------|------|------|
| `features/admin/LoginPage.tsx` | `/admin` | 登入頁 |
| `features/admin/AdminLayout.tsx` | `/admin/*` | 後台佈局 |
| `features/admin/LinksPage.tsx` | `/admin/links` | 連結管理 |
| `features/admin/CategoriesPage.tsx` | `/admin/categories` | 分類管理 |
| `features/admin/StatsPage.tsx` | `/admin/stats` | 統計頁面 |
| `features/admin/LinkForm.tsx` | - | 連結表單組件 |
| `features/admin/CategoryForm.tsx` | - | 分類表單組件 |

### 4.5 React Query Hooks
| Hook | 功能 |
|------|------|
| `useLinks()` | 獲取前台連結數據 |
| `useAdminLinks()` | 獲取後台連結列表 |
| `useCreateLink()` | 新增連結 |
| `useUpdateLink()` | 更新連結 |
| `useDeleteLink()` | 刪除連結 |
| `useCategories()` | 獲取分類 |
| `useStats()` | 獲取統計數據 |
| `useLogin()` | 登入操作 |
| `useLogout()` | 登出操作 |

---

## Phase 5: 進階功能

### 5.1 點擊追蹤
- 使用 `navigator.sendBeacon` 發送點擊事件
- 前端 debounce 防止重複點擊
- 後端 UPSERT 更新每日統計

### 5.2 Favicon 獲取
- 服務端代理請求 FaviconKit
- 失敗時降級到 Icon Horse → Google S2
- 前端 onError 顯示首字母頭像

### 5.3 深色模式
- 使用 `localStorage` 保存偏好
- 支援 `system` 自動跟隨系統
- CSS `prefers-color-scheme` 媒體查詢

---

## Phase 6: 部署與驗證

### 6.1 環境變數設置
```bash
# 設置 Secrets
npx wrangler pages secret put ADMIN_PASSWORD_HASH
npx wrangler pages secret put SESSION_SECRET
```

### 6.2 部署到 Cloudflare Pages
```bash
npm run build
npx wrangler pages deploy dist
```

### 6.3 驗證清單
- [ ] 前台頁面正常載入
- [ ] 分類篩選功能正常
- [ ] 點擊統計正確記錄
- [ ] 深色模式切換正常
- [ ] 後台登入功能正常
- [ ] Rate Limiting 生效
- [ ] 連結 CRUD 功能正常
- [ ] 分類 CRUD 功能正常
- [ ] 統計頁面數據正確
- [ ] 行動端響應式正常

---

## 任務檢查清單

### Phase 1: 專案初始化
- [ ] 1.1 建立 Vite + React 專案
- [ ] 1.2 安裝核心依賴
- [ ] 1.3 配置 Tailwind CSS
- [ ] 1.4 初始化 shadcn/ui
- [ ] 1.5 建立 Cloudflare 配置

### Phase 2: 數據庫設計
- [ ] 2.1 建立 Migration 檔案
- [ ] 2.2 建立 D1 Database
- [ ] 2.3 建立種子數據

### Phase 3: API 實現
- [ ] 3.1 通用工具函式
- [ ] 3.2 Public API
- [ ] 3.3 Auth API
- [ ] 3.4 Admin API

### Phase 4: 前端實現
- [ ] 4.1 基礎架構
- [ ] 4.2 共用組件
- [ ] 4.3 前台頁面
- [ ] 4.4 後台頁面
- [ ] 4.5 React Query Hooks

### Phase 5: 進階功能
- [ ] 5.1 點擊追蹤
- [ ] 5.2 Favicon 獲取
- [ ] 5.3 深色模式

### Phase 6: 部署與驗證
- [ ] 6.1 環境變數設置
- [ ] 6.2 部署到 Cloudflare Pages
- [ ] 6.3 驗證清單
