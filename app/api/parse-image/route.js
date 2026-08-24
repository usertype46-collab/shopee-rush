import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// ==============================================================================
// 🔌 初始化 Firebase 讀取金鑰 (若尚未初始化)
// ==============================================================================
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseDb() {
  if (!firebaseConfig.projectId) return null;
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  return getFirestore(app);
}

// 從 Firestore 讀取設定或金鑰
async function fetchKeyFromFirebase(provider) {
  try {
    const db = getFirebaseDb();
    if (!db) return null;

    // 假設您的設定存在 settings/apikeys 或 settings/config 文件中
    const docRef = doc(db, 'settings', 'config');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (provider === 'gemini') {
        return data.geminiApiKey || data.GEMINI_API_KEY || null;
      } else if (provider === 'nvidia') {
        return data.nvidiaApiKey || data.NVIDIA_API_KEY || null;
      }
    }
  } catch (err) {
    console.warn('從 Firebase 讀取金鑰失敗，將改用環境變數:', err);
  }
  return null;
}

// ==============================================================================
// 🧠 核心 SYSTEM PROMPT (矩陣對齊與防漏機制)
// ==============================================================================
const SYSTEM_PROMPT = `
你是一個極度精準且嚴謹的班表圖像 OCR 與結構化解析 AI 助手。
請仔細辨識圖片中排班表矩陣，輸出嚴格的 JSON 格式。
【重要規範】：請直接輸出純 JSON 物件，絕對不要加上任何 markdown 程式碼區塊標記（如 \`\`\`json 甚至是 \`\`\`），也不要在 JSON 前後夾雜任何說明文字。

【絕對鐵律 - 矩陣強制對齊，徹底消滅錯位與漏抓】：
1. **動態日期識別**：請精確讀取圖片頂部標題列的 7 個實際日期（例如 8月24日、8月25日...），存入 dates 陣列。必須剛好是 7 個日期。
2. **欄位略過與精準對應**：
   - 表格欄位依序為：【班別】、【門市人員】、【狀態 (如: 支援、實習)】、接著是【7天日期格子】。
   - 掃描每一列有人名的資料。若該列【門市人員】欄位為空白，請直接忽略該列！
   - 請特別注意：【狀態】欄位（例如「支援」、「實習」）是獨立欄位，絕對不可將其誤認為 7 天內的排班內容。直接略過狀態欄，往右精準對應 7 天的排班格子。
3. **人員完整涵蓋強制規定（含特別注意名單）**：
   - 絕對不可遺漏任何有填寫名字的列。
   - 對於排班記錄較為特殊或含有間隔空白與非連續排班的列，必須精確逐日對應，空白處填入 "無排班"，不得隨意略過或刪減陣列長度。
4. **狀態嚴格對應 (強制 7 個元素)**：每位人員的 statuses 陣列必須絕對等於 7 個元素，嚴格對應 dates 的順序。
5. **空白格與無排班處理**：若該天儲存格完全空白（無字），對應的陣列位置請務必填入 "無排班"。
6. 【單字/雙字判讀】：如「休」，填入 "休"；如「指休」，填入 "指休"。
7. 【多字含時間】：如「中洲/光春 1830~2230」，請完整提取字串。特別注意字型差異。

強制輸出的 JSON 結構範例 (必須包含 dates 與 records 兩個 key，且不要有任何多餘文字)：
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

    const currentProvider = provider || 'gemini';

    // 優先從 Firebase 讀取金鑰，若無則讀取環境變數
    let activeKey = await fetchKeyFromFirebase(currentProvider);
    if (!activeKey) {
      if (currentProvider === 'gemini') {
        activeKey = process.env.GEMINI_API_KEY;
      } else if (currentProvider === 'nvidia') {
        activeKey = process.env.NVIDIA_API_KEY;
      }
    }

    if (!activeKey) {
      return NextResponse.json({ 
        success: false, 
        error: `找不到 ${currentProvider.toUpperCase()} API 金鑰。請確認已寫入 Firebase 設定或 Vercel 環境變數中。` 
      }, { status: 500 });
    }

    let responseText = '';

    // ==========================================
    // 🚀 1. 支援 Gemini 官方 API (原生 Fetch)
    // ==========================================
    if (currentProvider === 'gemini') {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const targetModel = modelName || 'gemini-1.5-pro';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${activeKey}`;
      
      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT },
                { inline_data: { mime_type: 'image/jpeg', data: base64Data } }
              ]
            }
          ]
        })
      });

      const resultJson = await apiResponse.json();
      if (!apiResponse.ok) {
        throw new Error(resultJson.error?.message || 'Gemini API 呼叫失敗');
      }

      responseText = resultJson.candidates?.[0]?.content?.parts?.[0]?.text;
    } 
    // ==========================================
    // 🚀 2. 支援 Nvidia NIM 視覺模型 API
    // ==========================================
    else if (currentProvider === 'nvidia') {
      const targetModel = modelName || 'nvidia/llama-3.2-90b-vision-instruct';
      const endpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';

      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: SYSTEM_PROMPT },
                { type: 'image_url', image_url: { url: imageBase64 } }
              ]
            }
          ],
          max_tokens: 4096,
          temperature: 0.1
        })
      });

      const resultJson = await apiResponse.json();
      if (!apiResponse.ok) {
        throw new Error(resultJson.error?.message || 'Nvidia NIM API 呼叫失敗');
      }

      responseText = resultJson.choices?.[0]?.message?.content;
    } else {
      throw new Error('未知的 AI 服務供應商');
    }

    if (!responseText) {
      throw new Error('AI 未能回傳有效的解析內容');
    }

    // ==========================================
    // 🛡️ 強固的 JSON 擷取與清洗機制
    // ==========================================
    let parsedJson;
    try {
      parsedJson = JSON.parse(responseText.trim());
    } catch (e1) {
      try {
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedJson = JSON.parse(cleaned);
      } catch (e2) {
        const firstOpen = responseText.indexOf('{');
        const lastClose = responseText.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
          const jsonSubstring = responseText.substring(firstOpen, lastClose + 1);
          try {
            parsedJson = JSON.parse(jsonSubstring);
          } catch (e3) {
            console.error('AI 原始回傳內容:', responseText);
            throw new Error('無法從 AI 回傳內容中萃取有效 JSON');
          }
        } else {
          console.error('AI 原始回傳內容:', responseText);
          throw new Error('AI 回傳格式異常，找不到合法的 JSON 結構');
        }
      }
    }

    // ==========================================
    // 🔄 將 7 天矩陣攤平轉換為資料庫條目
    // ==========================================
    const flatData = [];
    const currentYear = new Date().getFullYear();
    let idCounter = 1;

    if (parsedJson && parsedJson.dates && parsedJson.records) {
      parsedJson.records.forEach(record => {
        if (record.statuses && Array.isArray(record.statuses)) {
          record.statuses.forEach((status, index) => {
            if (status && status !== "無排班" && status !== "") {
              
              let location = status;
              let time = "";
              const spaceIndex = status.lastIndexOf(" ");
              
              if (spaceIndex !== -1 && /\d/.test(status.substring(spaceIndex))) {
                location = status.substring(0, spaceIndex).trim();
                time = status.substring(spaceIndex + 1).trim();
              }

              const dateStr = parsedJson.dates[index] || '';
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
        }
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
      { success: false, error: error.message || 'AI 辨識失敗或伺服器錯誤' },
      { status: 500 }
    );
  }
}
