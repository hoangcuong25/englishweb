'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';

export default function AdminLibraryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/admin/courses');
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="py-24 text-center max-w-lg mx-auto space-y-5 px-4 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-3xl bg-sky-50 text-primary border border-sky-100 flex items-center justify-center mx-auto shadow-xs">
        <GraduationCap className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Bảo mật học liệu số theo từng khóa học</span>
        </div>
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          Học Liệu Được Quản Lý Trực Tiếp Theo Từng Khóa Học
        </h2>
        <p className="text-xs text-muted leading-relaxed">
          Theo quy chuẩn bảo mật và phân quyền học liệu, toàn bộ tài liệu (PDF, Audio, Bài tập) được quản lý riêng biệt trong từng trang khóa học. Chỉ học viên đã được kích hoạt ghi danh mới có quyền truy cập.
        </p>
      </div>

      <div className="pt-2">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-md shadow-primary/20 transition"
        >
          <span>Đến Danh Sách Khóa Học</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
        <span>Đang tự động chuyển hướng đến Khóa học...</span>
      </div>
    </div>
  );
}
