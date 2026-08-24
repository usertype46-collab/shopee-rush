export default function ManagePage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
          <span className="w-1.5 h-7 bg-orange-500 rounded-full block"></span>
          後台管理 (AI 解析中心)
        </h1>
        <p className="text-slate-500 pl-4.5">上傳班表圖片，交由 AI 自動識別並建立排班資料庫。</p>
      </div>

      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6">新增班表</h2>
        
        {/* 上傳區塊 UI */}
        <label className="border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-orange-500 hover:bg-orange-50/50 transition-all cursor-pointer group">
          <input type="file" className="hidden" accept="image/png, image/jpeg" />
          <div className="bg-white p-4 rounded-full shadow-sm mb-5 group-hover:scale-110 transition-transform duration-300 border border-slate-100">
            <span className="text-4xl block">📸</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">
            點擊選擇檔案，或將圖片拖曳至此
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            支援格式：JPG, PNG。建議上傳清晰的表格照片以提高 AI 辨識率。
          </p>
          <div className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium group-hover:bg-orange-500 transition-colors">
            選擇圖片
          </div>
        </label>
        
        {/* 解析紀錄列表 (Placeholder) */}
        <div className="mt-10">
          你好！我無法直接瀏覽 `https://shopee-rush.vercel.app/` 這個網址來讀取你的專案原始碼，也無法憑空猜測你目前遇到的 UI 問題與使用的技術疊代。

要為你提供**準確且完整的修正代碼**，我需要你協助提供以下資訊：

1. **你使用的技術疊代**：是 React、Vue、Next.js，還是純 HTML/CSS/JS？
2. **你使用的樣式框架**：是否有使用 Tailwind CSS、Bootstrap、MUI 等工具？
3. **目前的原始碼**：請貼上你想要修改的頁面代碼。
4. **需要修正的具體問題**：例如「手機版排版跑掉」、「按鈕顏色不對」、「需要加入倒數計時器的樣式」等。

---

### 💡 搶購頁面 UI 參考範本 (React + Tailwind CSS)

假設你的專案是一個類似「蝦皮搶購」的網頁，如果你想要一個**現代化、響應式（RWD）、帶有搶購氛圍**的介面，你可以參考以下我為你撰寫的完整單頁 UI 結構。你可以將其套用到你的專案中：

```jsx
import React, { useState, useEffect } from 'react';

export default function ShopeeRushApp() {
  // 模擬倒數計時狀態
  const [timeLeft, setTimeLeft] = useState(3600); 

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h} : ${m} : ${s}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* 頂部導覽列 */}
      <header className="bg-orange-550 bg-gradient-to-r from-orange-500 to-orange-600 shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-wider">⚡ Shopee Rush</h1>
          <nav>
            <button className="text-white hover:text-orange-200 font-medium transition">登入 / 註冊</button>
          </nav>
        </div>
      </header>

      {/* 主要內容區 */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* 倒數計時橫幅 */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-red-500 px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-xl font-bold text-white mb-2 sm:mb-0 flex items-center">
              <span className="mr-2">🔥</span> 限時瘋搶中
            </h2>
            <div className="flex items-center space-x-2 text-white font-mono text-xl bg-red-600 px-4 py-2 rounded-lg shadow-inner">
              <span>距離結束：</span>
              <span className="font-bold tracking-widest">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </section>

        {/* 商品列表 */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 商品卡片 1 */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col group">
            <div className="relative h-48 bg-gray-200 overflow-hidden">
              {/* 替換為實際圖片 */}
              <img 
                src="[https://via.placeholder.com/400x300?text=Product+Image](https://via.placeholder.com/400x300?text=Product+Image)" 
                alt="Product" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -50%
              </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-gray-800 font-medium line-clamp-2 mb-2">
                Apple iPhone 15 Pro Max 256G 鈦金屬 (限量搶購)
              </h3>
              <div className="mt-auto">
                <div className="flex items-baseline space-x-2 mb-3">
                  <span className="text-2xl font-bold text-orange-550 text-orange-500">$22,450</span>
                  <span className="text-sm text-gray-400 line-through">$44,900</span>
                </div>
                {/* 進度條 */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-3">
                  <span>已搶購 85%</span>
                  <span>剩餘 3 件</span>
                </div>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  立即搶購
                </button>
              </div>
            </div>
          </div>
          
          {/* 可以繼續複製商品卡片... */}
          
        </section>
      </main>
    </div>
  );
}
