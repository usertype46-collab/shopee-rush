import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ==============================================================================
// 🧠 核心 SYSTEM PROMPT (加入您的強固防漏機制)
// ==============================================================================
const SYSTEM_PROMPT = `
你是一個極度精準且嚴謹的班表圖像 OCR 與結構化解析 AI 助手。
請仔細辨識圖片中排班表矩陣，輸出嚴格的 JSON 格式，禁止輸出任何 Markdown 標記或說明文字。

【絕對鐵律 - 矩陣強制對齊，徹底消滅錯位與漏抓】：
1. **動態日期識別**：請精確讀取圖片頂部標題列的 7 個實際日期（例如 8月24日、8月25日...），存入 \`dates\` 陣列。必須剛好是 7 個日期。
2. **欄位略過與精準對應**：
   - 表格欄位依序為：【班別】、【門市人員】、【狀態 (如: 支援、實習)】、接著是【7天日期格子】。
   - 掃描每一列有人名的資料。若該列【門市人員】欄位為空白，請直接忽略該列！
   - 請特別注意：【狀態】欄位（例如「支援」、「實習」）是獨立欄位，絕對不可將其誤認為 7 天內的排班內容。直接略過狀態欄，往右精準對應 7 天的排班格子。
3. **人員完整涵蓋強制規定（含特別注意名單）**：
   - 絕對不可遺漏任何有填寫名字的列。
   - 對於排班記錄較為特殊或含有間隔空白與非連續排班的列，必須精確逐日對應，空白處填入 "無排班"，不得隨意略過或刪減陣列長度。
4. **狀態嚴格對應 (強制 7 個元素)**：每位人員的 \`statuses\` 陣列必須絕對等於 7 個元素，嚴格對應 \`dates\` 的順序。
5. **空白格與無排班處理**：若該天儲存格完全空白（無字），對應的陣列位置請務必填入 "無排班"。
6. 【單字/雙字判讀】：如「休」，填入 "休"；如「指休」，填入 "指休"。
7. 【多字含時間】：如「中洲/光春 1830~2230」，請完整提取字串。特別注意字型差異。

強制輸出的 JSON 結構範例 (必須包含 dates 與 records 兩個 key)：
{
  "dates": ["8月24日", "8月25日", "8月26日", "8月27日", "8月28日", "8月29日", "8月30日"],
  "records": [
    {
      "shift": "PT/晚班",
      "name": "陳建邦",
      "statuses": ["指休", "指休", "愛國/四維 1900-2200", "指休", "指休", "指休", "文化/延平 1900-2200"]
    }
  ]
}
`;

export async function POST(req) {
  try {
    const { imageBase64, provider, modelName } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: '未接收到圖片。' }, { status: 400 });
    }

    // 取得金鑰
    const geminiKey = process.env.GEMINI_API_KEY;
    const nvidiaKey = process.env.NVIDIA_API_KEY;

    let activeKey = provider === 'gemini' ? geminiKey : nvidiaKey;
    if (!activeKey) {
      return NextResponse.json({ success: false, error: `伺服器未設定 ${provider.toUpperCase()} API 金鑰` }, { status: 500 });
    }

    let parsedJson = null;

    // ==========================================
    // 🚀 執行 AI 解析 (Gemini 流程)
    // ==========================================
    if (provider === 'gemini') {
      const genAI = new GoogleGenerativeAI(activeKey);
      const model = genAI.getGenerativeModel({ model: modelName || 'gemini-1.5-pro' });

      // 移除 Base64 標頭 (data:image/jpeg;base64,)
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      
      const imagePart = {
        inlineData: { data: base64Data, mimeType: "image/jpeg" },
      };

      const result = await model.generateContent([SYSTEM_PROMPT, imagePart]);
      const responseText = result.response.text();
      
      // 清除可能包含的 Markdown 格式，確保是純 JSON
      const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedJson = JSON.parse(cleanJsonStr);
    } 
    // ==========================================
    // 🚀 執行 AI 解析 (Nvidia / OpenAI 相容流程)
    // ==========================================
    else if (provider === 'nvidia') {
      // 這裡預留給 Nvidia NIM 的標準 OpenAI Fetch 格式
      // 若您之後有 NIM 的 Endpoint 可以直接替換 URL
      throw new Error("Nvidia 串接尚未啟用，目前預設使用 Gemini 模型作為展示。");
    }

    // ==========================================
    // 🔄 資料轉換演算法：將 7 天矩陣攤平為資料庫條目
    // ==========================================
    const flatData = [];
    const currentYear = new Date().getFullYear(); // 預設使用今年
    let idCounter = 1;

    if (parsedJson && parsedJson.dates && parsedJson.records) {
      parsedJson.records.forEach(record => {
        record.statuses.forEach((status, index) => {
          if (status && status !== "無排班" && status !== "") {
            
            // 處理時間與地點 (例如 "中洲/光春 1830~2230")
            let location = status;
            let time = "";
            const spaceIndex = status.lastIndexOf(" ");
            
            // 如果最後有空格且後面跟著數字，判定為時間
            if (spaceIndex !== -1 && /\d/.test(status.substring(spaceIndex))) {
              location = status.substring(0, spaceIndex).trim();
              time = status.substring(spaceIndex + 1).trim();
            }

            // 處理日期格式 (將 "8月24日" 轉為 "2026-08-24")
            const dateStr = parsedJson.dates[index];
            const match = dateStr.match(/(\d+)月(\d+)日/);
            let formattedDate = dateStr;
            if (match) {
               const m = match[1].padStart(2, '0');
               const d = match[2].padStart(2, '0');
               formattedDate = `${currentYear}-${m}-${d}`;
            }

            flatData.push({
              id: `tmp_ai_${Date.now()}_${idCounter++}`,
              date: formattedDate,
              name: record.name,
              shift: record.shift || '未知',
              location: location,
              time: time
            });
          }
        });
      });
    }

    return NextResponse.json({
      success: true,
      message: `✅ AI 解析完成！共提取出 ${flatData.length} 筆有效排班。`,
      data: flatData
    });

  } catch (error) {
    console.error('AI 解析詳細錯誤:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI 辨識失敗或 JSON 格式錯誤' },
      { status: 500 }
    );
  }
}
