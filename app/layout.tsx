import './globals.css'
import Link from 'next/link'

export const metadata = { title: '蝦皮班表管理系統' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="bg-gray-50 min-h-screen text-gray-800">
        <nav className="bg-orange-500 p-4 text-white shadow-md">
          <div className="container mx-auto flex gap-6 font-bold">
            <Link href="/" className="hover:text-orange-200">今日班表</Link>
            <Link href="/weekly" className="hover:text-orange-200">個人週班表</Link>
            <Link href="/manage" className="hover:text-orange-200">資料庫管理</Link>
          </div>
        </nav>
        <main className="container mx-auto p-4 mt-6 bg-white shadow rounded">
          {children}
        </main>
      </body>
    </html>
  )
}

