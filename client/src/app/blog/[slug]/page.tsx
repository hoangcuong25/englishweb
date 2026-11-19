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

  // Lock horizontal scroll to 0 on mount & disable scrollRestoration
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
    if (!text) return '1 phút đọc';
    // Lọc bỏ cú pháp ảnh markdown và đường dẫn URL dài để đếm từ chuẩn xác
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

  // Robust Markdown Parser for Blog Content: handles multi-line images, headings, lists, quotes, and paragraphs
  const renderFormattedContent = (content: string) => {
    if (!content) return null;

    // 1. Pre-process text: normalize linebreaks & stitch broken/spaced markdown images
    // Handles cases like `![alt]\n(https://res.cloudinary.com/...)`
    const clean = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/!\[([^\]]*)\]\s*\((https?:\/\/[^\s)]+)\)/g, '\n\n![$1]($2)\n\n');

    interface ContentBlock {
      type: 'image' | 'h2' | 'h3' | 'h4' | 'blockquote' | 'bullet_list' | 'ordered_list' | 'paragraph';
      content?: string;
      alt?: string;
      src?: string;
    }

    const lines = clean.split('\n');
    const blocks: ContentBlock[] = [];

    let currentType: ContentBlock['type'] | null = null;
    let currentLines: string[] = [];

    const flush = () => {
      if (currentLines.length > 0 && currentType) {
        blocks.push({ type: currentType, content: currentLines.join('\n') });
        currentLines = [];
        currentType = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        flush();
        continue;
      }

      // Markdown Image: ![alt](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
      if (imgMatch) {
        flush();
        blocks.push({ type: 'image', alt: imgMatch[1], src: imgMatch[2] });
        continue;
      }

      // Heading 2: ## ...
      if (trimmed.startsWith('## ')) {
        flush();
        blocks.push({ type: 'h2', content: trimmed.replace(/^##\s+/, '') });
        continue;
      }

      // Heading 3: ### ...
      if (trimmed.startsWith('### ')) {
        flush();
        blocks.push({ type: 'h3', content: trimmed.replace(/^###\s+/, '') });
        continue;
      }

      // Heading 4: #### ...
      if (trimmed.startsWith('#### ')) {
        flush();
        blocks.push({ type: 'h4', content: trimmed.replace(/^####\s+/, '') });
        continue;
      }

      // Blockquote: > ...
      if (trimmed.startsWith('> ')) {
        if (currentType !== 'blockquote') {
          flush();
          currentType = 'blockquote';
        }
        currentLines.push(trimmed.replace(/^>\s*/, ''));
        continue;
      }

      // Bullet list: - or *
      if (/^[-*]\s+/.test(trimmed)) {
        if (currentType !== 'bullet_list') {
          flush();
          currentType = 'bullet_list';
        }
        currentLines.push(trimmed.replace(/^[-*]\s+/, ''));
        continue;
      }

      // Numbered list: 1. 2.
      if (/^\d+\.\s+/.test(trimmed)) {
        if (currentType !== 'ordered_list') {
          flush();
          currentType = 'ordered_list';
        }
        currentLines.push(trimmed.replace(/^\d+\.\s+/, ''));
        continue;
      }

      // Normal paragraph text
      if (currentType !== 'paragraph') {
        flush();
        currentType = 'paragraph';
      }
      currentLines.push(trimmed);
    }

    flush();

    return blocks.map((block, idx) => {
      switch (block.type) {
        case 'image':
          return (
            <figure key={idx} className="my-6 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-xs">
              <img
                src={block.src}
                alt={block.alt || 'Ảnh minh họa bài viết'}
                className="w-full max-h-[560px] object-cover rounded-t-xl"
                loading="lazy"
              />
              {block.alt && (
                <figcaption className="text-center text-xs text-slate-500 py-2.5 px-4 italic bg-white border-t border-slate-100">
                  {block.alt}
                </figcaption>
              )}
            </figure>
          );

        case 'h2':
          return (
            <h2
              key={idx}
              className="text-xl sm:text-2xl font-black text-[#14263D] mt-8 mb-4 border-l-4 border-[#1B64B0] pl-3"
            >
              {parseInlineFormatting(block.content || '')}
            </h2>
          );

        case 'h3':
          return (
            <h3
              key={idx}
              className="text-lg sm:text-xl font-bold text-[#14263D] mt-6 mb-3 text-[#1B64B0]"
            >
              {parseInlineFormatting(block.content || '')}
            </h3>
          );

        case 'h4':
          return (
            <h4
              key={idx}
              className="text-base sm:text-lg font-bold text-[#14263D] mt-5 mb-2"
            >
              {parseInlineFormatting(block.content || '')}
            </h4>
          );

        case 'blockquote':
          return (
            <blockquote
              key={idx}
              className="my-5 p-4 sm:p-5 rounded-2xl bg-[#DDF3FC]/40 border-l-4 border-[#1B64B0] text-sm sm:text-base font-medium text-[#14263D] italic shadow-xs"
            >
              {(block.content || '').split('\n').map((line, lIdx) => (
                <p key={lIdx} className={lIdx > 0 ? 'mt-2' : ''}>
                  {parseInlineFormatting(line)}
                </p>
              ))}
            </blockquote>
          );

        case 'bullet_list':
          return (
            <ul key={idx} className="my-4 space-y-2 list-none pl-1">
              {(block.content || '').split('\n').filter(Boolean).map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-[#334155] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B64B0] mt-2.5 shrink-0" />
                  <span>{parseInlineFormatting(item)}</span>
                </li>
              ))}
            </ul>
          );

        case 'ordered_list':
          return (
            <ol key={idx} className="my-4 space-y-2.5 list-none pl-1">
              {(block.content || '').split('\n').filter(Boolean).map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3 text-sm sm:text-base text-[#334155] leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-[#DDF3FC] text-[#1B64B0] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {itemIdx + 1}
                  </span>
                  <span>{parseInlineFormatting(item)}</span>
                </li>
              ))}
            </ol>
          );

        case 'paragraph':
        default:
          return (
            <p key={idx} className="my-4 text-sm sm:text-base text-[#334155] leading-relaxed whitespace-pre-line break-words">
              {parseInlineFormatting(block.content || '')}
            </p>
          );
      }
    });
  };

  // Helper for bold, italic, and code inline
  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
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
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-[#1B64B0]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-x-hidden w-full max-w-full">
      {/* ================= 1. HEADER ================= */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E1EBF5] sticky top-0 z-40 transition-all shadow-xs w-full overflow-hidden">
        <div className="max-w-[1380px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-18 flex items-center justify-between gap-2 sm:gap-4 w-full">
          <Link href="/blog" className="flex items-center gap-2 group min-w-0 max-w-[calc(100%-105px)] sm:max-w-none">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#1B64B0] to-[#55B8E8] flex items-center justify-center text-white font-black text-base sm:text-xl shadow-md shadow-[#1B64B0]/20 group-hover:scale-105 transition-transform shrink-0">
              Đ
            </div>
            <div className="flex flex-col min-w-0 truncate">
              <span className="font-extrabold text-[13px] sm:text-[17px] text-[#14263D] tracking-tight group-hover:text-[#1B64B0] transition-colors leading-tight truncate">
                Teacher Dong Academy
              </span>
              <span className="hidden sm:block text-[10px] sm:text-[11px] font-bold text-[#55687D] tracking-wider uppercase truncate">
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
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-[14px] font-extrabold text-white bg-[#1B64B0] hover:bg-[#154f8d] rounded-full transition-all shadow-sm whitespace-nowrap shrink-0"
              >
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ================= 2. BREADCRUMBS ================= */}
      <div className="bg-white border-b border-[#E1EBF5] w-full overflow-hidden">
        <div className="max-w-[1100px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 text-xs text-[#64748B] w-full min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 truncate">
            <Link href="/" className="hover:text-[#1B64B0] font-medium shrink-0">
              Trang Chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />
            <Link href="/blog" className="hover:text-[#1B64B0] font-medium shrink-0">
              Blog
            </Link>
            {post && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />
                <span className="truncate text-[#14263D] font-bold min-w-0">
                  {post.title}
                </span>
              </>
            )}
          </div>

          <Link
            href="/blog"
            className="flex items-center gap-1 text-xs font-bold text-[#1B64B0] hover:underline shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quay lại Blog</span>
            <span className="sm:hidden">Quay lại</span>
          </Link>
        </div>
      </div>

      {/* ================= 3. MAIN ARTICLE CONTAINER ================= */}
      <main className="max-w-[1100px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-6 sm:space-y-10 min-w-0 overflow-x-hidden">
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
          <article className="bg-white rounded-2xl sm:rounded-3xl border border-[#E1EBF5] p-4 sm:p-10 lg:p-12 shadow-sm space-y-6 sm:space-y-8 w-full min-w-0 overflow-hidden">
            {/* Header: Category & Share */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
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
            <h1 className="text-xl sm:text-4xl font-black text-[#14263D] leading-tight tracking-tight break-words">
              {post.title}
            </h1>

            {/* Meta Info & Author */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-[#E1EBF5]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#1B64B0] to-[#55B8E8] text-white font-black text-sm sm:text-base flex items-center justify-center shadow-sm shrink-0">
                  {post.author?.fullName ? post.author.fullName.charAt(0) : 'T'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-black text-[#14263D] truncate">
                    {post.author?.fullName || 'Thầy Đông (IELTS 8.5)'}
                  </p>
                  <p className="text-[11px] sm:text-xs text-[#64748B] truncate">
                    Giám đốc học thuật Teacher Dong Academy
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs text-[#64748B]">
                <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1B64B0]" />
                  <span>
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1B64B0]" />
                  <span>{estimateReadingTime(post.content)}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1B64B0]" />
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
            <div className="prose max-w-none text-[#334155] pt-2 break-words overflow-hidden">
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
        <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#14263D] to-[#1B64B0] p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
              Khởi Đầu Lộ Trình Của Bạn
            </span>
            <h3 className="text-lg sm:text-2xl font-black leading-tight">
              Muốn Nhận Đánh Giá Kỹ Năng & Lộ Trình Học Chi Tiết Cùng Thầy Đông?
            </h3>
            <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
              Hệ thống AI Writing và Speaking Studio tại Teacher Dong Academy sẵn sàng giúp bạn đo lường điểm xuất phát và đề xuất kế hoạch học tập tối ưu.
            </p>
            <div className="pt-2">
              <Link
                href="/#consultation-section"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#FFB547] hover:bg-[#FFA726] text-[#14263D] font-extrabold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-100 text-center w-full sm:w-auto"
              >
                <span>Đăng Ký Tư Vấn & Kiểm Tra Trình Độ</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ================= 6. FOOTER ================= */}
      <footer className="bg-white border-t border-[#E1EBF5] py-6 sm:py-8 text-center text-xs text-[#64748B] w-full overflow-hidden">
        <div className="max-w-[1380px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p>© {new Date().getFullYear()} Teacher Dong Academy. All rights reserved.</p>
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
