-- 預設分類
INSERT INTO categories (name, slug, sort_order) VALUES
  ('工作', 'work', 1),
  ('工具', 'tools', 2),
  ('娛樂', 'entertainment', 3);

-- 測試連結
INSERT INTO links (category_id, title, url, description, sort_order) VALUES
  (1, 'GitHub', 'https://github.com', '程式碼託管平台', 1),
  (1, 'GitLab', 'https://gitlab.com', '程式碼託管與 CI/CD', 2),
  (2, 'Google', 'https://google.com', '搜尋引擎', 1),
  (2, 'Stack Overflow', 'https://stackoverflow.com', '程式問答社群', 2),
  (3, 'YouTube', 'https://youtube.com', '影片平台', 1),
  (3, 'Twitch', 'https://twitch.tv', '直播平台', 2);
