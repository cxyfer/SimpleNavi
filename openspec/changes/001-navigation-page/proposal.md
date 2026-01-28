# SimpleNavi - 導航頁面系統

## 概述

使用 React + Vite 在 Cloudflare Pages 上構建的現代導航頁面，具備簡易線上管理功能。

## 技術堆疊

| 層級 | 技術選擇 | 版本約束 |
|------|---------|---------|
| 部署平台 | Cloudflare Pages + Pages Functions | - |
| 前端框架 | React | ^18.0.0 |
| 建構工具 | Vite | ^5.0.0 |
| UI 元件 | shadcn/ui + Radix UI | latest |
| CSS 框架 | Tailwind CSS | ^3.4.0 |
| 動畫庫 | Framer Motion | ^11.0.0 |
| 數據存儲 | Cloudflare D1 (SQLite) | - |
| 狀態管理 | TanStack Query (React Query) | ^5.0.0 |
| 路由 | React Router | ^6.0.0 |
| 表單驗證 | React Hook Form + Zod | ^7.0.0 / ^3.0.0 |

## 功能需求

### F1: 前台導航展示
- 卡片式連結展示（現代簡約風格）
- 按分類分組顯示
- 自動獲取網站 favicon
- 深色/淺色模式切換
- 響應式設計（Mobile First）

### F2: 點擊統計
- 記錄每個連結的點擊次數
- 每日點擊彙總統計
- 後台可查看熱門連結排行

### F3: 後台管理
- 密碼登入驗證
- 連結 CRUD 操作
- 分類 CRUD 操作
- 統計數據查看

## 架構設計

### 數據模型 (D1 Schema)

```sql
-- categories: 導航分類
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- links: 導航連結
CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  icon_source TEXT NOT NULL DEFAULT 'auto', -- auto|custom|none
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_links_category_sort ON links(category_id, sort_order);
CREATE UNIQUE INDEX idx_links_url ON links(url);

-- click_stats_daily: 每日點擊彙總
CREATE TABLE click_stats_daily (
  link_id INTEGER NOT NULL REFERENCES links(id),
  day TEXT NOT NULL, -- YYYY-MM-DD
  count INTEGER NOT NULL DEFAULT 0,
  last_clicked_at TEXT,
  PRIMARY KEY (link_id, day)
);

CREATE INDEX idx_click_stats_day ON click_stats_daily(day);

-- sessions: Cookie Session
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  ip_hash TEXT,
  ua_hash TEXT
);

CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

### API 端點規格

#### Public API

| Path | Method | Description | Response |
|------|--------|-------------|----------|
| `/api/links` | GET | 獲取所有連結與分類 | `{ ok, data: { categories, links } }` |
| `/api/click` | POST | 記錄點擊 | `204 No Content` |
| `/api/favicon` | GET | 代理獲取 favicon | `{ ok, url }` |

#### Admin API (需認證)

| Path | Method | Description |
|------|--------|-------------|
| `/api/auth/login` | POST | 登入驗證 |
| `/api/auth/logout` | POST | 登出 |
| `/api/admin/links` | GET/POST | 連結列表/新增 |
| `/api/admin/links/:id` | PUT/DELETE | 連結修改/刪除 |
| `/api/admin/categories` | GET/POST | 分類列表/新增 |
| `/api/admin/categories/:id` | PUT/DELETE | 分類修改/刪除 |
| `/api/admin/stats` | GET | 統計數據 |

### 認證機制

- **密碼存儲**: 環境變數 `ADMIN_PASSWORD_HASH` (bcrypt hash)
- **Session Cookie**: `__Host-sn_session`
- **Cookie 屬性**: `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`
- **Session TTL**: 7 天

### 安全措施

#### Rate Limiting (Workers Rate Limiting API)

**實現方式**: 在 Functions 代碼層面使用 Workers Rate Limiting Binding

```toml
# wrangler.toml
[[ratelimits]]
name = "LOGIN_LIMITER"
namespace_id = "1001"
simple = { limit = 5, period = 60 }   # 登入: 5次/分鐘

[[ratelimits]]
name = "CLICK_LIMITER"
namespace_id = "1002"
simple = { limit = 60, period = 60 }  # 點擊: 60次/分鐘
```

**Key 策略**:
- 登入限流 Key: `login:${IP}`
- 點擊限流 Key: `click:${IP}:${linkId}`

**實現範例**:
```typescript
// functions/api/auth/login.ts
export async function onRequestPost(context) {
  const ip = context.request.headers.get('CF-Connecting-IP');
  const { success } = await context.env.LOGIN_LIMITER.limit({ key: `login:${ip}` });

  if (!success) {
    return Response.json({ ok: false, error: 'Too Many Requests' }, { status: 429 });
  }
  // ... 登入邏輯
}
```

#### CSRF 防護
- SameSite=Lax Cookie
- Origin Header 驗證

### Favicon 獲取策略

優先順序:
1. **FaviconKit**: `https://ico.faviconkit.net/favicon/{domain}?sz=64`
2. **Icon Horse**: `https://icon.horse/icon/{domain}`
3. **Google S2** (備援): `https://www.google.com/s2/favicons?domain={domain}&sz=64`

