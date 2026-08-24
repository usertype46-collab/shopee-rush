'use client';
import React, { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'weekly' | 'admin'
  const [provider, setProvider] = useState('nvidia');
  const [modelName, setModelName] = useState('nvidia/llama-3.2-90b-vision-instruct');
  const [imageBase64, setImageBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // 儲存解析後的班表資料
  const [shifts, setShifts] = useState([]);

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

  // 提交 AI 解析
  const handleParse = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      if (!imageBase64) {
        throw new Error('請先選擇一張班表圖片');
      }

      const res = await fetch('/api/parse-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, provider, modelName })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '解析失敗');

      setSuccessMsg(data.message);
      if (data.data && Array.isArray(data.data)) {
        setShifts(data.data);
        setActiveTab('today'); // 解析完自動切回今日班表查看結果
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 取得今天的日期格式 (YYYY-MM-DD)
  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();
  const todayShifts = shifts.filter(item => item.date === todayStr);

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50/50 via-gray-50 to-amber-50/30 pb-16 text-gray-800">
      
      {/* 頂部導覽列 (Sticky 質感玻璃擬態) */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-orange-100/60">
        <div className="max-w-md mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 font-black text-lg">
              ⚡
            </div>
            <div>
              <h1 className="text-base font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Shopee Rush
              </h1>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">智慧排班管理系統</p>
            </div>
          </div>
          <div className="text-xs font-semibold bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-100">
            v2.6 Pro
          </div>
        </div>

        {/* 分頁切換按鈕區 */}
        <div className="flex max-w-md mx-auto px-2 pb-1 gap-1">
          <button 
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'today' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <span>📅</span> 今日班表
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'weekly' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <span>📊</span> 本週總覽
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === 'admin' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <span>⚙️</span> AI 後台
          </button>
        </div>
      </header>

      {/* 主要內容區 */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        
        {/* 系統提示訊息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-700 text-xs shadow-sm flex items-start gap-3 animate-pulse">
            <span className="text-base">❌</span>
            <div className="flex-1 leading-relaxed"><span className="font-bold">發生錯誤：</span>{error}</div>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-700 text-xs shadow-sm flex items-start gap-3">
            <span className="text-base">✨</span>
            <div className="flex-1 leading-relaxed font-medium">{successMsg}</div>
          </div>
        )}

        {/* ================= 1. 今日班表頁面 ================= */}
        {activeTab === 'today' && (
          <div className="space-y-3">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-100/80 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                    今日即時班表
                  </h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">即時掌握今日人員出勤與排班狀況</p>
                </div>
                <span className="text-xs font-bold bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl border border-orange-100">
                  {todayStr}
                </span>
              </div>

              {todayShifts.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
                  <div className="text-3xl">📭</div>
                  <div className="text-sm font-bold text-gray-600">今日尚無排班資料</div>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                    請前往 <span className="text-orange-500 font-semibold">AI 後台</span> 上傳班表圖片，系統將自動為您解析今日排班。
                  </p>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('admin')}
                    className="mt-2 inline-block bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-orange-500/20"
                  >
                    立即去上傳解析 🚀
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {todayShifts.map((item, idx) => (
                    <div key={item.id || idx} className="p-3.5 bg-gradient-to-r from-orange-50/60 to-white border border-orange-100/80 rounded-2xl flex justify-between items-center shadow-xs transition-transform active:scale-[0.99]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-sm shadow-inner">
                          {item.name ? item.name.charAt(0) : '員'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                          <div className="text-xs text-orange-600 font-semibold mt-0.5 flex items-center gap-1">
                            <span>📍 {item.location}</span>
                            {item.time && <span className="text-gray-400 font-normal">({item.time})</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-xl font-bold shadow-sm shadow-orange-500/20">
                        {item.shift}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= 2. 本週總覽頁面 ================= */}
        {activeTab === 'weekly' && (
          <div className="space-y-3">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-100/80 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-sm font-extrabold text-gray-800">📊 本週所有班表彙整</h2>
                  <p className="text-[11px] text-gray-400 mt-0.5">完整檢視所有已解析的排班項目</p>
                </div>
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-xl">
                  共 {shifts.length} 筆
                </span>
              </div>

              {shifts.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3 bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
                  <div className="text-3xl">📂</div>
                  <div className="text-sm font-bold text-gray-600">尚無任何班表資料</div>
                  <p className="text-xs text-gray-400">請先透過 AI 後台上傳並解析圖片。</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {shifts.map((item, idx) => (
                    <div key={item.id || idx} className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-2xl flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          {item.name} 
                          <span className="text-[11px] font-normal text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                            {item.date}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 font-medium">
                          📍 {item.location} {item.time && <span className="text-gray-400">({item.time})</span>}
                        </div>
                      </div>
                      <div className="text-xs bg-gray-800 text-white px-2.5 py-1.5 rounded-xl font-semibold">
                        {item.shift}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= 3. AI 後台解析頁面 ================= */}
        {activeTab === 'admin' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-orange-100/80 space-y-4">
            <div>
              <h2 className="text-sm font-extrabold text-gray-800 flex items-center gap-1.5">
                <span>✨</span> AI 智慧班表圖片解析
              </h2>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                支援矩陣對齊與防漏機制，自動精準辨識班表並轉化為結構化數據。
              </p>
            </div>

            {/* 供應商選擇 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600">AI 服務供應商</label>
              <select 
                value={provider} 
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-3 text-xs sm:text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              >
                <option value="nvidia">Nvidia NIM (Llama 3.2 Vision)</option>
                <option value="gemini">Google Gemini (Gemini 1.5 Pro)</option>
              </select>
            </div>

            {/* 模型名稱輸入框 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600">模型名稱</label>
              <input 
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-3 text-xs sm:text-sm text-gray-800 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder="輸入模型名稱..."
              />
            </div>

            {/* 檔案上傳區塊 */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600">上傳班表圖片</label>
              <div className="relative border-2 border-dashed border-orange-200 bg-orange-50/30 rounded-2xl p-4 text-center hover:bg-orange-50/60 transition-all cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1 pointer-events-none">
                  <div className="text-2xl">📸</div>
                  <div className="text-xs font-bold text-orange-600">
                    {imageBase64 ? '已成功選擇圖片 (點擊可更換)' : '點擊或拖曳上傳班表照片'}
                  </div>
                  <div className="text-[10px] text-gray-400">支援 JPG, PNG 格式</div>
                </div>
              </div>
            </div>

            {/* 解析按鈕 */}
            <button 
              type="button"
              onClick={handleParse}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>正在精準矩陣解析中...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>開始精準解析班表</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
