目標

說明如何從管理頁（前端）將成語資料送到後端（Google Apps Script），並將資料寫入 Google 試算表。文件包含：
- 前端最精簡的 POST 範例（可直接放入 `admin.js`）
- Google Apps Script（GAS）的 `doPost` 範例程式碼
- 部署 GAS 為 Web App 的步驟
- 在 `admin.js` 中設定 `GAS_WEBAPP_URL` 的位置

前提

- 你有一個 Google 帳號
- 已建立好一個 Google 試算表（Spreadsheet），並備妥其 ID

1) 前端（精簡）

在 `admin.js` 中（或在提交後）呼叫下面的函式：

```javascript
// 替換為你部署後的 GAS Web App URL
var GAS_WEBAPP_URL = 'https://script.google.com/macros/s/XXXXX/exec';

function sendToGAS(idiom, meaning) {
  return fetch(GAS_WEBAPP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idiom: idiom, meaning: meaning })
  }).then(res => res.json());
}

// 使用範例：在新增成語成功後
sendToGAS('臥虎藏龍', '比喻文人倜儻不羈，懷才不遇。')
  .then(r => console.log('GAS 回應', r))
  .catch(e => console.warn('GAS 錯誤', e));
```

說明：
- 簡潔的 `fetch` POST JSON 到 GAS，GAS 回傳 JSON。

2) Google Apps Script（精簡版本）

在 https://script.google.com 新增一個專案，貼上以下程式碼，並將 `SPREADSHEET_ID` 改為你的試算表 ID，另外可修改 `SHEET_NAME`：

```javascript
// Google Apps Script - doPost 接收並寫入試算表
var SPREADSHEET_ID = 'REPLACE_WITH_YOUR_SPREADSHEET_ID';
var SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    // 新增一列：時間、成語、解釋
    sheet.appendRow([new Date(), payload.idiom || '', payload.meaning || '']);

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

說明：
- `doPost` 會接受前端 POST 的 JSON，並把資料 append 到指定的試算表。
- 回傳 JSON 讓前端能判斷是否成功。

3) 在 GAS 上部署為 Web App

步驟：
1. 在 Google Apps Script 編輯器中，貼上上面的程式碼，儲存專案。
2. 點選「部署」→「新建部署」（或「部署」→「管理部署」→新增）。
3. 選擇「類型」為「Web 應用程式」。
4. 設定：
   - 描述：任意文字
   - 執行應用程式的身份：選擇你自己（Your account / Me）
   - 有權存取的人：選擇「任何人，包括匿名使用者」或「任何人」，視你需求（若要讓無需登入即可使用，選「任何人，包括匿名使用者」）。
5. 按下「部署」，系統會顯示 Web App 的 URL，複製此 URL。
6. 在 `admin.js` 中把 `GAS_WEBAPP_URL` 設為該 URL。

安全性注意：
- 若你選擇「任何人，包括匿名使用者」，任何知道該 URL 的人皆可呼叫，注意不要把敏感資訊寫入。
- 你也可以把存取權改為只限登入使用者，但前端使用者需登入 Google 帳號且同樣來源有權限。

4) 測試流程

1. 在 `admin.js` 中設定好 `GAS_WEBAPP_URL`。
2. 在瀏覽器打開管理頁面，輸入成語與解釋，點選「新增/儲存」。
3. 檢查瀏覽器開發者工具（Network / Console）是否有成功的 POST 請求與回應。
4. 前往試算表驗證是否新增一列資料。

5) 常見錯誤與排查

- 401 / 403：代表授權問題，請檢查你的部署設定與試算表權限。
- 400 / 500：檢查 GAS `doPost` 是否有拋例外，或在 Console 查看錯誤訊息。
- CORS：GAS 回應 JSON，不需要額外 CORS 設定；若遇到 CORS 錯誤，請確認是否使用了額外 header 或代理。

6) 最精簡的整合範例（前端 + GAS）

前端（`admin.js`）

```javascript
// admin.js
var GAS_WEBAPP_URL = 'https://script.google.com/macros/s/XXXXX/exec';

function sendToGAS(idiom, meaning) {
  return fetch(GAS_WEBAPP_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idiom: idiom, meaning: meaning })
  }).then(r => r.json());
}

// 在新增成功後呼叫：
sendToGAS(idiom, meaning).then(console.log).catch(console.warn);
```

GAS

```javascript
var SPREADSHEET_ID = 'REPLACE_WITH_YOUR_SPREADSHEET_ID';
function doPost(e) {
  var p = JSON.parse(e.postData.contents);
  SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0].appendRow([new Date(), p.idiom, p.meaning]);
  return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
}
```

結語

以上為最精簡、可立即上手的作法；如需加入驗證（例如 Token）、限制存取或回傳更完整的錯誤資訊，可在 GAS 中加上簡單的檢查邏輯，並在前端加入重試或錯誤提示。
