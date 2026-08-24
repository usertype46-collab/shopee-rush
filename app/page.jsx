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
        throw new Error('請先選擇一張班表圖片，才能進行解析喔！');
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
    <main className="min-h-screen bg-[#F8FAFC] pb-20 text-slate-800 font-sans selection:bg-orange-200">
      
      {/* 🚀 頂部導覽列 (App 風格) */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 pt-safe-top shadow-sm">
        <div className="max-w-md mx-auto px-5 py-4 flex justify-between items-center">
          {/* Logo 區塊 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <div>
              <h1 className="text-[17px] font-black tracking-tight text-slate-900 leading-none">
                Shopee Rush
              </h1>
              <p className="text-[11px] text-slate-500 font-medium mt-1">AI 智能排班小幫手</p>
            </div>
          </div>
          {/* 版本標籤 */}
          <div className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full tracking-wide">
            PRO 3.0
          </div>
        </div>

        {/* 📱 蘋果風格 Segmented Control (分頁切換) */}
        <div className="max-w-md mx-auto px-5 pb-4">
          <div className="flex p-1 bg-slate-100/80 rounded-2xl">
            {['today', 'weekly', 'admin'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-1.5 ${
                  activeTab === tab 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'today' && '📅 今日'}
                {tab === 'weekly' && '📊 本週'}
                {tab === 'admin' && '⚙️ 後台'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 🧩 主要內容區 */}
      <div className="max-w-md mx-auto px-5 pt-6 space-y-5">
        
        {/* 全局提示訊息 */}
        {error && (
          <div className="bg-red-50/80 border border-red-200/50 p-4 rounded-2xl flex items-start gap-3 backdrop-blur-sm">
            <div className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 text-sm">!</div>
            <div className="flex-1 text-[13px] text-red-700 leading-relaxed font-medium pt-0.5">{error}</div>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50/80 border border-emerald-200/50 p-4 rounded-2xl flex items-start gap-3 backdrop-blur-sm">
            <div className="bg-emerald-100 text-emerald-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 text-sm">✓</div>
            <div className="flex-1 text-[13px] text-emerald-700 leading-relaxed font-medium pt-0.5">{successMsg}</div>
          </div>
        )}

        {/* ================= 1. 今日班表 ================= */}
        {activeTab === 'today' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-end justify-between px-1">
              <div>
                <h2 className="text-lg font-black text-slate-800">今日出勤狀況</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">即時掌握人員排班位置</p>
              </div>
              <div className="text-[11px] font-bold text-slate-400 bg-slate-200/50 px-3 py-1.5 rounded-lg">
                {todayStr}
              </div>
            </div>

            {todayShifts.length === 0 ? (
              <div className="bg-white rounded-[24px] p-8 text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[280px]">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4">
                  ☕
                </div>
                <h3 className="text-[15px] font-bold text-slate-700 mb-2">今天沒有人上班嗎？</h3>
                <p className="text-[13px] text-slate-400 leading-relaxed mb-6 max-w-[200px]">
                  目前系統中找不到今天的排班紀錄。請至後台上傳最新的班表。
                </p>
                <button 
                  onClick={() => setActiveTab('admin')}
                  className="bg-slate-900 text-white text-[13px] font-bold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
                >
                  前往上傳班表
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayShifts.map((item, idx) => (
                  <div key={item.id || idx} className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      {/* 頭像占位符 */}
                      <div className="w-11 h-11 rounded-full bg-orange-50 text-orange-600 font-bold flex items-center justify-center text-lg border border-orange-100 group-hover:scale-105 transition-transform">
                        {item.name ? item.name.charAt(0) : '員'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-[15px]">{item.name}</div>
                        <div className="text-[12px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                          <span className="text-orange-500">📍</span> 
                          {item.location} {item.time && <span className="opacity-60">({item.time})</span>}
                        </div>
                      </div>
                    </div>
                    {/* 班別標籤 */}
                    <div className="text-[12px] bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm">
                      {item.shift}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= 2. 本週總覽 ================= */}
        {activeTab === 'weekly' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-end justify-between px-1">
              <div>
                <h2 className="text-lg font-black text-slate-800">全部班表資料庫</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">已成功解析的所有歷史紀錄</p>
              </div>
              <div className="text-[11px] font-bold text-orange-600 bg-orange-100 px-3 py-1.5 rounded-lg">
                共 {shifts.length} 筆
              </div>
            </div>

            {shifts.length === 0 ? (
               <div className="bg-white rounded-[24px] p-8 text-center shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[280px]">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4">
                 📭
               </div>
               <h3 className="text-[15px] font-bold text-slate-700 mb-2">資料庫空空如也</h3>
               <p className="text-[13px] text-slate-400 leading-relaxed">
                 開始上傳圖片讓 AI 幫您整理數據吧。
               </p>
             </div>
            ) : (
              <div className="bg-white rounded-[24px] p-2 shadow-sm border border-slate-100">
                {shifts.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 border-b border-slate-50 last:border-0 flex justify-between items-center hover:bg-slate-50/50 transition-colors rounded-[16px]">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-800 text-[14px] flex items-center gap-2">
                        {item.name} 
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.date}
                        </span>
                      </div>
                      <div className="text-[12px] text-slate-500 font-medium flex items-center gap-1">
                        <span className="text-slate-300">📍</span> {item.location} {item.time && <span className="opacity-70">({item.time})</span>}
                      </div>
                    </div>
                    <div className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg font-bold border border-slate-200/50">
                      {item.shift}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= 3. AI 後台解析 ================= */}
        {activeTab === 'admin' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="px-1">
              <h2 className="text-lg font-black text-slate-800">AI 視覺解析引擎</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                上傳班表圖片，自動將矩陣影像轉化為結構化數據。
              </p>
            </div>

            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-5">
              
              {/* 供應商選擇 */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 pl-1">大語言模型服務</label>
                <div className="relative">
                  <select 
                    value={provider} 
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3.5 text-[14px] text-slate-700 font-bold appearance-none focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  >
                    <option value="nvidia">🟢 Nvidia NIM (推薦)</option>
                    <option value="gemini">🔵 Google Gemini</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* 模型名稱輸入 */}
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-slate-700 pl-1">精確模型名稱</label>
                <input 
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3.5 text-[13px] text-slate-600 font-mono focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="例如: nvidia/llama-3.2-90b-vision-instruct"
                />
              </div>

              {/* 圖片上傳區塊 (Drag & Drop 風格) */}
              <div className="space-y-2 pt-2">
                <label className="text-[13px] font-bold text-slate-700 pl-1">照片上傳</label>
                <div className="relative border-2 border-dashed border-slate-200 bg-slate-50 rounded-[20px] p-6 text-center hover:bg-orange-50/50 hover:border-orange-200 transition-all cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="space-y-2 pointer-events-none">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl mx-auto shadow-sm group-hover:scale-110 transition-transform duration-300">
                      {imageBase64 ? '✅' : '📸'}
                    </div>
                    <div className="text-[14px] font-bold text-slate-700">
                      {imageBase64 ? '圖片已就緒，可點擊更換' : '點擊選擇圖片，或直接拖曳至此'}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400">支援 JPG, PNG, HEIC</div>
                  </div>
                </div>
              </div>

              {/* 解析按鈕 */}
              <div className="pt-2">
                <button 
                  type="button"
                  onClick={handleParse}
                  disabled={loading}
                  className="relative w-full bg-slate-900 text-white font-bold py-4 px-4 rounded-[16px] shadow-lg shadow-slate-900/20 hover:bg-slate-800 active:scale-[0.98] transition-all text-[15px] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>AI 視覺辨識中...</span>
                    </>
                  ) : (
                    <>
                      <span>開始智能解析</span>
                      <span>✨</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
