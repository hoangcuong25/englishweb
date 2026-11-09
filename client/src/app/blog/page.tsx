'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { blogsService, BlogPost } from '@/services/blogs.service';
import {
  Calendar,
  Eye,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('ALL');

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const data = await blogsService.getBlogs({
          category: category === 'ALL' ? undefined : category,
          published: true,
        });
        setBlogs(data);
      } catch {
        // Fallback demo blog articles if server is offline or empty
        setBlogs([
          {
            id: 'b1',
            title: 'Bí Quyết Nâng Band IELTS Writing Task 2 Từ 6.0 Lên 7.5+ Với Collocation Học Thuật',
            slug: 'nang-band-ielts-writing-task-2-collocation',
            category: 'IELTS Writing Tips',
            published: true,
            viewCount: 1420,
            createdAt: '2026-11-08T10:00:00.000Z',
            updatedAt: '2026-11-08T10:00:00.000Z',
            summary:
              'Phân tích cách biến đổi câu đơn thành câu phức với cấu trúc nhượng bộ và phương pháp lập luận 4 đoạn chặt chẽ chuẩn Cambridge.',
            content: 'Nội dung chi tiết phương pháp học...',
            author: { id: 'admin-1', fullName: 'Thầy Đông (IELTS 8.5)' },
          },
          {
            id: 'b2',
            title: 'Hành Trình Khám Phá Văn Hóa Bản Xứ & Nuôi Dưỡng Tư Duy Công Dân Toàn Cầu',
            slug: 'kham-pha-van-hoa-ban-xu-tu-duy-toan-cau',
            category: 'Travel & Culture Blog',
            published: true,
            viewCount: 890,
            createdAt: '2026-11-05T08:30:00.000Z',
            updatedAt: '2026-11-05T08:30:00.000Z',
            summary:
              'Những câu chuyện đời thực về giao thoa văn hóa, nghệ thuật giao tiếp phi ngôn ngữ và cách hòa nhập nhanh khi đi du học.',
            content: 'Nội dung chia sẻ văn hóa...',
            author: { id: 'admin-2', fullName: 'Ban Học Vụ Teacher Dong' },
          },
          {
            id: 'b3',
            title: 'Làm Chủ 60 Giây Chuẩn Bị Cue Card IELTS Speaking Part 2 Không Bị Bí Ý Tưởng',
            slug: 'lam-chu-60s-chuan-bi-cue-card-speaking-part-2',
            category: 'IELTS Speaking Studio',
            published: true,
            viewCount: 2150,
            createdAt: '2026-11-02T14:15:00.000Z',
            updatedAt: '2026-11-02T14:15:00.000Z',
            summary:
              'Chiến thuật chia nhánh ý tưởng theo trục Quá Khứ - Hiện Tại - Cảm Xúc để nói liền mạch 2 phút không vấp ngữ pháp.',
            content: 'Chiến thuật Speaking...',
            author: { id: 'admin-1', fullName: 'Thầy Đông (IELTS 8.5)' },
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [category]);

  const categories = [
    { id: 'ALL', label: 'Tất cả bài viết' },
    { id: 'IELTS Writing Tips', label: 'IELTS Writing' },
    { id: 'IELTS Speaking Studio', label: 'IELTS Speaking' },
    { id: 'Travel & Culture Blog', label: 'Văn hóa & Đời sống' },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-line sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-slate-700 hover:text-primary transition font-bold text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay về Trang Chủ</span>
          </Link>
          <div className="flex items-center space-x-2 font-extrabold text-sm text-slate-900">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Teacher Dong Academy Blog</span>
          </div>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark transition shadow-sm"
          >
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-sky-50 via-white to-bg py-12 px-4 border-b border-line">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kiến Thức & Kinh Nghiệm Thực Chiến</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Góc Chia Sẻ Chuyên Sâu Cùng Thầy Đông (IELTS 8.5)
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-2xl mx-auto">
            Tổng hợp bài viết phân tích kỹ năng IELTS, kỹ năng sư phạm, tư duy công dân toàn cầu và những câu chuyện trải nghiệm văn hóa bản xứ.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                category === c.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-line text-slate-700 hover:bg-slate-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-line p-6 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-16 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-3xl border border-line p-6 shadow-xs hover:shadow-md hover:border-primary/40 transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-primary font-bold">
                      {post.category || 'Học Thuật'}
                    </span>
                    <span className="text-muted flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{post.viewCount || 0} lượt đọc</span>
                    </span>
                  </div>

                  <h2 className="text-base font-extrabold text-slate-900 group-hover:text-primary transition line-clamp-2">
                    {post.title}
                  </h2>

                  <p className="text-xs text-muted leading-relaxed line-clamp-3">
                    {post.summary || post.content}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-line flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5 text-muted text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <span className="font-bold text-primary flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                    <span>Đọc tiếp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

