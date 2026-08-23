import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageBase64, modelName, provider } = await req.json();
    
    // 自動讀取同品牌金鑰 (部署至 Vercel 時需在 Environment Variables 設定)
    const apiKey = provider === 'NVIDIA' ? process.env.NVIDIA_API_KEY : process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API Key is missing in backend' }, { status: 500 });
    }

    // 模擬 2026 AI 影像轉 Excel 陣列邏輯，支援自訂模型代碼
    console.log(`[Backend API] 使用提供者: ${provider}, 模型代碼: ${modelName}`);

    // 此處為模擬 AI 成功解析班表的資料結構 (可替換為實際 API Fetch)
    const parsedData = [
      { id: Date.now().toString() + '1', date: '2026-08-22', name: '王小明', shift: '早班', location: '屏東潮州店', time: '08:00-17:00' },
      { id: Date.now().toString() + '2', date: '2026-08-22', name: '李大華', shift: '晚班', location: '屏東潮州店', time: '14:00-23:00' }
    ];

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    return NextResponse.json({ error: 'Image parsing failed' }, { status: 500 });
  }
}

