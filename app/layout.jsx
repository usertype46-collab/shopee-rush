import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Shopee Rush 蝦皮排班系統',
  description: '排班表與 AI 搶班管理系統',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className="bg-gray-100 text-gray-900 min-h-screen flex flex-col">
        {/* 頂部導覽列 */}
        <header className="bg-orange-600 text-white shadow-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* 網站標題 */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider">📦 Shopee Rush</span>
              <span className="text-xs bg-orange-700 px-2 py-0.5 rounded-full text-orange-200">排班系統</span>
            </div>
            
            {/* 導覽連結按鈕 */}
            <nav className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base font-medium">
              <Link 
                href="/" 
                className="px-3 py-1.5 rounded-lg bg-orange-700/50 hover:bg-orange-700 transition"
              >
                今日班表
              </Link>
              <Link 
                href="/weekly" 
                className="px-3 py-1.5 rounded-lg bg-orange-700/50 hover:bg-orange-700 transition"
              >
                本週班表
              </Link>
              <Link 
                href="/manage" 
                className="px-3 py-1.5 rounded-lg bg-orange-700/50 hover:bg-orange-700 transition"
              >
                後台管理
              </Link>
            </nav>
          </div>
        </header>
        
        {/* 頁面主要內容區塊 */}
        <main className="max-w-5xl w-full mx-auto p-4 sm:p-6 flex-grow">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            {children}
          </div>
        </main>

        {/* 頁尾 */}
        <footer className="text-center py-4 text-xs text-gray-500">
          Shopee Rush System &copy; 2026
        </footer>
      </body>
    </html>
  );
}
