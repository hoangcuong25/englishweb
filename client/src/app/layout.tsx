import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { I18nProvider } from '@/lib/i18n-context';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'Teacher Dong Academy — Nền Tảng Đào Tạo Anh Ngữ & WebRTC In-House',
  description: 'Nền tảng đào tạo trực tuyến chuẩn EdTech hiện đại: IELTS, Business English, LiveKit WebRTC, AI Writing Assessment, Speaking Studio và Điểm danh tự động.',
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
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
