import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Shopee Rush | 智慧排班管理系統',
  description: 'AI自動解析班表與出勤管理',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-orange-200">
        {/* 頂部導覽列 Navbar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold text-orange-550 hover:opacity-80 transition flex items-center gap-2">
                  <span className="text-2xl drop-shadow-sm">⚡</span> 
                  <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                    Shopee Rush
                  </span>
                </Link>
                
                {/* 導覽連結 */}
                <nav className="hidden md:flex space-x-2">
                  <Link href="/" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors">今日班表</Link>
                  <Link href="/weekly" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors">本週班表</Link>
                  <Link href="/manage" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors">後台管理</Link>
                </nav>
              </div>
              
              {/* 手機版選單按鈕 (保留擴充空間) */}
              <div className="md:hidden">
                <button className="p-2 text-slate-500 hover:text-orange-500 rounded-lg bg-slate-50">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 頁面主要內容 */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
          {children}
        </main>

        {/* 頁尾 Footer */}
        <footer className="bg-white border-t border-slate-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center gap-1 text-sm text-slate-500">
            <p>Shopee Rush System © 2026 — Made with <span className="text-red-500">❤️</span></p>
            <p className="text-xs text-slate-400">智慧排班管理系統 v2.6 Pro</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
