import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { imageBase64, provider, modelName } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: '找不到圖片資料' }, { status: 400 });
    }

    // ==========================================
    // 🧠 核心功能：金鑰自動辨識讀取 (.env)
    // 這裡會依照前端傳來的品牌，自動抓取系統環境變數中對應的 API KEY
    // ==========================================
    const geminiKey = process.env.GEMINI_API_KEY;
    const nvidiaKey = process.env.NVIDIA_API_KEY;

    let activeKey = null;
    if (provider === 'gemini') activeKey = geminiKey;
    if (provider === 'nvidia') activeKey = nvidiaKey;

    if (!activeKey) {
      return NextResponse.json({ 
        error: `伺服器環境變數 (.env) 尚未設定 ${provider.toUpperCase()} 引擎的 API 金鑰` 
      }, { status: 500 });
    }

    console.log(`[Shopee Rush AI] 啟動成功！品牌：${provider} | 模型：${modelName} | 金鑰已自動掛載`);

    // ==========================================
    // ▼ 未來您可以在此處實作 fetch 呼叫 AI 的實際邏輯 ▼
    // 取得 AI 回傳的 JSON 後，可以直接將結構整理好回傳給前端
    // ==========================================

    return NextResponse.json({
      success: true,
      message: `已成功使用 ${modelName} 進行預備解析通道`,
      data: [] // 未來把解析出來的排班陣列放在這裡
    });

  } catch (error) {
    console.error('API 解析錯誤:', error);
    return NextResponse.json(
      { error: '伺服器內部錯誤，請檢查主控台日誌。' },
      { status: 500 }
    );
  }
}
