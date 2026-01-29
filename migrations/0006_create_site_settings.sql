-- Migration: Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_name TEXT NOT NULL CHECK (length(site_name) BETWEEN 2 AND 50),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);