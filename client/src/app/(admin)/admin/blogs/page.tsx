'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { blogsService, BlogPost } from '@/services/blogs.service';
import CustomSelect from '@/components/ui/custom-select';
import {
  Newspaper,
  Plus,
  Search,
  Eye,
  Edit3,
  Trash2,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  FileText,
  Check,
  Video,
  Tag,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const CATEGORIES = [
  'IELTS Writing',
  'IELTS Speaking',
  'IELTS Reading & Listening',
  'Phương pháp học',
  'Văn hóa & Đời sống',
  'Ngữ pháp & Từ vựng',
];

export default function AdminBlogsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Blog list state
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [modalTab, setModalTab] = useState<'content' | 'media' | 'preview'>('content');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'IELTS Writing',
    summary: '',
    content: '',
    tags: '',
    status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED',
    isFeatured: false,
    videoUrl: '',
  });

  // Cover Image upload state
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  // Inline Image upload state
  const [uploadingInlineImg, setUploadingInlineImg] = useState(false);
  const inlineImgInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Submitting & Deleting state
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Enforce Admin RBAC
  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMIN') {
      router.push('/student/dashboard');
    }
  }, [user, authLoading, router]);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await blogsService.getBlogs({ limit: 100 });
      setBlogs(res.items || []);
    } catch (err) {
      console.error('Lỗi nạp bài viết blog:', err);
      showToast('Không thể tải danh sách bài viết', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filtered list
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesSearch =
        !searchTerm.trim() ||
        b.title.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (b.summary && b.summary.toLowerCase().includes(searchTerm.toLowerCase().trim())) ||
        (typeof b.tags === 'string' && b.tags.toLowerCase().includes(searchTerm.toLowerCase().trim()));

      const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory;

      const matchesStatus =
        selectedStatus === 'ALL' ||
        (selectedStatus === 'PUBLISHED' && (b.status === 'PUBLISHED' || b.published)) ||
        (selectedStatus === 'DRAFT' && b.status === 'DRAFT');

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blogs, searchTerm, selectedCategory, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === 'PUBLISHED' || b.published).length;
    const drafts = blogs.filter((b) => b.status === 'DRAFT').length;
    const totalViews = blogs.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
    return { total, published, drafts, totalViews };
  }, [blogs]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      category: 'IELTS Writing',
      summary: '',
      content: '## Giới thiệu\n\nNội dung mở đầu bài viết chia sẻ kinh nghiệm học tiếng Anh...\n\n### Điểm cốt lõi\n\n- Phương pháp 1: Luyện tập mỗi ngày\n- Phương pháp 2: Áp dụng từ vựng theo chủ đề\n\n> Hãy nhớ rằng sự kiên trì là chìa khóa mở cánh cửa thành công.',
      tags: 'ielts, writing, tips',
      status: 'PUBLISHED',
      isFeatured: false,
      videoUrl: '',
    });
    setCoverFile(null);
    setCoverPreview('');
    setModalTab('content');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      category: post.category || 'IELTS Writing',
      summary: post.summary || '',
      content: post.content || '',
      tags: typeof post.tags === 'string' ? post.tags : Array.isArray(post.tags) ? post.tags.join(', ') : '',
      status: (post.status === 'PUBLISHED' || post.published ? 'PUBLISHED' : 'DRAFT') as 'DRAFT' | 'PUBLISHED',
      isFeatured: !!post.isFeatured,
      videoUrl: post.videoUrl || '',
    });
    setCoverFile(null);
    setCoverPreview(post.coverImage || post.coverImageUrl || '');
    setModalTab('content');
    setIsModalOpen(true);
  };

  // Handle Cover Image selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP)', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Kích thước ảnh bìa tối đa 5MB', 'error');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Handle inline image upload to Cloudinary & insert markdown
  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn file hình ảnh', 'error');
      return;
    }

    setUploadingInlineImg(true);
    try {
      const res = await blogsService.uploadImage(file);
      const imageUrl = res.secureUrl || res.url;
      if (!imageUrl) {
        throw new Error('Không nhận được đường dẫn ảnh');
      }

      // Insert markdown image syntax at cursor position or end
      const textarea = textareaRef.current;
      const markdownImage = `\n\n![Ảnh minh họa](${imageUrl})\n\n`;

      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const oldContent = formData.content;
        const newContent = oldContent.substring(0, start) + markdownImage + oldContent.substring(end);
        setFormData((prev) => ({ ...prev, content: newContent }));
      } else {
        setFormData((prev) => ({ ...prev, content: prev.content + markdownImage }));
      }

      showToast('Đã tải ảnh lên Cloudinary và chèn vào nội dung bài viết!', 'success');
    } catch (err: unknown) {
      console.error('Lỗi tải ảnh:', err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Tải ảnh thất bại, vui lòng thử lại', 'error');
    } finally {
      setUploadingInlineImg(false);
      if (inlineImgInputRef.current) {
        inlineImgInputRef.current.value = '';
      }
    }
  };

  // Insert markdown helpers
  const insertMarkdown = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const oldContent = formData.content;
    const selectedText = oldContent.substring(start, end) || 'Văn bản';
    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = oldContent.substring(0, start) + replacement + oldContent.substring(end);
    setFormData((prev) => ({ ...prev, content: newContent }));
  };

  // Submit Blog Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Vui lòng nhập tiêu đề bài viết', 'error');
      return;
    }
    if (!formData.content.trim()) {
      showToast('Vui lòng nhập nội dung bài viết', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title.trim());
      if (formData.slug.trim()) formPayload.append('slug', formData.slug.trim());
      if (formData.summary.trim()) formPayload.append('summary', formData.summary.trim());
      formPayload.append('content', formData.content.trim());
      formPayload.append('category', formData.category);
      if (formData.tags.trim()) formPayload.append('tags', formData.tags.trim());
      formPayload.append('status', formData.status);
      formPayload.append('isFeatured', String(formData.isFeatured));
      if (formData.videoUrl.trim()) formPayload.append('videoUrl', formData.videoUrl.trim());

      if (coverFile) {
        formPayload.append('coverImage', coverFile);
      } else if (coverPreview && editingPost) {
        formPayload.append('coverImage', coverPreview);
      }

      if (editingPost) {
        await blogsService.updateBlog(editingPost.id, formPayload);
        showToast('Cập nhật bài viết thành công!', 'success');
      } else {
        await blogsService.createBlog(formPayload);
        showToast('Đăng bài viết mới thành công!', 'success');
      }

      setIsModalOpen(false);
      fetchBlogs();
    } catch (err: unknown) {
      console.error('Lỗi lưu bài viết:', err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(msg || 'Có lỗi xảy ra khi lưu bài viết', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle publish status quickly
  const handleToggleStatus = async (post: BlogPost) => {
    try {
      const nextStatus = post.status === 'PUBLISHED' || post.published ? 'DRAFT' : 'PUBLISHED';
      const formPayload = new FormData();
      formPayload.append('status', nextStatus);
      await blogsService.updateBlog(post.id, formPayload);
      showToast(`Đã chuyển trạng thái sang "${nextStatus === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}"`, 'success');
      fetchBlogs();
    } catch {
      showToast('Không thể thay đổi trạng thái bài viết', 'error');
    }
  };

  // Delete Blog
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await blogsService.deleteBlog(deleteConfirmId);
      showToast('Đã xóa bài viết thành công!', 'success');
      setDeleteConfirmId(null);
      fetchBlogs();
    } catch {
      showToast('Xóa bài viết thất bại', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Robust Markdown Parser for Live Preview tab: handles multi-line images, headings, lists, quotes, and paragraphs
  const renderPreviewContent = (text: string) => {
    if (!text) return null;

    const clean = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/!\[([^\]]*)\]\s*\((https?:\/\/[^\s)]+)\)/g, '\n\n![$1]($2)\n\n');

    interface PreviewBlock {
      type: 'image' | 'h2' | 'h3' | 'h4' | 'blockquote' | 'bullet_list' | 'ordered_list' | 'paragraph';
      content?: string;
      alt?: string;
      src?: string;
    }

    const lines = clean.split('\n');
    const blocks: PreviewBlock[] = [];

    let currentType: PreviewBlock['type'] | null = null;
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

      const imgMatch = trimmed.match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
      if (imgMatch) {
        flush();
        blocks.push({ type: 'image', alt: imgMatch[1], src: imgMatch[2] });
        continue;
      }

      if (trimmed.startsWith('## ')) {
        flush();
        blocks.push({ type: 'h2', content: trimmed.replace(/^##\s+/, '') });
        continue;
      }

      if (trimmed.startsWith('### ')) {
        flush();
        blocks.push({ type: 'h3', content: trimmed.replace(/^###\s+/, '') });
        continue;
      }

      if (trimmed.startsWith('#### ')) {
        flush();
        blocks.push({ type: 'h4', content: trimmed.replace(/^####\s+/, '') });
        continue;
      }

      if (trimmed.startsWith('> ')) {
        if (currentType !== 'blockquote') {
          flush();
          currentType = 'blockquote';
        }
        currentLines.push(trimmed.replace(/^>\s*/, ''));
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        if (currentType !== 'bullet_list') {
          flush();
          currentType = 'bullet_list';
        }
        currentLines.push(trimmed.replace(/^[-*]\s+/, ''));
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        if (currentType !== 'ordered_list') {
          flush();
          currentType = 'ordered_list';
        }
        currentLines.push(trimmed.replace(/^\d+\.\s+/, ''));
        continue;
      }

      if (currentType !== 'paragraph') {
        flush();
        currentType = 'paragraph';
      }
      currentLines.push(trimmed);
    }

    flush();

    const parseInline = (rawStr: string) => {
      const parts = rawStr.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
      return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="italic text-sky-700">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="px-1 py-0.5 rounded bg-slate-100 font-mono text-xs text-sky-700">{part.slice(1, -1)}</code>;
        }
        return part;
      });
    };

    return blocks.map((block, idx) => {
      switch (block.type) {
        case 'image':
          return (
            <figure key={idx} className="my-4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={block.src} alt={block.alt || 'Ảnh minh họa'} className="w-full max-h-[460px] object-cover" />
              {block.alt && <figcaption className="text-center text-xs text-slate-500 py-2 bg-white border-t border-slate-100">{block.alt}</figcaption>}
            </figure>
          );
        case 'h2':
          return <h2 key={idx} className="text-lg font-bold text-slate-800 mt-5 mb-2 border-l-4 border-sky-600 pl-3">{parseInline(block.content || '')}</h2>;
        case 'h3':
          return <h3 key={idx} className="text-base font-semibold text-sky-700 mt-4 mb-1.5">{parseInline(block.content || '')}</h3>;
        case 'h4':
          return <h4 key={idx} className="text-sm font-semibold text-slate-800 mt-3 mb-1">{parseInline(block.content || '')}</h4>;
        case 'blockquote':
          return (
            <blockquote key={idx} className="my-3 p-3.5 rounded-lg bg-sky-50 border-l-4 border-sky-500 text-sm italic text-slate-700">
              {(block.content || '').split('\n').map((l, li) => (
                <p key={li} className={li > 0 ? 'mt-1' : ''}>{parseInline(l)}</p>
              ))}
            </blockquote>
          );
        case 'bullet_list':
          return (
            <ul key={idx} className="my-2 space-y-1 list-disc pl-5 text-sm text-slate-700">
              {(block.content || '').split('\n').filter(Boolean).map((it, i) => <li key={i}>{parseInline(it)}</li>)}
            </ul>
          );
        case 'ordered_list':
          return (
            <ol key={idx} className="my-2 space-y-1 list-decimal pl-5 text-sm text-slate-700">
              {(block.content || '').split('\n').filter(Boolean).map((it, i) => <li key={i}>{parseInline(it)}</li>)}
            </ol>
          );
        case 'paragraph':
        default:
          return <p key={idx} className="my-2.5 text-sm text-slate-700 leading-relaxed whitespace-pre-line">{parseInline(block.content || '')}</p>;
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold transition-all animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Hidden Inline Image Uploader */}
      <input
        ref={inlineImgInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInlineImageUpload}
      />

      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quản Lý Bài Viết Blog & Tin Tức
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-extrabold uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Quyền Admin Duy Nhất
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                Chỉ Quản trị viên (Admin) có quyền thêm, sửa nội dung, đính kèm hình ảnh và xuất bản bài viết
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 hover:text-sky-600 transition-all shadow-xs"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Xem trang Blog công khai</span>
          </Link>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Viết bài mới</span>
          </button>
        </div>
      </div>

      {/* 2. Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Tổng bài viết</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Đã xuất bản</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600">{stats.published}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Bản nháp</p>
            <p className="text-xl sm:text-2xl font-black text-amber-600">{stats.drafts}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">Tổng lượt đọc</p>
            <p className="text-xl sm:text-2xl font-black text-purple-600">{stats.totalViews.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, từ khóa, tóm tắt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="w-1/2 md:w-48">
            <CustomSelect
              value={selectedCategory}
              onChange={(val) => setSelectedCategory(val)}
              options={[
                { value: 'ALL', label: 'Tất cả danh mục' },
                ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
              ]}
              placeholder="Chọn danh mục"
            />
          </div>

          {/* Status Filter */}
          <div className="w-1/2 md:w-40">
            <CustomSelect
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'PUBLISHED', label: 'Đã xuất bản' },
                { value: 'DRAFT', label: 'Bản nháp' },
              ]}
              placeholder="Trạng thái"
            />
          </div>

          <button
            onClick={fetchBlogs}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-slate-50 transition-colors"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. Blog Posts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Đang tải danh sách bài viết...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">Không tìm thấy bài viết nào</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              {searchTerm || selectedCategory !== 'ALL' || selectedStatus !== 'ALL'
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                : 'Chưa có bài viết nào trong hệ thống. Hãy bắt đầu viết bài đầu tiên!'}
            </p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-sm hover:bg-sky-700"
            >
              <Plus className="w-4 h-4" />
              <span>+ Viết bài mới ngay</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Bài viết</th>
                  <th className="py-3.5 px-4">Danh mục</th>
                  <th className="py-3.5 px-4">Tác giả</th>
                  <th className="py-3.5 px-4 text-center">Lượt xem</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBlogs.map((post) => {
                  const isPublished = post.status === 'PUBLISHED' || post.published;
                  const cover = post.coverImage || post.coverImageUrl;

                  return (
                    <tr key={post.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Post Title & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5 max-w-md">
                          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                            {cover ? (
                              <img src={cover} alt={post.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 hover:text-sky-600 transition-colors line-clamp-1">
                                {post.title}
                              </span>
                              {post.isFeatured && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black uppercase shrink-0">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Nổi bật
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              /blog/{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold border border-sky-100">
                          <Tag className="w-3 h-3 text-sky-500" />
                          {post.category || 'Chung'}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-700">
                          {post.author?.fullName || 'Teacher Dong'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString('vi-VN')
                            : new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </td>

                      {/* Views */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {(post.viewCount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Status Toggle Button */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(post)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border transition-all ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                          title="Bấm để chuyển đổi Xuất bản / Bản nháp"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          <span>{isPublished ? 'Đã xuất bản' : 'Bản nháp'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Xem trước bài viết trên web"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(post)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Chỉnh sửa bài viết"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(post.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= 5. CREATE / EDIT BLOG MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {editingPost ? 'Chỉnh Sửa Bài Viết Blog' : 'Thêm Bài Viết Blog Mới'}
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Chế độ Admin • Soạn thảo nội dung, tải ảnh lên Cloudinary và định cấu hình
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 border-b border-slate-200 flex gap-4 bg-white text-xs sm:text-sm font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setModalTab('content')}
                className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
                  modalTab === 'content'
                    ? 'border-sky-600 text-sky-600 font-extrabold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>1. Soạn Thảo Nội Dung</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('media')}
                className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
                  modalTab === 'media'
                    ? 'border-sky-600 text-sky-600 font-extrabold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>2. Ảnh Bìa & Cài Đặt</span>
                {coverFile && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </button>

              <button
                type="button"
                onClick={() => setModalTab('preview')}
                className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
                  modalTab === 'preview'
                    ? 'border-sky-600 text-sky-600 font-extrabold'
                    : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>3. Xem Trước (Live Preview)</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: CONTENT EDITOR */}
              {modalTab === 'content' && (
                <div className="space-y-4">
                  {/* Title & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700">
                        Tiêu đề bài viết <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: Chiến thuật đạt Band 8.0 IELTS Writing Task 2..."
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700">Chuyên mục</label>
                      <CustomSelect
                        value={formData.category}
                        onChange={(val) => setFormData({ ...formData, category: val })}
                        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700">
                      Tóm tắt ngắn (Hiện ở thẻ bài viết và đầu bài đọc)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Tóm tắt 1-2 câu súc tích về giá trị bài viết đem lại..."
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* Content Area with Markdown & Image Insertion Toolbar */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-xs font-extrabold text-slate-700">
                        Nội dung chi tiết (Định dạng Markdown) <span className="text-rose-500">*</span>
                      </label>

                      {/* Image Upload Button & Markdown Toolbar */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => inlineImgInputRef.current?.click()}
                          disabled={uploadingInlineImg}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-extrabold transition-all"
                          title="Tải ảnh từ máy tính lên Cloudinary và chèn vào nội dung bài viết"
                        >
                          <Upload className={`w-3.5 h-3.5 ${uploadingInlineImg ? 'animate-bounce text-sky-600' : ''}`} />
                          <span>{uploadingInlineImg ? 'Đang tải ảnh...' : '📸 + Chèn ảnh (Upload)'}</span>
                        </button>

                        <div className="h-4 w-px bg-slate-200 mx-1" />

                        <button
                          type="button"
                          onClick={() => insertMarkdown('## ')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                          title="Tiêu đề H2"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('### ')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                          title="Tiêu đề H3"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('**', '**')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                          title="In đậm"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('*', '*')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-italic"
                          title="In nghiêng"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('> ')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                          title="Trích dẫn"
                        >
                          &ldquo;&rdquo;
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown('- ')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                          title="Gạch đầu dòng"
                        >
                          • List
                        </button>
                      </div>
                    </div>

                    <textarea
                      ref={textareaRef}
                      required
                      rows={12}
                      placeholder="Soạn thảo nội dung bài viết. Bạn có thể bấm nút '+ Chèn ảnh (Upload)' phía trên để tải ảnh trực tiếp từ máy lên Cloudinary..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-mono text-slate-800 leading-relaxed focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    />

                    <p className="text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-1">
                      <span>Cú pháp ảnh: <code>![Mô tả ảnh](https://res.cloudinary.com/...)</code> hoặc bấm nút <strong>+ Chèn ảnh</strong> để tải tự động</span>
                      <span>{formData.content.length} ký tự</span>
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: COVER IMAGE & SETTINGS */}
              {modalTab === 'media' && (
                <div className="space-y-5">
                  {/* Cover Image Upload Area */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-700">
                      Ảnh bìa bài viết (Cover Image)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                      {/* Upload Box */}
                      <label className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/60 hover:bg-sky-50/30 transition-all text-center">
                        <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Bấm để chọn hoặc kéo thả file ảnh bìa
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Hỗ trợ PNG, JPG, WEBP (Tối đa 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverChange}
                        />
                      </label>

                      {/* Cover Preview */}
                      <div className="border border-slate-200 rounded-2xl p-3 bg-white space-y-2">
                        <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Xem trước ảnh bìa
                        </div>
                        {coverPreview ? (
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img
                              src={coverPreview}
                              alt="Ảnh bìa bài viết"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setCoverFile(null);
                                setCoverPreview('');
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors"
                              title="Xóa ảnh bìa"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="aspect-video rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-50 text-xs">
                            <ImageIcon className="w-8 h-8 text-slate-300 mb-1" />
                            <span>Chưa chọn ảnh bìa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Video URL & Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-sky-600" />
                        <span>Video Cloudinary / YouTube (Nếu có)</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://res.cloudinary.com/... hoặc link video"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700">
                        Đường dẫn thân thiện (Slug)
                      </label>
                      <input
                        type="text"
                        placeholder="Để trống hệ thống sẽ tự động tạo từ tiêu đề"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Tags, Status & Featured Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700">
                        Từ khóa (Tags, phân cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        placeholder="ielts, writing, tips"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700">Trạng thái xuất bản</label>
                      <CustomSelect
                        value={formData.status}
                        onChange={(val) => setFormData({ ...formData, status: val as 'DRAFT' | 'PUBLISHED' })}
                        options={[
                          { value: 'PUBLISHED', label: 'Xuất bản công khai (PUBLISHED)' },
                          { value: 'DRAFT', label: 'Lưu bản nháp (DRAFT)' },
                        ]}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700">Đánh dấu nổi bật</label>
                      <label className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                          className="w-4 h-4 text-sky-600 rounded-sm focus:ring-sky-500"
                        />
                        <span>Hiển thị làm bài viết nổi bật (Hero Post)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LIVE PREVIEW */}
              {modalTab === 'preview' && (
                <div className="space-y-4 border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                  <div className="space-y-2">
                    <span className="px-2.5 py-1 rounded-md bg-sky-100 text-sky-800 text-xs font-black uppercase">
                      {formData.category}
                    </span>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">
                      {formData.title || 'Tiêu đề bài viết xem trước'}
                    </h1>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span>Bởi Teacher Dong</span>
                      <span>•</span>
                      <span>Xem trước giao diện người đọc</span>
                    </p>
                  </div>

                  {coverPreview && (
                    <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200">
                      <img src={coverPreview} alt="Preview cover" className="w-full h-full object-cover" />
                    </div>
                  )}

                  {formData.summary && (
                    <div className="p-4 rounded-xl bg-sky-50/80 border-l-4 border-sky-600 text-sm font-medium text-slate-800">
                      {formData.summary}
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs prose max-w-none">
                    {renderPreviewContent(formData.content)}
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-colors"
                >
                  Hủy bỏ
                </button>

                <div className="flex items-center gap-2">
                  {modalTab === 'content' && (
                    <button
                      type="button"
                      onClick={() => setModalTab('media')}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors"
                    >
                      Tiếp theo: Ảnh bìa &gt;
                    </button>
                  )}

                  {modalTab === 'media' && (
                    <button
                      type="button"
                      onClick={() => setModalTab('preview')}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors"
                    >
                      Xem trước bài viết &gt;
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang lưu bài viết...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingPost ? 'Lưu thay đổi' : 'Đăng bài viết'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 6. DELETE CONFIRMATION DIALOG ================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Xác nhận xóa bài viết</h3>
              <p className="text-xs text-slate-500">
                Hành động này sẽ xóa vĩnh viễn bài viết khỏi hệ thống và giải phóng hình ảnh trên Cloudinary. Bạn có chắc chắn muốn xóa không?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all disabled:opacity-50"
              >
                {deleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{deleting ? 'Đang xóa...' : 'Đồng ý xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
