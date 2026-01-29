# SimpleNavi

現代化導航頁面系統，使用 React + Vite 構建，部署於 Cloudflare Pages。

## 功能特色

- 分類管理與連結收藏
- 標籤系統
- 拖曳排序
- 點擊統計
- 深色模式
- 響應式設計

## 技術堆疊

- **前端**: React 19, Vite, Tailwind CSS v4, shadcn/ui
- **後端**: Cloudflare Pages Functions
- **資料庫**: Cloudflare D1 (SQLite)
- **快取**: Cloudflare KV

## 環境需求

- Node.js 20+
- npm 或 pnpm
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare 帳戶

## 本地開發

```bash
# 複製設定檔範本
cp wrangler.toml.example wrangler.toml

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

## 部署到 Cloudflare Pages

### 1. 建立 Cloudflare 資源

```bash
# 設置帳戶 ID (替換為你的帳戶 ID)
export CLOUDFLARE_ACCOUNT_ID=your_account_id

# 建立 D1 資料庫
npx wrangler d1 create simplenavi-db

# 建立 KV Namespace
npx wrangler kv namespace create FAVICON_CACHE
```

### 2. 設定 wrangler.toml

複製範本並填入上一步獲得的 `database_id` 和 KV `id`：

```bash
cp wrangler.toml.example wrangler.toml
```

```toml
[[d1_databases]]
binding = "DB"
database_name = "simplenavi-db"
database_id = "your_database_id"

[[kv_namespaces]]
binding = "FAVICON_CACHE"
id = "your_kv_namespace_id"
```

### 3. 執行資料庫 Migrations

```bash
npx wrangler d1 execute simplenavi-db --remote --file=migrations/0001_init.sql
npx wrangler d1 execute simplenavi-db --remote --file=migrations/0002_seed.sql
npx wrangler d1 execute simplenavi-db --remote --file=migrations/0003_create_tags.sql
npx wrangler d1 execute simplenavi-db --remote --file=migrations/0004_create_link_tags.sql
npx wrangler d1 execute simplenavi-db --remote --file=migrations/0005_add_tags_sort_order.sql
```

### 4. 建立 Pages 專案並部署

```bash
# 建立專案
npx wrangler pages project create simplenavi --production-branch master

# 建構並部署
npm run build
npx wrangler pages deploy dist --project-name simplenavi --branch master
```

### 5. 設置環境變數

生成管理員密碼 hash：

```bash
node -e "
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const password = crypto.randomBytes(16).toString('base64url').slice(0, 20);
const hash = bcrypt.hashSync(password, 10);
const sessionSecret = crypto.randomBytes(32).toString('base64url');
console.log('Password:', password);
console.log('ADMIN_PASSWORD_HASH:', hash);
console.log('SESSION_SECRET:', sessionSecret);
"
```

> 請記下輸出的 `Password`，這是登入後台的密碼。

設置 Secrets：

```bash
echo 'your_password_hash' | npx wrangler pages secret put ADMIN_PASSWORD_HASH --project-name simplenavi
echo 'your_session_secret' | npx wrangler pages secret put SESSION_SECRET --project-name simplenavi
```

### 6. 綁定 D1 和 KV

透過 Cloudflare Dashboard 或 API 綁定資源。

使用 API 需先建立具有 `Pages:Edit` 權限的 [API Token](https://dash.cloudflare.com/profile/api-tokens)：

```bash
export CF_API_TOKEN=your_api_token

curl -X PATCH "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/simplenavi" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{
    "deployment_configs": {
      "production": {
        "d1_databases": { "DB": { "id": "your_database_id" } },
        "kv_namespaces": { "FAVICON_CACHE": { "namespace_id": "your_kv_id" } }
      },
      "preview": {
        "d1_databases": { "DB": { "id": "your_database_id" } },
        "kv_namespaces": { "FAVICON_CACHE": { "namespace_id": "your_kv_id" } }
      }
    }
  }'
```

### 7. 重新部署

```bash
npx wrangler pages deploy dist --project-name simplenavi --branch master
```

## 使用方式

- **前台**: `https://your-project.pages.dev/`
- **後台**: `https://your-project.pages.dev/admin`

## License

MIT
