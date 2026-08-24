import { NextResponse } from 'next/server';

const NVIDIA_API_KEY = "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";

export async function POST(request) {
  try {
    const { imageBase64, modelCode } = await request.json();
    const selectedModel = modelCode || "meta/llama-3.2-90b-vision-instruct";

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "請精確解析這張蝦皮門市班表圖片（如早班、晚班排班表）。請擷取所有人員排班資料，包含日期(YYYY-MM-DD格式)、姓名、班別、地點、時間。請務必僅回傳純 JSON 陣列格式，結構如：[{\"date\": \"2026-08-24\", \"name\": \"陳建邦\", \"shiftType\": \"PT/晚班\", \"location\": \"愛國/四維\", \"time\": \"1900-2200\"}]"
              },
              {
                type: "image_url",
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        max_tokens: 3072,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ success: false, error: `Nvidia API 錯誤: ${errText}` }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "[]";
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const schedules = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
