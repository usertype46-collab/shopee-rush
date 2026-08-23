import './globals.css';

export const metadata = {
  title: 'Shopee Rush',
  description: '排班表系統',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
