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
  icon_source TEXT NOT NULL DEFAULT 'auto',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_links_category_sort ON links(category_id, sort_order, id);
CREATE INDEX idx_links_url ON links(url);

-- click_stats_daily: 每日點擊彙總 (UTC 時區)
CREATE TABLE click_stats_daily (
  link_id INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  day TEXT NOT NULL CHECK(day GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
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
