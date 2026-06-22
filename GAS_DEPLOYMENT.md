# Google Apps Script (GAS) 部署與檢查清單

此文件提供一步步操作，幫你把前端管理頁 (`admin.html` / `admin.js`) 的新增成語資料送到 Google 試算表（Spreadsheet）。內容包含：

- 最精簡的 `doPost` GAS 程式碼
- 在 GAS 編輯器部署為 Web App 的完整步驟
- 測試與驗證清單（包含 `curl` 範例）
- 在 `admin.js` 設定 Web App URL 的位置

---

## 1. 最精簡的 GAS `doPost` 程式碼

1. 前往 https://script.google.com，點「新增專案」。
2. 將下列程式碼貼到 `Code.gs`：

```javascript
// 將此處替換為你的試算表 ID
var SPREADSHEET_ID = 'REPLACE_WITH_YOUR_SPREADSHEET_ID';
var SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || '{}');
    var idiom = payload.idiom || '';
    var meaning = payload.meaning || '';

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    // 新增一列：Timestamp, Idiom, Meaning
    sheet.appendRow([new Date(), idiom, meaning]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

> 小提示：你只要把 `SPREADSHEET_ID` 換成試算表網址中 `/d/` 與 `/edit` 之間的那段 ID 即可。

---

## 2. 部署步驟（將 GAS 專案設為 Web App）

1. 在 GAS 編輯器中，存檔（`Ctrl/Cmd+S`）。
2. 點選右上角「部署」→「新增部署」（或「管理部署」→「新增部署」）。
3. 選擇「類型」為 **Web 應用程式 (Web app)**。
4. 設定選項：
   - **描述**：可填任意文字（例如："Idiom API"）。
   - **執行應用程式的身份**（Execute as）：選擇 `我`（你的帳號）。
   - **有權存取的人**（Who has access）：若要允許任何人（含匿名）送出請求，選擇「任何人，包括匿名使用者」。
5. 按「部署」。系統可能會要求授權，依提示授權即可。
6. 部署完成後會顯示一個 **Web 應用程式的 URL**，複製該 URL（例：`https://script.google.com/macros/s/AKfycb.../exec`）。

> 注意：若選擇「任何人，包括匿名使用者」，任何知道該 URL 的人皆可呼叫該 API。若需要更嚴格的安全性，請改為「僅限已登入使用者」，但前端呼叫時會需要使用 OAuth 或同源授權策略。

---

## 3. 在 `admin.js` 中設定 Web App URL

1. 開啟 [admin.js](admin.js)。
2. 找到檔案開頭的 `GAS_WEBAPP_URL` 變數（或 `REPLACE_WITH_YOUR_GAS_WEBAPP_URL`）並替換為部署時取得的 URL：

```javascript
var GAS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycb.../exec';
```

3. 若要同步測試，重新載入管理頁後新增成語，觀察 DevTools Network 與 Console 的回應。

---

## 4. 測試與驗證清單

- [ ] 確認 `SPREADSHEET_ID` 已正確填入 GAS 程式碼，並且試算表存在。
- [ ] 部署 GAS 為 Web App，並取得 Web App URL。
- [ ] 在 `admin.js` 中設定 `GAS_WEBAPP_URL` 為該 URL。
- [ ] 在瀏覽器開啟 `admin.html`，新增一筆成語，並確認前端 console 顯示回應。
- [ ] 前往 Google 試算表，確認是否新增一列（時間、成語、解釋）。
- [ ] 若出現錯誤，開啟 GAS 編輯器的「執行紀錄（Executions）」或「日誌（Logs）」查看錯誤訊息。

---

## 5. 測試範例（`curl`）

你可以在終端用 `curl` 測試（取代 `{GAS_URL}` 與 JSON 內容）：

```bash
curl -X POST '{GAS_URL}' \
  -H 'Content-Type: application/json' \
  -d '{"idiom":"臥虎藏龍","meaning":"比喻文人倜儻不羈，懷才不遇。"}'
```

預期回應（JSON）：

```json
{"status":"ok"}
```

---

## 6. 常見問題排查

- 權限錯誤（401/403）：確認部署時選擇的 "有權存取的人" 與你期待的存取方式一致，並確認你已授權 GAS 訪問你的試算表。
- CORS：GAS Web App 回傳 JSON 並不會阻擋基本 POST，若瀏覽器出現 CORS 錯誤，檢查是否使用了自訂 Header 或前端 Fetch 設定（Content-Type: application/json 通常可正常使用）。
- JSON 解析錯誤：確保前端將 `Content-Type: application/json` 並以 JSON 字串發送。

---

## 7. 建議的擴充（非必要）

- 若不希望公開 Web App URL，可加入簡單的密鑰驗證：前端在 POST body 或自訂 header 中帶入 `secret` 值，GAS 在 `doPost` 檢查是否正確。
- 若使用者量大或需要更完整的 API，可考慮把 GAS 換成 GCP Cloud Functions + OAuth 控制。

---

若你要，我可以：

- 幫你把 `GAS_WEBAPP_URL` 直接寫回 `admin.js`（請提供剛取得的 Web App URL）；
- 或協助撰寫包含簡單 `secret` 驗證的版本並說明如何部署。