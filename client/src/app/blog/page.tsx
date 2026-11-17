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

  // Featured post (first featured post or first article)
  const featuredPost = useMemo(() => {
    return filteredBlogs.find((b) => b.isFeatured) || filteredBlogs[0];
  }, [filteredBlogs]);

  // Other posts excluding the hero featured post (when not searching)
  const regularPosts = useMemo(() => {
    if (searchQuery.trim()) return filteredBlogs;
    if (!featuredPost) return filteredBlogs;
    return filteredBlogs.filter((b) => b.id !== featuredPost.id);
  }, [filteredBlogs, featuredPost, searchQuery]);

  const estimateReadingTime = (text?: string) => {
    if (!text) return '3 phút đọc';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(2, Math.ceil(words / 180));
    return `${minutes} phút đọc`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* ================= 1. TOP HEADER NAVBAR ================= */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E1EBF5] sticky top-0 z-40 transition-all shadow-xs">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1B64B0] to-[#55B8E8] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#1B64B0]/20 group-hover:scale-105 transition-transform">
              Đ
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[17px] text-[#14263D] tracking-tight group-hover:text-[#1B64B0] transition-colors leading-tight">
                Teacher Dong Academy
              </span>
              <span className="text-[11px] font-bold text-[#55687D] tracking-wider uppercase">
                Góc Chia Sẻ & Tri Thức
              </span>
            </div>
          </Link>

          {/* Center Navigation Tabs */}
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
          <div className="flex items-center gap-3">
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin/blogs"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 text-amber-300 text-xs font-extrabold hover:bg-slate-800 transition-all shadow-xs border border-amber-400/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quản lý Blog (Admin)</span>
              </Link>
            )}
            {user ? (
              <Link
                href={user.role === 'ADMIN' ? '/admin' : '/student'}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#DDF3FC] text-[#1B64B0] text-xs sm:text-sm font-bold hover:bg-[#1B64B0] hover:text-white transition-all shadow-xs"
              >
                <GraduationCap className="w-4 h-4" />
                <span className="max-w-[120px] truncate">{user.fullName || user.email}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2 text-[14px] font-extrabold text-white bg-[#1B64B0] hover:bg-[#154f8d] rounded-full transition-all shadow-sm hover:shadow hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              >
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ================= 2. HERO BANNER ================= */}
      <section className="relative bg-gradient-to-b from-[#EBF5FB] via-white to-[#F8FAFC] py-12 sm:py-16 px-4 border-b border-[#E1EBF5] overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#55B8E8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-[#FFB547]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DDF3FC] text-[#1B64B0] text-xs font-bold border border-[#55B8E8]/30 shadow-2xs">
            <Sparkles className="w-4 h-4 text-[#1B64B0]" />
            <span>Kho Tri Thức & Kinh Nghiệm Thực Chiến</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#14263D] tracking-tight leading-tight">
            Góc Chia Sẻ Chuyên Sâu <br />
            <span className="bg-gradient-to-r from-[#1B64B0] to-[#55B8E8] bg-clip-text text-transparent">
              Cùng Thầy Đông (IELTS 8.5)
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#55687D] max-w-2xl mx-auto leading-relaxed">
            Tổng hợp các bài viết chuyên sâu về kỹ thuật làm bài thi IELTS 4 kỹ năng, bí quyết phát triển năng lực ngôn ngữ tự nhiên và những câu chuyện giao thoa văn hóa toàn cầu.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-[#55687D] absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết theo từ khóa, kỹ năng (Writing, Speaking, Collocations)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-[#CBD5E1] text-[#14263D] text-sm font-medium shadow-sm focus:outline-none focus:border-[#1B64B0] focus:ring-3 focus:ring-[#1B64B0]/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 text-[#94A3B8] hover:text-[#14263D] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. MAIN CONTENT CONTAINER ================= */}
      <main className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#1B64B0] text-white shadow-md shadow-[#1B64B0]/20'
                  : 'bg-white border border-[#E2E8F0] text-[#334155] hover:border-[#1B64B0]/50 hover:bg-[#F8FAFC]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ================= 4. FEATURED HERO POST ================= */}
        {!searchQuery && featuredPost && (
          <section className="relative rounded-3xl bg-white border border-[#E1EBF5] p-6 sm:p-8 lg:p-10 shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Image Preview */}
              <div className="lg:col-span-7 relative rounded-2xl overflow-hidden aspect-video bg-slate-100">
                <img
                  src={
                    featuredPost.coverImage ||
                    featuredPost.coverImageUrl ||
                    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#FFB547] text-[#14263D] text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Bài Viết Nổi Bật</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1B64B0] text-xs font-bold shadow-sm">
                    {featuredPost.category || 'Học Thuật'}
                  </span>
                </div>
              </div>

              {/* Text Info */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3 text-xs text-[#64748B]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#1B64B0]" />
                    <span>
                      {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#1B64B0]" />
                    <span>{estimateReadingTime(featuredPost.content)}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-[#1B64B0]" />
                    <span>{featuredPost.viewCount || 0} lượt đọc</span>
                  </span>
                </div>

                <Link href={`/blog/${featuredPost.slug || featuredPost.id}`}>
                  <h2 className="text-xl sm:text-2xl font-black text-[#14263D] group-hover:text-[#1B64B0] transition-colors leading-snug">
                    {featuredPost.title}
                  </h2>
                </Link>

                <p className="text-xs sm:text-sm text-[#55687D] leading-relaxed line-clamp-3">
                  {featuredPost.summary || featuredPost.content}
                </p>

                {/* Author & CTA */}
                <div className="pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#DDF3FC] border border-[#55B8E8] flex items-center justify-center font-bold text-xs text-[#1B64B0]">
                      {featuredPost.author?.fullName ? featuredPost.author.fullName.charAt(0) : 'T'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#14263D]">
                        {featuredPost.author?.fullName || 'Thầy Đông (IELTS 8.5)'}
                      </p>
                      <p className="text-[11px] text-[#64748B]">Chuyên gia học thuật</p>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${featuredPost.slug || featuredPost.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B64B0] text-white text-xs sm:text-sm font-extrabold hover:bg-[#154f8d] transition-all shadow-sm hover:shadow group/btn"
                  >
                    <span>Đọc chi tiết</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= 5. ARTICLES GRID ================= */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-[#14263D] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1B64B0]" />
              <span>
                {searchQuery
                  ? `Kết quả tìm kiếm cho "${searchQuery}" (${filteredBlogs.length})`
                  : 'Tất Cả Bài Viết Mới Nhất'}
              </span>
            </h3>
            <span className="text-xs font-bold text-[#64748B]">
              Hiển thị {regularPosts.length} bài viết
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl border border-[#E1EBF5] p-5 animate-pulse space-y-4"
                >
                  <div className="h-44 bg-slate-200 rounded-2xl"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-16 bg-slate-100 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : regularPosts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#E1EBF5] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#DDF3FC] text-[#1B64B0] flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-[#14263D]">Không tìm thấy bài viết phù hợp</h4>
              <p className="text-xs sm:text-sm text-[#55687D] max-w-md mx-auto">
                Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác để xem thêm nội dung bổ ích.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="px-5 py-2.5 rounded-full bg-[#1B64B0] text-white text-xs font-bold hover:bg-[#154f8d] transition-all"
              >
                Xem tất cả bài viết
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl border border-[#E1EBF5] overflow-hidden shadow-xs hover:shadow-lg hover:border-[#1B64B0]/40 transition-all flex flex-col justify-between group"
                >
                  {/* Card Image */}
                  <Link
                    href={`/blog/${post.slug || post.id}`}
                    className="relative aspect-video overflow-hidden bg-slate-100 block"
                  >
                    <img
                      src={
                        post.coverImage ||
                        post.coverImageUrl ||
                        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[#1B64B0] text-[11px] font-extrabold shadow-xs">
                        {post.category || 'Học Thuật'}
                      </span>
                    </div>
                  </Link>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{post.viewCount || 0} lượt xem</span>
                        </span>
                      </div>

                      <Link href={`/blog/${post.slug || post.id}`}>
                        <h2 className="text-base font-extrabold text-[#14263D] group-hover:text-[#1B64B0] transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h2>
                      </Link>

                      <p className="text-xs text-[#55687D] leading-relaxed line-clamp-3">
                        {post.summary || post.content}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#1B64B0]" />
                        <span>{estimateReadingTime(post.content)}</span>
                      </span>

                      <Link
                        href={`/blog/${post.slug || post.id}`}
                        className="text-xs font-black text-[#1B64B0] flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        <span>Đọc tiếp</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* ================= 6. NEWSLETTER & CONSULTATION CTA ================= */}
        <section className="rounded-3xl bg-gradient-to-r from-[#14263D] to-[#1B64B0] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
              Lộ Trình Đột Phá Band Điểm
            </span>
            <h3 className="text-2xl sm:text-3xl font-black leading-tight">
              Sẵn Sàng Chinh Phục Điểm Số Mơ Ước Cùng Teacher Dong?
            </h3>
            <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
              Nhận bài đánh giá năng lực 4 kỹ năng miễn phí và buổi tư vấn định hướng trực tiếp 1-1 cùng Thầy Đông để xây dựng lộ trình học tập cá nhân hóa.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/#consultation-section"
                className="px-6 py-3 rounded-full bg-[#FFB547] hover:bg-[#FFA726] text-[#14263D] font-extrabold text-sm shadow-md transition-all hover:scale-105 active:scale-100"
              >
                Đăng Ký Kiểm Tra Đầu Vào Miễn Phí
              </Link>
              <Link
                href="/"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all"
              >
                Tìm Hiểu Các Khóa Học
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ================= 7. FOOTER ================= */}
      <footer className="bg-white border-t border-[#E1EBF5] py-8 text-center text-xs text-[#64748B]">
        <div className="max-w-[1380px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Teacher Dong Academy. All rights reserved.</p>
          <div className="flex items-center gap-6 font-semibold">
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
