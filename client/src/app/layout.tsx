import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { I18nProvider } from '@/lib/i18n-context';

export const metadata: Metadata = {
  title: 'Teacher Dong Academy — Nền Tảng Đào Tạo Anh Ngữ & WebRTC In-House',
  description: 'Nền tảng đào tạo trực tuyến chuẩn EdTech hiện đại: IELTS, Business English, LiveKit WebRTC, AI Writing Assessment, Speaking Studio và Điểm danh tự động.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-bg text-text antialiased font-sans">
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
