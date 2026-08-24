'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue, push, remove } from 'firebase/database';

export default function Manage() {
  const [shifts, setShifts] = useState([]);
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [shift, setShift] = useState('');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');

  // AI 相關狀態
  const [provider, setProvider] = useState('gemini');
  const [modelName, setModelName] = useState('gemini-1.5-pro-vision');
  const [imageFile, setImageFile] = useState(null);
  
  // 新增：解析狀態與暫存編輯區
  const [parseLog, setParseLog] = useState({ status: 'idle', msg: '' });
  const [stagedData, setStagedData] = useState([]);

  // 自動辨識與切換模型代碼
  useEffect(() => {
    if (provider === 'gemini') setModelName('gemini-1.5-pro-vision');
    else if (provider === 'nvidia') setModelName('nvidia/llama-3.2-90b-vision-instruct');
  }, [provider]);

  useEffect(() => {
    const shiftsRef = ref(db, 'shifts');
    onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shiftsArray = Object.entries(data).map(([id, val]) => ({ id這是一個非常實用的系統需求。因為我不確定你實際使用的後端語言（Python、C# 或 Node.js）以及 OCR 辨識模型，我為你撰寫了一套**單一檔案即可執行的網頁前端（HTML/CSS/JavaScript）完整代碼**。

這份代碼能讓你在瀏覽器中直接點開測試所有你要求的 UI 功能與邏輯，後續你只需將其與你的後端 API（如 OpenCV、Tesseract 或 OpenAI Vision）串接即可。

### 系統功能實作說明

*   **模型代碼輸入與自動辨識**：提供專用的文字輸入區，並具備簡單的正則表達式（Regex）邏輯來判斷你輸入的是 Python、JSON 或一般文本。
*   **手動編輯班表**：解析後的班表會以 HTML5 的 `contenteditable` 表格呈現，點擊任何儲存格即可像 Excel 一樣直接修改。
*   **完整性檢查**：自動掃描表格，若有空白（漏辨識）的欄位會以紅色高亮標示，並阻擋後續送出。
*   **詳細訊息框**：以模擬終端機（Console）風格呈現的文字方塊，無論是解析成功、失敗、或是系統錯誤，都會附帶時間戳記輸出於此。

---

### 完整代碼 (HTML/JS)

請將以下程式碼複製並另存為 `index.html`，然後使用任何瀏覽器（Chrome, Edge 等）開啟即可使用：

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>班表解析與模型代碼測試系統</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f9f9f9; }
        .container { max-width: 900px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h2 { border-bottom: 2px solid #0078D7; padding-bottom: 10px; color: #333; }
        .section { margin-bottom: 20px; }
        textarea { width: 100%; height: 100px; padding: 10px; box-sizing: border-box; font-family: monospace; }
        button { padding: 8px 16px; background-color: #0078D7; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 5px; }
        button:hover { background-color: #005A9E; }
        
        /* 班表表格樣式 */
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ccc; padding: 10px; text-align: center; }
        th { background-color: #eee; }
        td[contenteditable="true"] { background-color: #fffaf0; cursor: text; transition: background 0.3s; }
        td[contenteditable="true"]:hover { background-color: #fff0d4; }
        td.error { background-color: #ffcccc !important; border: 2px solid red; }
        
        /* 訊息框樣式 */
        .log-box { width: 100%; height: 150px; background-color: #1e1e1e; color: #4af626; font-family: monospace; padding: 10px; overflow-y: auto; box-sizing: border-box; border-radius: 4px; margin-top: 5px; }
    </style>
</head>
<body>

<div class="container">
    <h2>🤖 模型代碼與班表解析系統</h2>

    <!-- 1. 模型代碼輸入區 -->
    <div class="section">
        <h3>1. 模型代碼輸入</h3>
        <textarea id="modelCode" placeholder="請貼上你的模型參數、JSON 設定或 Python 代碼..."></textarea>
        <button onclick="autoRecognizeCode()">自動辨識代碼格式</button>
        <span id="codeTypeBadge" style="margin-left: 10px; font-weight: bold; color: #0078D7;"></span>
    </div>

    <!-- 2. 圖片上傳與解析 -->
    <div class="section">
        <h3>2. 班表圖片上傳</h3>
        <input type="file" id="imageInput" accept="image/*">
        <button onclick="parseImage()">執行編譯與解析</button>
    </div>

    <!-- 3. 解析結果與手動編輯區 -->
    <div class="section">
        <h3>3. 解析結果 (點擊儲存格可直接修改)</h3>
        <table id="scheduleTable">
            <thead>
                <tr>
                    <th>員工姓名</th>
                    <th>星期一</th>
                    <th>星期二</th>
                    <th>星期三</th>
                    <th>星期四</th>
                    <th>星期五</th>
                </tr>
            </thead>
            <tbody id="scheduleBody">
                <!-- 預設為空，解析後由 JS 填入 -->
            </tbody>
        </table>
        <br>
        <button onclick="checkCompleteness()" style="background-color: #28a745;">檢查解析完整性</button>
    </div>

    <!-- 4. 詳細訊息框 -->
    <div class="section">
        <h3>4. 編譯與解析詳細訊息框</h3>
        <div id="logBox" class="log-box">系統已啟動，等待操作...<br></div>
    </div>
</div>

<script>
    // --- 日誌系統 ---
    function logMessage(msg, isError = false) {
        const logBox = document.getElementById('logBox');
        const time = new Date().toLocaleTimeString();
        const color = isError ? '#ff4d4d' : '#4af626';
        logBox.innerHTML += `<span style="color: ${color}">[${time}] ${msg}</span><br>`;
        logBox.scrollTop = logBox.scrollHeight;
    }

    // --- 1. 自動辨識代碼 ---
    function autoRecognizeCode() {
        const code = document.getElementById('modelCode').value.trim();
        const badge = document.getElementById('codeTypeBadge');
        if (!code) {
            logMessage("代碼輸入區為空，無法辨識。", true);
            badge.innerText = "";
            return;
        }
        
        // 簡單的正則表達式判斷格式
        if (code.startsWith('{') || code.startsWith('[')) {
            badge.innerText = "👉 辨識結果：JSON 格式";
            logMessage("成功辨識代碼：JSON 配置檔");
        } else if (code.includes('def ') || code.includes('import ')) {
            badge.innerText = "👉 辨識結果：Python 代碼";
            logMessage("成功辨識代碼：Python 腳本");
        } else {
            badge.innerText = "👉 辨識結果：一般純文本";
            logMessage("成功辨識代碼：一般文本");
        }
    }

    // --- 2. 模擬解析圖片 ---
    function parseImage() {
        const fileInput = document.getElementById('imageInput');
        if (fileInput.files.length === 0) {
            logMessage("【失敗】請先選擇班表圖片！", true);
            return;
        }

        logMessage("開始上傳圖片...");
        logMessage("編譯中... 呼叫 OCR 辨識模型...");
        
        // 模擬異步 API 呼叫延遲
        setTimeout(() => {
            // 模擬解析成功與失敗的機率
            const isSuccess = Math.random() > 0.2; 
            if (isSuccess) {
                logMessage("【成功】圖片解析完成，已載入班表資料。");
                renderMockData();
            } else {
                logMessage("【失敗】圖片模糊或模型超時，請重新解析！", true);
                document.getElementById('scheduleBody').innerHTML = "";
            }
        }, 1500);
    }

    // 渲染模擬解析出來的數據（帶有故意留白供測試）
    function renderMockData() {
        const tbody = document.getElementById('scheduleBody');
        tbody.innerHTML = "";
        
        const mockData = [
            ["王小明", "早班", "晚班", "休假", "早班", "早班"],
            ["李大華", "晚班", "", "晚班", "休假", "晚班"], // 故意留空
            ["陳阿姨", "休假", "早班", "早班", "", "休假"]   // 故意留空
        ];

        mockData.forEach(row => {
            let tr = document.createElement('tr');
            row.forEach(cell => {
                let td = document.createElement('td');
                td.innerText = cell;
                td.setAttribute('contenteditable', 'true'); // 允許手動直接編輯
                // 當使用者修改時，移除錯誤標示
                td.addEventListener('input', function() {
                    this.classList.remove('error');
                });
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }

    // --- 3. 檢查完整性 ---
    function checkCompleteness() {
        const tbody = document.getElementById('scheduleBody');
        const cells = tbody.querySelectorAll('td');
        
        if (cells.length === 0) {
            logMessage("【警告】目前沒有班表資料可檢查！", true);
            return;
        }

        let hasError = false;
        let missingCount = 0;

        cells.forEach(cell => {
            if (cell.innerText.trim() === "") {
                cell.classList.add('error');
                hasError = true;
                missingCount++;
            } else {
                cell.classList.remove('error');
            }
        });

        if (hasError) {
            logMessage(`【檢查失敗】發現 ${missingCount} 個欄位未填寫或辨識遺漏，請手動點擊紅框修改！`, true);
        } else {
            logMessage("【檢查通過】班表完整性 100%，無遺漏欄位！");
        }
    }
</script>
</body>
</html>
