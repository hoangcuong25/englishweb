import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { I18nProvider } from '@/lib/i18n-context';
import { CurrencyProvider } from '@/lib/currency-context';
import { ToastProvider } from '@/components/ui/toast';
import { SidebarProvider } from '@/lib/sidebar-context';

export const metadata: Metadata = {
  title: 'Teacher Dong Academy — Nền Tảng Đào Tạo Anh Ngữ & Kỹ Năng Toàn Diện',
  description: 'Nền tảng đào tạo trực tuyến hiện đại: IELTS, Business English, Lớp học trực tuyến tương tác, IELTS Mock Test, AI Writing Assessment, Speaking Studio và Điểm danh tự động.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="overflow-x-hidden max-w-full">
      <body className="min-h-screen bg-bg text-text antialiased font-sans overflow-x-hidden max-w-full">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <I18nProvider>
          <CurrencyProvider>
            <AuthProvider>
              <SidebarProvider>
                <ToastProvider>{children}</ToastProvider>
              </SidebarProvider>
            </AuthProvider>
          </CurrencyProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
