'use client';
import React, { useState } from 'react';

export default function Home() {
  const [provider, setProvider] = useState('nvidia');
  const [modelName, setModelName] = useState('nvidia/llama-3.2-90b-vision-instruct');
  const [imageBase64, setImageBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 處理圖片上傳
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 提交解析
  const handleParse = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch('/api/parse-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, provider, modelName })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '解析失敗');

      setSuccessMsg(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* 頂部導覽列 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-orange-600">📦 Shopee Rush</h1>
        </div>
        <div className="flex border-t border-gray-100 max-w-md mx-auto">
          <button className="flex-1 py-3 text-sm font-semibold text-orange-600 border-b-2 border-orange-600">今日班表</button>
          <button className="flex-1 py-3 text-sm font-semibold text-gray-500">本週班表</button>
          <button className="flex-1 py-3 text-sm font-semibold text-gray-500">後台管理</button>
        </div>
      </header>

      {/* 主要內容區 */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        
        {/* 錯誤或成功提示 */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-red-700 text-sm shadow-sm">
            <span className="font-bold">❌ 錯誤：</span>{error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg text-green-700 text-sm shadow-sm">
            {successMsg}
          </div>
        )}

        {/* AI 解析卡片 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 space-y-4">
          <h2 className="text-base font-bold text-orange-700 flex items-center gap-1.5">
            ✨ AI 班表圖片解析 (支援矩陣對齊與防漏機制)
          </h2>

          {/* 供應商選擇 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">AI 服務供應商</label>
            <select 
              value={provider} 
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="nvidia">Nvidia NIM</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          {/* 模型名稱輸入框（已修正寬度與適合的字體大小，避免截斷） */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">模型名稱</label>
            <input 
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 truncate"
              placeholder="輸入模型名稱..."
            />
          </div>

          {/* 檔案上傳 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">上傳班表圖片</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
            />
          </div>

          {/* 解析按鈕 */}
          <button 
            onClick={handleParse}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:from-orange-600 hover:to-amber-600 transition-all text-sm disabled:opacity-50"
          >
            {loading ? '⏳ 正在精準解析中...' : '🚀 開始精準解析'}
          </button>
        </div>

      </div>
    </main>
  );
}
