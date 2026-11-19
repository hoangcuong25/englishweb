'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { blogsService, BlogPost } from '@/services/blogs.service';
import { useAuth } from '@/lib/auth-context';
import {
  Calendar,
  Eye,
  ArrowRight,
  BookOpen,
  Sparkles,
  Search,
  Clock,
  GraduationCap,
  TrendingUp,
  X,
} from 'lucide-react';

export default function BlogListPage() {
  const { user } = useAuth();

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lock horizontal scroll to 0 on mobile/desktop mount & disable scrollRestoration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await blogsService.getBlogs({
          category: selectedCategory === 'ALL' ? undefined : selectedCategory,
          published: true,
        });
        if (isMounted) {
          setBlogs(res.items || []);
        }
      } catch {
        if (isMounted) {
          setBlogs([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBlogs();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const categories = [
    { id: 'ALL', label: 'Tất cả bài viết' },
    { id: 'IELTS Writing', label: 'IELTS Writing' },
    { id: 'IELTS Speaking', label: 'IELTS Speaking' },
    { id: 'IELTS Reading & Listening', label: 'Reading & Listening' },
    { id: 'Phương pháp học', label: 'Phương pháp học' },
    { id: 'Văn hóa & Đời sống', label: 'Văn hóa & Đời sống' },
  ];

  // Filter client-side by search query
  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return blogs;
    const q = searchQuery.toLowerCase().trim();
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.summary && b.summary.toLowerCase().includes(q)) ||
        (typeof b.tags === 'string' && b.tags.toLowerCase().includes(q))
    );
  }, [blogs, searchQuery]);

  // Cột trái: Sắp xếp theo ngày mới nhất (Mới nhất lên đầu)
  const latestPosts = useMemo(() => {
    return [...filteredBlogs].sort(
      (a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
    );
  }, [filteredBlogs]);

  const latestHeroPost = latestPosts[0];
  const otherLatestPosts = latestPosts.slice(1);

  // Cột phải: Xem nhiều (Sắp xếp theo lượt xem viewCount giảm dần)
  const mostViewedPosts = useMemo(() => {
    return [...blogs]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 6);
  }, [blogs]);

  const estimateReadingTime = (text?: string) => {
    if (!text) return '1 phút đọc';
    const cleanText = text
      .replace(/!\[([^\]]*)\]\s*\((https?:\/\/[^\s)]+)\)/g, '')
      .replace(/https?:\/\/[^\s)]+/g, '')
      .replace(/[#*`>_]/g, '')
      .trim();
    const words = cleanText ? cleanText.split(/\s+/).length : 0;
    if (words === 0) return '1 phút đọc';
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} phút đọc`;
  };

  const stripMarkdown = (text?: string) => {
    if (!text) return '';
    return text
      .replace(/!\[([^\]]*)\]\s*\((https?:\/\/[^\s)]+)\)/g, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g, '$1')
      .replace(/[#*`>_]/g, '')
      .trim();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-x-hidden w-full max-w-full">
      {/* ================= 1. TOP HEADER NAVBAR ================= */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E1EBF5] sticky top-0 z-40 transition-all shadow-xs w-full">
        <div className="max-w-[1380px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-18 flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 group min-w-0 max-w-[calc(100%-105px)] sm:max-w-none">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#1B64B0] to-[#55B8E8] flex items-center justify-center text-white font-black text-base sm:text-xl shadow-md shadow-[#1B64B0]/20 group-hover:scale-105 transition-transform shrink-0">
              Đ
            </div>
            <div className="flex flex-col min-w-0 truncate">
              <span className="font-extrabold text-[13px] sm:text-[17px] text-[#14263D] tracking-tight group-hover:text-[#1B64B0] transition-colors leading-tight truncate">
                Teacher Dong Academy
              </span>
              <span className="hidden sm:block text-[10px] sm:text-[11px] font-bold text-[#55687D] tracking-wider uppercase truncate">
                Góc Chia Sẻ & Tri Thức
              </span>
            </div>
          </Link>

          {/* Center Navigation Tabs (Desktop only) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link
              href="/"
              className="font-bold text-[13.5px] text-[#55687D] hover:text-[#1B64B0] transition-colors whitespace-nowrap"
            >
              Trang Chủ
            </Link>
            <Link
              href="/#home-programs-section"
              className="font-bold text-[13.5px] text-[#55687D] hover:text-[#1B64B0] transition-colors whitespace-nowrap"
            >
              Khóa Học
            </Link>
            <Link
              href="/#tech-preview-section"
              className="font-bold text-[13.5px] text-[#55687D] hover:text-[#1B64B0] transition-colors whitespace-nowrap"
            >
              Lớp Trực Tuyến & AI
            </Link>
            <Link
              href="/blog"
              className="font-extrabold text-[13.5px] text-[#1B64B0] border-b-2 border-[#1B64B0] pb-1 whitespace-nowrap"
            >
              Blog Chuyên Sâu
            </Link>
            <Link
              href="/#consultation-section"
              className="font-bold text-[13.5px] text-[#55687D] hover:text-[#1B64B0] transition-colors whitespace-nowrap"
            >
              Đăng Ký Tư Vấn
            </Link>
          </nav>

          {/* Right Auth Action */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <Link
                href={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#DDF3FC] text-[#1B64B0] text-xs sm:text-sm font-bold hover:bg-[#1B64B0] hover:text-white transition-all shadow-xs shrink-0"
              >
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="hidden sm:inline max-w-[120px] truncate">{user.fullName || user.email}</span>
                <span className="sm:hidden font-extrabold text-[10.5px] uppercase">{user.role}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-extrabold text-white bg-[#1B64B0] hover:bg-[#154f8d] rounded-full transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap shrink-0"
              >
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ================= 2. BREADCRUMB & MAIN CONTAINER ================= */}
      <main className="max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-1 w-full max-w-full space-y-4 sm:space-y-6 min-w-0 overflow-x-hidden">
        {/* Top Bar: Breadcrumb & Search & Category Filter */}
        <div className="space-y-3 sm:space-y-3.5 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 w-full min-w-0">
            {/* Breadcrumb: Trang chủ > Tin tức */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 min-w-0 flex-wrap">
              <Link href="/" className="hover:text-emerald-700 transition-colors shrink-0">
                Trang chủ
              </Link>
              <span className="text-slate-400 shrink-0">&rsaquo;</span>
              <span className="text-emerald-700 font-bold shrink-0">Tin tức</span>
              {selectedCategory !== 'ALL' && (
                <>
                  <span className="text-slate-400 shrink-0">&rsaquo;</span>
                  <span className="text-slate-800 font-bold truncate max-w-[150px]">{selectedCategory}</span>
                </>
              )}
            </div>

            {/* Quick Search Bar */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 sm:py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills (swipeable within bounds, hidden scrollbar) */}
          <div className="w-full min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none w-full min-w-0 overscroll-x-contain touch-pan-x">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    selectedCategory === c.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-700/50 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= 3. 2-COLUMN NEWS PORTAL LAYOUT ================= */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start animate-pulse w-full min-w-0">
            <div className="lg:col-span-8 space-y-4 sm:space-y-6 w-full min-w-0">
              <div className="h-44 sm:h-64 bg-slate-200 rounded-2xl w-full" />
              <div className="h-24 sm:h-32 bg-slate-200 rounded-2xl w-full" />
              <div className="h-24 sm:h-32 bg-slate-200 rounded-2xl w-full" />
            </div>
            <div className="lg:col-span-4 space-y-4 w-full min-w-0">
              <div className="h-7 bg-slate-200 rounded w-28" />
              <div className="h-16 bg-slate-200 rounded-xl w-full" />
              <div className="h-16 bg-slate-200 rounded-xl w-full" />
              <div className="h-16 bg-slate-200 rounded-xl w-full" />
            </div>
          </div>
        ) : latestPosts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 w-full">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-slate-900">Không tìm thấy bài viết phù hợp</h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
              className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-all cursor-pointer"
            >
              Xem tất cả bài viết
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start w-full min-w-0 max-w-full">
            {/* CỘT TRÁI (8 / 12 CỘT): BÀI MỚI NHẤT Ở TRÊN ĐẦU, CÁC BÀI DƯỚI LẦN LƯỢT */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8 w-full min-w-0">
              {/* Bài mới nhất ở trên đầu */}
              {latestHeroPost && (
                <article className="pb-6 sm:pb-8 border-b border-slate-200 w-full min-w-0 overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 group w-full min-w-0">
                    {/* Thumbnail Left */}
                    <Link
                      href={`/blog/${latestHeroPost.slug || latestHeroPost.id}`}
                      className="relative w-full sm:w-[280px] md:w-[320px] aspect-[16/10] shrink-0 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 block border border-slate-200 shadow-2xs max-w-full"
                    >
                      {latestHeroPost.coverImage || latestHeroPost.coverImageUrl ? (
                        <img
                          src={latestHeroPost.coverImage || latestHeroPost.coverImageUrl}
                          alt={latestHeroPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200/80 text-slate-400 p-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/90 shadow-2xs flex items-center justify-center text-emerald-700">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-2">Teacher Dong Academy</span>
                        </div>
                      )}
                    </Link>

                    {/* Content Right */}
                    <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2 w-full">
                      <Link href={`/blog/${latestHeroPost.slug || latestHeroPost.id}`}>
                        <h2 className="text-sm sm:text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors uppercase leading-snug break-words">
                          {latestHeroPost.title}
                        </h2>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 font-medium">
                        <span className="shrink-0 whitespace-nowrap">
                          {new Date(latestHeroPost.publishedAt || latestHeroPost.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>{latestHeroPost.viewCount || 0} lượt xem</span>
                        </span>
                        {latestHeroPost.category && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] sm:text-[10.5px] font-semibold shrink-0">
                            {latestHeroPost.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-3 pt-0.5 break-words">
                        {latestHeroPost.summary || stripMarkdown(latestHeroPost.content)}
                      </p>
                    </div>
                  </div>
                </article>
              )}

              {/* Các bài tiếp theo bên dưới lần lượt */}
              {otherLatestPosts.length > 0 && (
                <div className="space-y-5 sm:space-y-6 divide-y divide-slate-200 w-full min-w-0">
                  {otherLatestPosts.map((post) => (
                    <article key={post.id} className="pt-5 sm:pt-6 first:pt-0 w-full min-w-0 overflow-hidden">
                      <div className="flex items-start gap-3 sm:gap-5 group w-full min-w-0">
                        {/* Thumbnail Left (Responsive: w-24 on mobile, w-44/52 on tablet/desktop) */}
                        <Link
                          href={`/blog/${post.slug || post.id}`}
                          className="relative w-24 sm:w-44 md:w-52 aspect-[4/3] sm:aspect-[16/10] shrink-0 rounded-xl overflow-hidden bg-slate-100 block border border-slate-200 shadow-2xs"
                        >
                          {post.coverImage || post.coverImageUrl ? (
                            <img
                              src={post.coverImage || post.coverImageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200/80 text-slate-400">
                              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                            </div>
                          )}
                        </Link>

                        {/* Content Right */}
                        <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
                          <Link href={`/blog/${post.slug || post.id}`}>
                            <h3 className="text-xs sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase leading-snug line-clamp-2 break-words">
                              {post.title}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-500 font-medium">
                            <span className="shrink-0 whitespace-nowrap">
                              {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="flex items-center gap-1 shrink-0 whitespace-nowrap">
                              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
                              <span>{post.viewCount || 0} lượt xem</span>
                            </span>
                          </div>
                          <p className="hidden sm:block text-xs text-slate-600 leading-relaxed line-clamp-2 break-words">
                            {post.summary || stripMarkdown(post.content)}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* CỘT PHẢI (4 / 12 CỘT): XEM NHIỀU */}
            <aside className="lg:col-span-4 pt-6 border-t border-slate-200 lg:border-t-0 lg:pt-0 lg:border-l lg:border-slate-200 lg:pl-8 space-y-4 w-full min-w-0">
              {/* Tiêu đề mục Xem nhiều có gạch chân xanh */}
              <div className="border-b-2 border-emerald-600 pb-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide inline-block">
                  Xem nhiều
                </h3>
              </div>

              {/* Danh sách bài xem nhiều: Tiêu đề + lượt xem bên trái, Thumbnail bên phải */}
              <div className="space-y-3.5 sm:space-y-4 divide-y divide-slate-100 w-full min-w-0">
                {mostViewedPosts.map((post) => (
                  <div key={post.id} className="pt-3.5 sm:pt-4 first:pt-0 flex items-center justify-between gap-3 group w-full min-w-0">
                    <div className="flex-1 min-w-0 space-y-1">
                      <Link href={`/blog/${post.slug || post.id}`}>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug uppercase break-words">
                          {post.title}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-1 text-[10.5px] sm:text-[11px] text-slate-500 font-medium">
                        <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
                        <span className="shrink-0 whitespace-nowrap">{post.viewCount || 0} lượt xem</span>
                      </div>
                    </div>

                    <Link
                      href={`/blog/${post.slug || post.id}`}
                      className="w-16 h-12 sm:w-20 sm:h-14 shrink-0 rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 block border border-slate-200 shadow-2xs"
                    >
                      {post.coverImage || post.coverImageUrl ? (
                        <img
                          src={post.coverImage || post.coverImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200/80 text-slate-400">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </Link>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* ================= 4. FOOTER ================= */}
      <footer className="bg-white border-t border-[#E1EBF5] py-6 sm:py-8 text-center text-xs text-[#64748B] w-full overflow-hidden">
        <div className="max-w-[1380px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} Teacher Dong Academy. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-semibold">
            <Link href="/" className="hover:text-[#1B64B0]">Trang Chủ</Link>
            <Link href="/blog" className="hover:text-[#1B64B0]">Blog</Link>
            <Link href="/#about-teacher-dong" className="hover:text-[#1B64B0]">Về Thầy Đông</Link>
            <Link href="/#consultation-section" className="hover:text-[#1B64B0]">Tư Vấn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
