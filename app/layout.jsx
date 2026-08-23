import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Shopee Rush 蝦皮搶班系統',
  description: '排班表與搶班管理系統',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {/* 頂部導覽列 */}
        <nav className="bg-orange-600 text-white shadow-md p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="font-bold text-lg">Shopee Rush 搶班</h1>
            <div className="flex gap-4 text-sm md:text-base">
              <Link href="/" className="hover:underline">今日班表</Link>
              <Link href="/weekly" className="hover:underline">本週班表</Link>
              <Link href="/manage" className="hover:underline">後台管理</Link>
            </div>
          </div>
        </nav>
        
        {/* 頁面主要內容 */}
        <main className="max-w-4xl mx-auto py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
