## ADDED Requirements

### Requirement: Tag data model
系統 SHALL 支援標籤 (Tag) 實體，包含 id、name、slug、created_at、updated_at 欄位。slug 欄位 MUST 唯一且只允許小寫字母、數字和連字符。

#### Scenario: Create tag with valid data
- **WHEN** 管理員建立標籤，name 為 "公益"，slug 為 "charity"
- **THEN** 系統建立標籤記錄，自動設定 created_at 和 updated_at

#### Scenario: Reject duplicate slug
- **WHEN** 管理員建立標籤，slug 與現有標籤重複
- **THEN** 系統回傳錯誤，拒絕建立

### Requirement: Link-Tag many-to-many relationship
系統 SHALL 支援 Link 與 Tag 的多對多關係。每個 Link 可以有零個或多個 Tag，每個 Tag 可以關聯到多個 Link。

#### Scenario: Associate tags to link
- **WHEN** 管理員為一個 Link 設定標籤 ["公益", "免費"]
- **THEN** 系統建立對應的關聯記錄

#### Scenario: Remove tag association
- **WHEN** 管理員移除 Link 的某個標籤
- **THEN** 系統刪除對應的關聯記錄，不影響其他關聯

#### Scenario: Delete tag cascades
- **WHEN** 管理員刪除一個 Tag
- **THEN** 系統自動刪除所有與該 Tag 的關聯記錄

### Requirement: Tag CRUD API
系統 SHALL 提供標籤的完整 CRUD API。

#### Scenario: List all tags
- **WHEN** 請求 GET /api/tags
- **THEN** 系統回傳所有標籤列表

#### Scenario: Admin create tag
- **WHEN** 管理員請求 POST /api/admin/tags，body 包含 name 和 slug
- **THEN** 系統建立標籤並回傳新建立的標籤資料

#### Scenario: Admin update tag
- **WHEN** 管理員請求 PUT /api/admin/tags/:id，body 包含更新的 name 或 slug
- **THEN** 系統更新標籤並回傳更新後的資料

#### Scenario: Admin delete tag
- **WHEN** 管理員請求 DELETE /api/admin/tags/:id
- **THEN** 系統刪除標籤及其所有關聯

### Requirement: Link tags management API
系統 SHALL 提供更新 Link 標籤關聯的 API。

#### Scenario: Update link tags
- **WHEN** 管理員請求 PUT /api/admin/links/:id/tags，body 包含 tag_ids 陣列
- **THEN** 系統替換該 Link 的所有標籤關聯為指定的標籤

### Requirement: Links API includes tags
GET /api/links 回傳的每個 Link 物件 SHALL 包含 tags 陣列，包含該 Link 關聯的所有標籤資訊。

#### Scenario: Fetch links with tags
- **WHEN** 請求 GET /api/links
- **THEN** 每個 Link 物件包含 tags 陣列，每個 tag 包含 id、name、slug

### Requirement: Hybrid tag management
後台管理介面 SHALL 支援混合模式的標籤管理：可從預定義標籤選擇，也可自由輸入新標籤。

#### Scenario: Select existing tag
- **WHEN** 管理員編輯 Link，從下拉選單選擇現有標籤
- **THEN** 系統將該標籤關聯到 Link

#### Scenario: Create new tag inline
- **WHEN** 管理員編輯 Link，輸入不存在的標籤名稱
- **THEN** 系統自動建立新標籤（slug 由 name 轉換）並關聯到 Link
