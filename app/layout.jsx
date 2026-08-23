import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Shopee Rush 蝦皮排班系統',
  description: '智能排班管理系統',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        {/* 高階透視導覽列 */}
        <header className="header">
          <div className="header-container">
            <Link href="/" className="logo-title">
              {/* 精緻化的小圖示 */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              Shopee Rush
            </Link>
            {/* 膠囊按鈕選單 */}
            <nav className="nav-links">
              <Link href="/">今日班表</Link>
              <Link href="/weekly">本週班表</Link>
              <Link href="/manage">後台管理</Link>
            </nav>
          </div>
        </header>
        
        {/* 主要卡片區塊 */}
        <main className="main-container">
          <div className="card">
            {children}
          </div>
        </main>

        <footer className="footer">
          Shopee Rush System &copy; {new Date().getFullYear()} — Made with ❤️
        </footer>
      </body>
    </html>
  );
}
