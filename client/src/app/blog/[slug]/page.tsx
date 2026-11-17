'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { blogsService, BlogPost } from '@/services/blogs.service';
import { useAuth } from '@/lib/auth-context';
import {
  Calendar,
  Eye,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  GraduationCap,
  ChevronRight,
  Tag,
  ArrowRight,
} from 'lucide-react';

export default function BlogDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    const fetchPostData = async () => {
      setLoading(true);
      try {
        const data = await blogsService.getBlogBySlug(slug);
        if (isMounted) {
          setPost(data);

          // Fetch related posts from same category or latest
          const relatedRes = await blogsService.getBlogs({
            category: data?.category,
            limit: 4,
          });
          const filtered = (relatedRes.items || []).filter(
            (p) => p.slug !== slug && p.id !== data?.id
          );
          setRelatedPosts(filtered.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load blog post:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPostData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const estimateReadingTime = (text?: string) => {
    if (!text) return '3 phút đọc';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(2, Math.ceil(words / 180));
    return `${minutes} phút đọc`;
  };

  // Helper to format simple markdown-like content into clean HTML components
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    const sections = content.split('\n\n');

    return sections.map((sec, idx) => {
      const trimmed = sec.trim();

      // Markdown Image ![alt](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const altText = imgMatch[1];
        const imgUrl = imgMatch[2];
        return (
          <figure key={idx} className="my-6 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-xs">
            <img
              src={imgUrl}
              alt={altText || 'Ảnh minh họa bài viết'}
              className="w-full max-h-[520px] object-cover rounded-t-xl"
            />
            {altText && (
              <figcaption className="text-center text-xs text-slate-500 py-2.5 px-4 italic bg-white border-t border-slate-100">
                {altText}
              </figcaption>
            )}
          </figure>
        );
      }

      // Heading 2 (## ...)
      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={idx}
            className="text-xl sm:text-2xl font-black text-[#14263D] mt-8 mb-4 border-l-4 border-[#1B64B0] pl-3"
          >
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // Heading 3 (### ...)
      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={idx}
            className="text-lg sm:text-xl font-bold text-[#14263D] mt-6 mb-3 text-[#1B64B0]"
          >
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Blockquote (> ...)
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="my-4 p-4 rounded-2xl bg-[#DDF3FC]/40 border-l-4 border-[#1B64B0] text-sm font-medium text-[#14263D] italic"
          >
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n').filter((line) => line.trim().length > 0);
        return (
          <ul key={idx} className="my-4 space-y-2 list-none pl-1">
            {items.map((item, itemIdx) => {
              const text = item.replace(/^[-*]\s+/, '');
              return (
                <li key={itemIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-[#334155] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B64B0] mt-2.5 shrink-0" />
                  <span>{parseInlineFormatting(text)}</span>
                </li>
              );
            })}
          </ul>
        );
      }

      // Numbered list
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed.split('\n').filter((line) => line.trim().length > 0);
        return (
          <ol key={idx} className="my-4 space-y-2.5 list-none pl-1">
            {items.map((item, itemIdx) => {
              const match = item.match(/^(\d+)\.\s+(.*)$/);
              const num = match ? match[1] : itemIdx + 1;
              const text = match ? match[2] : item;
              return (
                <li key={itemIdx} className="flex items-start gap-3 text-sm sm:text-base text-[#334155] leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-[#DDF3FC] text-[#1B64B0] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {num}
                  </span>
                  <span>{parseInlineFormatting(text)}</span>
                </li>
              );
            })}
          </ol>
        );
      }

      // Normal paragraph
      return (
        <p key={idx} className="my-4 text-sm sm:text-base text-[#334155] leading-relaxed">
          {parseInlineFormatting(trimmed)}
        </p>
      );
    });
  };

  // Helper for bold and italic inline
  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-[#14263D]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-[#1B64B0]">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* ================= 1. HEADER ================= */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E1EBF5] sticky top-0 z-40 transition-all shadow-xs">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <Link href="/blog" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1B64B0] to-[#55B8E8] flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#1B64B0]/20 group-hover:scale-105 transition-transform">
              Đ
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[17px] text-[#14263D] tracking-tight group-hover:text-[#1B64B0] transition-colors leading-tight">
                Teacher Dong Academy
              </span>
              <span className="text-[11px] font-bold text-[#55687D] tracking-wider uppercase">
                Góc Chia Sẻ Chuyên Sâu
              </span>
            </div>
          </Link>

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
              href="/blog"
              className="font-extrabold text-[13.5px] text-[#1B64B0] border-b-2 border-[#1B64B0] pb-1 whitespace-nowrap"
            >
              Blog
            </Link>
            <Link
              href="/#consultation-section"
              className="font-bold text-[13.5px] text-[#55687D] hover:text-[#1B64B0] transition-colors whitespace-nowrap"
            >
              Tư Vấn
            </Link>
          </nav>

          <div className="flex items-center gap-3">
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
                className="flex items-center gap-2 px-5 py-2 text-[14px] font-extrabold text-white bg-[#1B64B0] hover:bg-[#154f8d] rounded-full transition-all shadow-sm whitespace-nowrap"
              >
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ================= 2. BREADCRUMBS ================= */}
      <div className="bg-white border-b border-[#E1EBF5]">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-2 truncate">
            <Link href="/" className="hover:text-[#1B64B0] font-medium">
              Trang Chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
            <Link href="/blog" className="hover:text-[#1B64B0] font-medium">
              Blog
            </Link>
            {post && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1]" />
                <span className="truncate text-[#14263D] font-bold max-w-[200px] sm:max-w-md">
                  {post.title}
                </span>
              </>
            )}
          </div>

          <Link
            href="/blog"
            className="flex items-center gap-1.5 text-xs font-bold text-[#1B64B0] hover:underline shrink-0 ml-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Blog</span>
          </Link>
        </div>
      </div>

      {/* ================= 3. MAIN ARTICLE CONTAINER ================= */}
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-10">
        {loading ? (
          <div className="bg-white rounded-3xl border border-[#E1EBF5] p-8 sm:p-12 animate-pulse space-y-6">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-96 bg-slate-100 rounded-2xl"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : !post ? (
          <div className="bg-white rounded-3xl border border-[#E1EBF5] p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-[#14263D]">Không tìm thấy bài viết</h2>
            <p className="text-xs sm:text-sm text-[#55687D]">
              Bài viết này không tồn tại hoặc đã được gỡ bỏ khỏi hệ thống.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B64B0] text-white text-xs font-bold hover:bg-[#154f8d] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay về danh sách Blog</span>
            </Link>
          </div>
        ) : (
          <article className="bg-white rounded-3xl border border-[#E1EBF5] p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
            {/* Header: Category & Share */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="px-3.5 py-1.5 rounded-full bg-[#DDF3FC] text-[#1B64B0] text-xs font-black uppercase tracking-wider">
                {post.category || 'Học Thuật'}
              </span>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#CBD5E1] text-[#55687D] hover:text-[#1B64B0] hover:border-[#1B64B0] text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép liên kết!' : 'Chia sẻ bài viết'}</span>
              </button>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-[#14263D] leading-tight tracking-tight">
              {post.title}
            </h1>

            {/* Meta Info & Author */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E1EBF5]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#1B64B0] to-[#55B8E8] text-white font-black text-base flex items-center justify-center shadow-sm">
                  {post.author?.fullName ? post.author.fullName.charAt(0) : 'T'}
                </div>
                <div>
                  <p className="text-sm font-black text-[#14263D]">
                    {post.author?.fullName || 'Thầy Đông (IELTS 8.5)'}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Giám đốc học thuật Teacher Dong Academy
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#1B64B0]" />
                  <span>
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1B64B0]" />
                  <span>{estimateReadingTime(post.content)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#1B64B0]" />
                  <span>{post.viewCount || 0} lượt đọc</span>
                </span>
              </div>
            </div>

            {/* Featured Media: Image or Video */}
            {post.videoUrl ? (
              <div className="rounded-2xl overflow-hidden aspect-video bg-black shadow-md">
                <video src={post.videoUrl} controls className="w-full h-full object-contain" />
              </div>
            ) : (
              (post.coverImage || post.coverImageUrl) && (
                <div className="rounded-2xl overflow-hidden aspect-video sm:aspect-21/9 bg-slate-100 shadow-sm">
                  <img
                    src={post.coverImage || post.coverImageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            )}

            {/* Summary Highlight Box */}
            {post.summary && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#EBF5FB] to-[#F0FDF4] border-l-4 border-[#1B64B0] space-y-1.5">
                <p className="text-xs font-black uppercase text-[#1B64B0] tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#1B64B0]" />
                  <span>Tóm tắt bài viết</span>
                </p>
                <p className="text-sm sm:text-base font-semibold text-[#14263D] leading-relaxed">
                  {post.summary}
                </p>
              </div>
            )}

            {/* Full Markdown-rendered Body */}
            <div className="prose max-w-none text-[#334155] pt-2">
              {renderFormattedContent(post.content)}
            </div>

            {/* Tags Footer */}
            {post.tags && (
              <div className="pt-6 border-t border-[#E1EBF5] flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#64748B] flex items-center gap-1 mr-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Chủ đề:</span>
                </span>
                {(typeof post.tags === 'string' ? post.tags.split(',') : post.tags).map(
                  (t, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-[#F1F5F9] text-[#475569] text-xs font-semibold"
                    >
                      #{t.trim()}
                    </span>
                  )
                )}
              </div>
            )}
          </article>
        )}

        {/* ================= 4. RELATED ARTICLES ================= */}
        {relatedPosts.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#14263D] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1B64B0]" />
                <span>Bài Viết Cùng Chuyên Mục</span>
              </h3>
              <Link
                href="/blog"
                className="text-xs font-bold text-[#1B64B0] hover:underline flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <article
                  key={rPost.id}
                  className="bg-white rounded-3xl border border-[#E1EBF5] overflow-hidden shadow-xs hover:shadow-md hover:border-[#1B64B0]/40 transition-all flex flex-col justify-between group"
                >
                  <Link
                    href={`/blog/${rPost.slug || rPost.id}`}
                    className="relative aspect-video overflow-hidden bg-slate-100 block"
                  >
                    <img
                      src={
                        rPost.coverImage ||
                        rPost.coverImageUrl ||
                        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={rPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-[#1B64B0]">
                        {rPost.category || 'Học Thuật'}
                      </span>
                      <Link href={`/blog/${rPost.slug || rPost.id}`}>
                        <h4 className="text-sm font-extrabold text-[#14263D] group-hover:text-[#1B64B0] transition-colors line-clamp-2 leading-snug">
                          {rPost.title}
                        </h4>
                      </Link>
                    </div>
                    <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-bold text-[#1B64B0]">
                      <span className="text-[11px] text-[#64748B]">
                        {estimateReadingTime(rPost.content)}
                      </span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Đọc tiếp</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ================= 5. CTA CONSULTATION BANNER ================= */}
        <section className="rounded-3xl bg-gradient-to-r from-[#14263D] to-[#1B64B0] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
              Khởi Đầu Lộ Trình Của Bạn
            </span>
            <h3 className="text-xl sm:text-2xl font-black leading-tight">
              Muốn Nhận Đánh Giá Kỹ Năng & Lộ Trình Học Chi Tiết Cùng Thầy Đông?
            </h3>
            <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
              Hệ thống AI Writing và Speaking Studio tại Teacher Dong Academy sẵn sàng giúp bạn đo lường điểm xuất phát và đề xuất kế hoạch học tập tối ưu.
            </p>
            <div className="pt-2">
              <Link
                href="/#consultation-section"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFB547] hover:bg-[#FFA726] text-[#14263D] font-extrabold text-sm shadow-md transition-all hover:scale-105 active:scale-100"
              >
                <span>Đăng Ký Tư Vấn & Kiểm Tra Trình Độ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ================= 6. FOOTER ================= */}
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
