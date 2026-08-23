import './globals.css';
import { Noto_Sans_TC } from 'next/font/google';
import Link from 'next/link';

// 載入 Google 字體
const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
});

export const metadata = {
  title: 'Shopee Rush 蝦皮搶班系統',
  description: '專為蝦皮排班打造的高效智能管理系統',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW" className={notoSansTC.className}>
      <body className="bg-slate-50 text-slate-800 min-h-screen flex flex-col selection:bg-orange-200 selection:text-orange-900">
        
        {/* 頂部導覽列 (玻璃透視質感) */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* LOGO 與 標題區 */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-2 rounded-xl shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 tracking-tight">
                  Shopee Rush
                </h1>
                <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">排班管理系統</p>
              </div>
            </div>
            
            {/* 導覽按鈕 (質感膠囊風格) */}
            <nav className="flex items-center bg-gray-100/80 p-1.5 rounded-full border border-gray-200 shadow-inner overflow-x-auto w-full sm:w-auto">
              <Link href="/" className="whitespace-nowrap flex-1 text-center px-4 py-2 text-sm font-bold rounded-full text-gray-600 hover:text-orange-600 hover:bg-white hover:shadow-sm transition-all">
                今日班表
              </Link>
              <Link href="/weekly" className="whitespace-nowrap flex-1 text-center px-4 py-2 text-sm font-bold rounded-full text-gray-600 hover:text-orange-600 hover:bg-white hover:shadow-sm transition-all">
                本週班表
              </Link>
              <Link href="/manage" className="whitespace-nowrap flex-1 text-center px-4 py-2 text-sm font-bold rounded-full text-gray-600 hover:text-orange-600 hover:bg-white hover:shadow-sm transition-all">
                後台管理
              </Link>
            </nav>
            
          </div>
        </header>
        
        {/* 主要內容區塊 (內縮立體卡片模式) */}
        <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 flex-grow flex flex-col">
          <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/50 border border-orange-50 p-5 sm:p-8 flex-grow relative overflow-hidden">
            {/* 裝飾性背景光暈 */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-400/5 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* 頁面內容注入 */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>

        {/* 頁尾版權 */}
        <footer className="py-6 text-center text-sm text-gray-400 font-medium">
          <p>Shopee Rush System &copy; {new Date().getFullYear()} — Made with ❤️</p>
        </footer>
      </body>
    </html>
  );
}
