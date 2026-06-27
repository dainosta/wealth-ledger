import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Wealth Ledger - Tài Sản Của Tôi',
  description: 'Quản lý tài sản cá nhân chuyên nghiệp và trực quan',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetBrainsMono.variable} font-sans antialiased min-h-screen bg-[#0a0a0a] text-neutral-200 selection:bg-emerald-500/30`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
