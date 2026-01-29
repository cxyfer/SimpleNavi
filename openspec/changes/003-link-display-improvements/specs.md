# 需求規格 (Requirements Specification)

## R1: Admin 編輯表單改用 Modal Dialog

### 功能需求
- 點擊編輯按鈕時,表單以 Modal 對話框形式彈出
- Modal 在當前視口中央顯示,無需滾動
- 支援 ESC 鍵關閉、點擊遮罩關閉 (提交中除外)
- 保持表單所有功能: 分類選擇、標題/網址/描述/排序輸入、標籤管理

### 行為規格
| 觸發 | 條件 | 結果 |
|------|------|------|
| 點擊編輯按鈕 | - | Modal 開啟,表單填入現有資料 |
| 點擊新增按鈕 | - | Modal 開啟,表單為空 |
| 點擊儲存 | 驗證通過 | 提交 API,成功後關閉 Modal |
| 點擊儲存 | 驗證失敗 | 顯示驗證錯誤,Modal 保持開啟 |
| API 失敗 | - | Toast 顯示錯誤,Modal 保持開啟,表單內容保留 |
| 按 ESC | 非提交中 | 關閉 Modal,重置狀態 |
| 按 ESC | 提交中 | 無反應 |
| 點擊遮罩 | 非提交中 | 關閉 Modal,重置狀態 |
| 點擊遮罩 | 提交中 | 無反應 |

### PBT 屬性

#### P1.1: 狀態一致性 - Modal 開關
```
INVARIANT: editing 存在 ⟺ Modal 開啟
FALSIFICATION: 隨機序列觸發 startEditing/關閉/提交,檢查 open 狀態是否與 editing 同步
```

#### P1.2: 冪等性 - 重複開啟
```
INVARIANT: 同一 link 重複點擊編輯,表單欄位值一致
FALSIFICATION: 對同一 link 連續觸發開啟 N 次,比較表單欄位
```

#### P1.3: 狀態一致性 - 關閉重置
```
INVARIANT: 任何關閉路徑都重置 editing/isNew/selectedTagIds/newTagName
FALSIFICATION: 隨機觸發不同關閉方式,檢查狀態是否全部重置
```

#### P1.4: 狀態一致性 - 提交中禁止關閉
```
INVARIANT: isPending 時 Dialog 不可關閉
FALSIFICATION: 提交後嘗試 ESC/遮罩/關閉按鈕,檢查 Dialog 是否關閉
```

#### P1.5: 無障礙 - 焦點管理
```
INVARIANT: Dialog 開啟後焦點移入,關閉後焦點返回觸發源
FALSIFICATION: 追蹤 focus 變化,檢查焦點位置
```

#### P1.6: UI 約束 - 視口限制
```
INVARIANT: Dialog 最大高度 90dvh,內容可滾動
FALSIFICATION: 縮小視窗高度,檢查 Dialog 是否溢出
```

#### P1.7: 狀態一致性 - Loading 狀態
```
INVARIANT: 提交時按鈕顯示 spinner + "儲存中...",disabled=true
FALSIFICATION: 提交後檢查按鈕內容與 disabled 狀態
```

---

## R2: Grid 模式標籤獨立一行

### 功能需求
- Grid 模式下,標籤區塊在網域資訊下方獨立一行顯示
- 標籤允許無限換行,不限制顯示數量
- List 模式 (isCompact) 保持原有行為,標籤不顯示

### 視覺規格
```
Grid 模式卡片結構:
┌─────────────────────────┐
│ [Icon] Title            │
│ Description...          │
│ example.com             │  ← 網域獨立一行
│ [Tag1] [Tag2] [Tag3]    │  ← 標籤獨立一行
└─────────────────────────┘
```

### PBT 屬性

#### P2.1: 狀態一致性 - DOM 順序
```
INVARIANT: Grid 模式下,標籤區塊在網域之後
FALSIFICATION: 檢查 DOM 順序,標籤區塊必須在網域之後
```

#### P2.2: 冪等性 - viewMode 切換
```
INVARIANT: 反覆切換 grid/list 不改變標籤順序或內容
FALSIFICATION: 反覆切換後比較標籤順序/數量
```

#### P2.3: 響應式 - 無限換行
```
INVARIANT: 標籤允許無限換行,狹窄寬度下仍完整可見
FALSIFICATION: 縮小卡片寬度,生成大量標籤,檢查是否被截斷
```

#### P2.4: 無障礙 - 螢幕閱讀器
```
INVARIANT: 標籤區塊可被螢幕閱讀器按 DOM 順序讀取
FALSIFICATION: 以 aria tree 掃描 DOM,檢查標籤位置
```

---

## R3: List 模式響應式多列佈局

### 功能需求
- List 模式實現響應式多列佈局
- CategoryPage 與 CategorySection 使用相同列數規則

### 響應式規格
| 斷點 | 寬度 | 列數 |
|------|------|------|
| 預設 | <640px | 1 |
| sm | ≥640px | 2 |
| lg | ≥1024px | 3 |
| xl | ≥1280px | 4 |

### PBT 屬性

#### P3.1: 響應式 - 斷點列數
```
INVARIANT: List 模式在指定斷點呈現指定列數
FALSIFICATION: 隨機挑選視窗寬度 (含邊界值),計算可見列數
```

#### P3.2: 狀態一致性 - 頁面同步
```
INVARIANT: CategoryPage 與 CategorySection 的 List 列數規則一致
FALSIFICATION: 同一寬度下比較兩處渲染結果列數
```

#### P3.3: 冪等性 - 重複渲染
```
INVARIANT: 同一視窗寬度重複渲染,列數與卡片位置穩定
FALSIFICATION: 固定寬度下多次重新渲染,檢查列數與位置
```

#### P3.4: 無障礙 - 鍵盤導航
```
INVARIANT: List 模式多列佈局不破壞 Tab 順序
FALSIFICATION: 模擬 Tab 導航,確保與 DOM 順序一致
```
