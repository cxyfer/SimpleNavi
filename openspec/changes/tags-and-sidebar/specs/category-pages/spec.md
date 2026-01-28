## ADDED Requirements

### Requirement: Category page route
系統 SHALL 支援分類子頁面路由 /:slug，基於 Category 的 slug 欄位。

#### Scenario: Access category page
- **WHEN** 用戶訪問 /tools（假設存在 slug 為 "tools" 的分類）
- **THEN** 頁面只顯示該分類下的連結

#### Scenario: Invalid category slug
- **WHEN** 用戶訪問不存在的分類 slug
- **THEN** 頁面顯示空狀態或導航回首頁

### Requirement: Category page layout
分類頁面 SHALL 使用與首頁相同的側邊欄佈局。

#### Scenario: Category page with sidebar
- **WHEN** 用戶訪問分類頁面
- **THEN** 頁面左側顯示側邊欄，右側顯示該分類的連結列表

### Requirement: Tag filtering via query parameter
系統 SHALL 支援使用 Query Parameter `?tag=slug` 進行標籤篩選。

#### Scenario: Filter by tag on home page
- **WHEN** 用戶訪問 /?tag=charity
- **THEN** 頁面只顯示帶有 "charity" 標籤的連結

#### Scenario: Filter by tag on category page
- **WHEN** 用戶訪問 /tools?tag=charity
- **THEN** 頁面只顯示 "tools" 分類中帶有 "charity" 標籤的連結

#### Scenario: Invalid tag slug
- **WHEN** 用戶訪問 /?tag=nonexistent
- **THEN** 頁面顯示空結果

### Requirement: Tag badge display
LinkCard SHALL 顯示該連結的所有標籤徽章。

#### Scenario: Display tag badges
- **WHEN** 一個 Link 有標籤 ["公益", "免費"]
- **THEN** LinkCard 上顯示兩個標籤徽章

#### Scenario: No tags
- **WHEN** 一個 Link 沒有標籤
- **THEN** LinkCard 不顯示標籤區域

### Requirement: Tag badge click filtering
點擊標籤徽章 SHALL 觸發標籤篩選。

#### Scenario: Click tag badge on home page
- **WHEN** 用戶在首頁點擊 "公益" 標籤徽章
- **THEN** URL 變更為 /?tag=charity，頁面篩選顯示

#### Scenario: Click tag badge on category page
- **WHEN** 用戶在 /tools 頁面點擊 "公益" 標籤徽章
- **THEN** URL 變更為 /tools?tag=charity，頁面篩選顯示

### Requirement: Clear tag filter
系統 SHALL 提供清除標籤篩選的方式。

#### Scenario: Clear filter
- **WHEN** 用戶在篩選狀態下點擊清除按鈕或移除 tag query parameter
- **THEN** 頁面恢復顯示所有連結（在當前分類範圍內）