失敗降級: 顯示網站首字母的預設圖標

## 專案結構

```
/
├─ functions/
│  ├─ api/
│  │  ├─ links.ts
│  │  ├─ click.ts
│  │  ├─ favicon.ts
│  │  ├─ auth/
│  │  │  ├─ login.ts
│  │  │  └─ logout.ts
│  │  └─ admin/
│  │     ├─ links.ts
│  │     ├─ categories.ts
│  │     └─ stats.ts
│  └─ _lib/
│     ├─ db.ts
│     ├─ auth.ts
│     ├─ rate-limit.ts
│     └─ favicon.ts
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  └─ routes.tsx
│  ├─ components/
│  │  ├─ ui/           # shadcn/ui
│  │  └─ layout/
│  ├─ features/
│  │  ├─ links/
│  │  ├─ theme/
│  │  └─ admin/
│  └─ lib/
│     ├─ api.ts
│     ├─ types.ts
│     └─ utils.ts
├─ migrations/
│  └─ 0001_init.sql
├─ public/
├─ tailwind.config.ts
├─ vite.config.ts
├─ wrangler.toml
└─ package.json
```

## UI/UX 約束

### 路由結構

| 路徑 | 頁面 | 認證 |
|------|------|------|
| `/` | 前台導航頁 | 否 |
| `/admin` | 後台登入頁 | 否 |
| `/admin/links` | 連結管理 | ✅ |
| `/admin/categories` | 分類管理 | ✅ |
| `/admin/stats` | 統計數據 | ✅ |

### 錯誤處理模式

- **API 錯誤**: Toast 通知（右上角，3秒自動消失）
- **表單驗證**: Inline 欄位錯誤（Zod 驗證結果）
- **網路錯誤**: Toast 通知 + 重試按鈕
- **404 頁面**: 專用 404 組件

### Loading 狀態模式

- **頁面載入**: Skeleton 骨架屏（卡片佔位符）
- **按鈕操作**: 按鈕內 Spinner + 禁用狀態
- **資料刷新**: 保持舊數據 + 背景更新（TanStack Query staleTime）

## 邊緣情況與緩解策略

### 點擊追蹤
| 問題 | 緩解策略 |
|------|---------|
| 重複點擊 | 前端 debounce + 後端 IP+LinkID 指紋去重 |
| 導航中斷 | 使用 `navigator.sendBeacon` API |

### Favicon 獲取
| 問題 | 緩解策略 |
|------|---------|
| CORS/404 失敗 | 服務端代理 + 多 provider 降級 |
| 加載緩慢 | 緩存至 KV (TTL 7天) + 優雅降級 |

### D1 性能
| 問題 | 緩解策略 |
|------|---------|
| 讀取延遲 | 使用 Cache-Control 緩存 JSON 響應 |
| 寫入並發 | 點擊統計異步寫入 (UPSERT) |

### 行動端適配
| 問題 | 緩解策略 |
|------|---------|
| 觸控區域過小 | 最小 44x44px 觸控目標 |
| Hover 狀態沾黏 | 使用 `@media (hover: hover)` |

## PBT 測試屬性

### 不變量 (Invariants)

1. **點擊計數單調遞增**
   - `links.click_count` 只能增加，永不減少
   - 驗證: 任意時刻 `count_after >= count_before`

2. **Session 過期時間一致性**
   - `sessions.expires_at` 必須等於 `created_at + 7 days`
   - 驗證: `expires_at - created_at == 604800 seconds`

3. **分類刪除約束**
   - 存在關聯 links 的 category 不可刪除
   - 驗證: `DELETE category WHERE EXISTS(links) → Error`

4. **URL 唯一性**
   - 同一 URL 只能存在一條 link 記錄
   - 驗證: `INSERT duplicate URL → Constraint Error`

5. **Rate Limit 邊界**
   - 登入嘗試: 60秒內最多5次
   - 驗證: 第6次請求返回 429

### 往返測試 (Round-trip)

1. **Link CRUD**
   - `Create → Read → data matches`
   - `Update → Read → data matches`

2. **Category CRUD**
   - `Create → Read → data matches`
   - 刪除後 `Read → 404`

## 環境變數

| 變數名 | 用途 | 必填 |
|--------|------|------|
| `ADMIN_PASSWORD_HASH` | 管理員密碼 bcrypt hash | ✅ |
| `SESSION_SECRET` | Session 簽名密鑰 | ✅ |

## 部署檢查清單

- [ ] D1 Database 已建立並綁定
- [ ] `ADMIN_PASSWORD_HASH` 已設定 (Secret)
- [ ] `SESSION_SECRET` 已設定 (Secret)
- [ ] Rate Limiting 規則已配置
- [ ] 自定義域名已綁定 (可選)
