import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { imageBase64, provider, modelName } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ success: false, error: '未接收到圖片，請確認是否已選擇檔案。' }, { status: 400 });
    }

    // ==========================================
    // 🧠 核心功能：金鑰辨識與讀取 (.env)
    // ==========================================
    const geminiKey = process.env.GEMINI_API_KEY;
    const nvidiaKey = process.env.NVIDIA_API_KEY;

    let activeKey = null;
    if (provider === 'gemini') activeKey = geminiKey;
    if (provider === 'nvidia') activeKey = nvidiaKey;

    if (!activeKey) {
      console.warn(`[系統提示] 尚未設定 ${provider.toUpperCase()} API 金鑰。`);
    }

    // ==========================================
    // 模擬 AI 處理時間 (1.5秒)
    // ==========================================
    await new Promise(resolve => setTimeout(resolve, 1500));

    // ==========================================
    // 📊 模擬 AI 解析出來的陣列 (請在此替換為真實 AI 解析邏輯)
    // 為了讓您測試前端的「手動編輯」功能，我們預設回傳兩筆範例
    // ==========================================
    const parsedData = [
      { id: 'tmp_1', date: '2026-08-25', name: '陳建邦', shift: '早班', location: '屏東竹田店', time: '08:00-16:00' },
      { id: 'tmp_2', date: '2026-08-25', name: '林毅傑', shift: '晚班', location: '屏東竹田店', time: '16:00-24:00' },
      { id: 'tmp_3', date: '2026-08-26', name: '王紫齡', shift: '未知', location: '屏東竹田店', time: '需確認' } // 故意留錯讓人工修改
    ];

    return NextResponse.json({
      success: true,
      message: `✅ AI 解析完成！(品牌: ${provider.toUpperCase()} | 模型: ${modelName})`,
      data: parsedData
    });

  } catch (error) {
    console.error('API 錯誤:', error);
    return NextResponse.json(
      { success: false, error: `伺服器處理失敗：${error.message}` },
      { status: 500 }
    );
  }
}
