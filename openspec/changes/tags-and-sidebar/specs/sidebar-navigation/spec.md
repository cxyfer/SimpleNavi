## ADDED Requirements

### Requirement: Collapsible sidebar component
系統 SHALL 提供可收縮的側邊欄元件，顯示分類列表作為導航入口。

#### Scenario: Display categories in sidebar
- **WHEN** 用戶訪問首頁或分類頁面
- **THEN** 側邊欄顯示所有啟用的分類列表，包含分類名稱

#### Scenario: Highlight current category
- **WHEN** 用戶在分類頁面 /:slug
- **THEN** 側邊欄中對應的分類項目顯示為選中狀態

### Requirement: Sidebar toggle functionality
側邊欄 SHALL 支援展開/收起切換功能。

#### Scenario: Toggle sidebar
- **WHEN** 用戶點擊側邊欄切換按鈕
- **THEN** 側邊欄在展開和收起狀態之間切換

#### Scenario: Sidebar animation
- **WHEN** 側邊欄狀態切換
- **THEN** 使用平滑的 CSS transition 動畫

### Requirement: Sidebar state persistence
側邊欄狀態 SHALL 使用 localStorage 持久化。

#### Scenario: Remember collapsed state
- **WHEN** 用戶收起側邊欄後重新載入頁面
- **THEN** 側邊欄保持收起狀態

#### Scenario: Remember expanded state
- **WHEN** 用戶展開側邊欄後重新載入頁面
- **THEN** 側邊欄保持展開狀態

### Requirement: Responsive sidebar behavior
側邊欄 SHALL 根據螢幕尺寸調整預設行為。

#### Scenario: Mobile default collapsed
- **WHEN** 用戶在手機裝置（寬度 < 768px）首次訪問
- **THEN** 側邊欄預設為收起狀態

#### Scenario: Desktop respect user preference
- **WHEN** 用戶在桌面裝置首次訪問
- **THEN** 側邊欄預設為展開狀態，除非 localStorage 有收起記錄

### Requirement: Sidebar navigation
點擊側邊欄中的分類項目 SHALL 導航到對應的分類頁面。

#### Scenario: Navigate to category page
- **WHEN** 用戶點擊側邊欄中的 "工具" 分類
- **THEN** 頁面導航到 /tools

#### Scenario: Navigate to home
- **WHEN** 用戶點擊側邊欄中的 "全部" 選項
- **THEN** 頁面導航到首頁 /
