import './globals.css';

export const metadata = {
  title: '蝦皮門市智慧班表管理系統',
  description: 'Shopee Schedule Management System powered by Nvidia AI & Firebase',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
