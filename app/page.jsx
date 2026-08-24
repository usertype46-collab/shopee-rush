import Link from 'next/link';

export default function Home() {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {/* 頂部歡迎卡片 Hero Section */}
      <header className="bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 rounded-3xl p-8 sm:p-10 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        {/* 背景裝飾 */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md text-4xl shadow-inner border border-white/30">
            ⚡
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-sm">Shopee Rush</h1>
            <p className="text-orange-50 mt-1.5 font-medium">智慧排班管理系統</p>
          </div>
        </div>
        <div className="bg-white/20 px-5 py-2 rounded-full text-sm font-bold backdrop-blur-md border border-white/40 shadow-sm relative z-10">
          v2.6 Pro
        </div>
      </header>

      {/* 今日即時班表卡片 */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100 p-6 sm:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
              <span className="w-1.5 h-6 bg-orange-500 rounded-full block"></span>
              今日即時班表
            </h2>
            <p className="text-slate-500 text-sm mt-1.5">即時掌握今日人員出勤與排班狀況</p>
          </div>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 flex items-center gap-2 shadow-sm">
            <span className="text-orange-500">🗓️</span> {today}
          </div>
        </div>

        {/* 缺資料狀態 Empty State */}
        <div className="px-6 py-20 flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-6 bg-slate-50 w-28 h-28 rounded-full flex items-center justify-center shadow-inner border border-slate-100 animate-bounce-slow">
            📭
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">今日尚無排班資料</h3>
          <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
            目前系統中沒有今天的班表。請前往 <span className="font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">AI 後台</span> 上傳班表圖片，系統將自動為您識別並解析今日排班。
          </p>
          <Link 
            href="/manage" 
            className="group relative inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-md shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40 hover:-translate-y-0.5"
          >
            前往 AI 後台處理
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
