'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  Users,
  Layers,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Sparkles,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  X,
  RefreshCw,
  LayoutGrid,
  List,
  Check,
  Award,
} from 'lucide-react';
import CustomSelect from '@/components/ui/custom-select';
import RichTextEditor from '@/components/shared/rich-text-editor';
import { toast } from '@/components/ui/toast';
import { coursesService, Course, getCourseCoverUrl, DEFAULT_COVERS } from '@/services/courses.service';
import { extractErrorMessage } from '@/lib/api-error';

function AdminCoursesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<'ALL' | 'ENGLISH' | 'PERSONAL_DEV'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal Create / Edit Course state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'IELTS',
    level: 'INTERMEDIATE',
    price: 0,
    thumbnail: '',
    isPublished: true,
  });

  // Fetch Courses
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await coursesService.getCourses();
      if (Array.isArray(data)) {
        setCourses(
          data.map((c: any) => ({
            ...c,
            id: String(c.id || ''),
            category: c.category || 'IELTS',
            isPublished: c.isPublished ?? c.published ?? false,
            moduleCount: c.moduleCount ?? c._count?.modules ?? 0,
            studentCount: c.studentCount ?? c._count?.enrollments ?? 0,
          }))
        );
      }
    } catch (err) {
      toast.error(`Lỗi tải danh sách khóa học: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Category Options
  const categoryOptions = [
    { value: 'ALL', label: 'Tất cả danh mục' },
    { value: 'IELTS', label: 'IELTS Master (Academic & General)' },
    { value: 'ENGLISH', label: 'General English (Giao tiếp & Ngữ pháp)' },
    { value: 'BUSINESS', label: 'Business English (Thương mại)' },
    { value: 'KIDS', label: 'Kids English (Tiếng Anh thiếu nhi)' },
    { value: 'PEDAGOGY', label: 'Nghiệp Vụ Sư Phạm & Giảng Dạy' },
    { value: 'LIFE_SKILLS', label: 'Kỹ Năng Sống & Phát Triển Bản Thân' },
    { value: 'SOFT_SKILLS', label: 'Kỹ Năng Mềm Doanh Nghiệp' },
  ];

  const levelOptions = [
    { value: 'BEGINNER', label: 'Cơ bản (Beginner / Band 3.0 - 4.5)' },
    { value: 'INTERMEDIATE', label: 'Trung cấp (Intermediate / Band 5.0 - 6.5)' },
    { value: 'ADVANCED', label: 'Nâng cao (Advanced / Band 7.0 - 8.5+)' },
    { value: 'ALL_LEVELS', label: 'Mọi trình độ (All Levels)' },
  ];

  // Counters
  const englishCoursesCount = useMemo(() => {
    return courses.filter((c) =>
      ['IELTS', 'ENGLISH', 'BUSINESS', 'KIDS'].includes(c.category) || c.isEnglishCourse
    ).length;
  }, [courses]);

  const devCoursesCount = useMemo(() => {
    return courses.filter((c) =>
      ['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(c.category)
    ).length;
  }, [courses]);

  const publishedCount = useMemo(() => {
    return courses.filter((c) => c.isPublished).length;
  }, [courses]);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // 1. Track filter
      if (trackFilter === 'ENGLISH') {
        const isEng = ['IELTS', 'ENGLISH', 'BUSINESS', 'KIDS'].includes(c.category) || c.isEnglishCourse;
        if (!isEng) return false;
      } else if (trackFilter === 'PERSONAL_DEV') {
        const isDev = ['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(c.category);
        if (!isDev) return false;
      }

      // 2. Category filter
      if (categoryFilter !== 'ALL' && c.category !== categoryFilter) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.title?.toLowerCase().includes(q);
        const matchDesc = c.description?.toLowerCase().includes(q);
        const matchCat = c.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }

      return true;
    });
  }, [courses, trackFilter, categoryFilter, searchQuery]);

  // Handle open Create Course
  const handleOpenCreateModal = () => {
    setEditingCourseId(null);
    const initialCategory = trackFilter === 'PERSONAL_DEV' ? 'PEDAGOGY' : 'IELTS';
    setFormData({
      title: '',
      description: '',
      category: initialCategory,
      level: 'INTERMEDIATE',
      price: 0,
      thumbnail: '',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  // Handle open Edit Course
  const handleOpenEditModal = (course: Course, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCourseId(course.id);
    setFormData({
      title: course.title,
      description: course.description || '',
      category: course.category || 'IELTS',
      level: course.level || 'INTERMEDIATE',
      price: course.price ?? 0,
      thumbnail: course.thumbnail || course.thumbnailUrl || '',
      isPublished: course.isPublished ?? course.published ?? false,
    });
    setIsModalOpen(true);
  };

  // Handle Save Course
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề khóa học!');
      return;
    }

    setSubmittingCourse(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        level: formData.level,
        price: Number(formData.price) || 0,
        thumbnail: formData.thumbnail?.trim() || undefined,
        isPublished: formData.isPublished,
      };

      if (editingCourseId) {
        await coursesService.updateCourse(editingCourseId, payload);
        toast.success(`Đã cập nhật khóa học "${formData.title}"!`);
        setIsModalOpen(false);
        await fetchCourses();
      } else {
        const created = await coursesService.createCourse(payload);
        const newId = created?.data?.id || created?.id;
        toast.success(`Đã tạo khóa học "${formData.title}"! Đang chuyển đến trang giáo trình...`);
        setIsModalOpen(false);
        await fetchCourses();
        if (newId) {
          router.push(`/admin/courses/${newId}`);
        }
      }
    } catch (err) {
      toast.error(`Lỗi khi lưu khóa học: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setSubmittingCourse(false);
    }
  };

  // Handle Delete Course
  const handleDeleteCourse = async (courseId: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Bạn có chắc muốn xóa khóa học "${title}"? Mọi chương bài học liên quan sẽ bị gỡ bỏ.`)) {
      return;
    }
    try {
      await coursesService.deleteCourse(courseId);
      toast.success('Đã xóa khóa học thành công!');
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      toast.error(`Lỗi khi xóa khóa học: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    }
  };

  // Handle Toggle Publish
  const handleTogglePublish = async (course: Course, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = !course.isPublished;
    try {
      await coursesService.updateCourse(course.id, { isPublished: newStatus });
      toast.success(newStatus ? 'Đã xuất bản khóa học công khai!' : 'Đã chuyển khóa học về chế độ Bản nháp.');
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, isPublished: newStatus } : c))
      );
    } catch (err) {
      toast.error(`Lỗi cập nhật trạng thái: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    }
  };

  // Upload Cover Image
  const handleUploadCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh (JPG, PNG, WebP)!');
      return;
    }

    setIsUploadingCover(true);
    try {
      const res = await coursesService.uploadThumbnailFile(file);
      if (res?.url) {
        setFormData((prev) => ({ ...prev, thumbnail: res.url }));
        toast.success('Đã tải lên ảnh bìa thành công!');
      }
    } catch (err) {
      toast.error(`Lỗi tải ảnh: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'IELTS':
        return { label: 'IELTS Master', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'BUSINESS':
        return { label: 'Business English', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ENGLISH':
        return { label: 'General English', color: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'KIDS':
        return { label: 'Kids English', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'PEDAGOGY':
        return { label: 'Nghiệp Vụ Sư Phạm', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'LIFE_SKILLS':
        return { label: 'Kỹ Năng Sống', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'SOFT_SKILLS':
        return { label: 'Kỹ Năng Mềm', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      default:
        return { label: category, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-16">
      {/* 1. TOP HEADER & PRIMARY ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Academy Course Management
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              2 Phân Hệ Đào Tạo
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <span>Quản Lý Khóa Học & Đào Tạo</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Danh mục tất cả các khóa học. Bấm vào bất kỳ khóa học nào để vào trang chi tiết quản lý giáo trình và bài học.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-md shadow-primary/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Khóa Học Mới</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-3xl border border-line shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-primary flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tổng Khóa Học
            </span>
            <span className="text-xl font-black text-slate-900">{courses.length}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-line shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tiếng Anh & IELTS
            </span>
            <span className="text-xl font-black text-slate-900">{englishCoursesCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-line shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Sư Phạm & Kỹ Năng
            </span>
            <span className="text-xl font-black text-slate-900">{devCoursesCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-line shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Đang Phát Hành
            </span>
            <span className="text-xl font-black text-emerald-600">{publishedCount}</span>
          </div>
        </div>
      </div>

      {/* 3. FILTER TABS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-3xl border border-line shadow-xs space-y-3.5">
        {/* Track Tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-line pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'ALL', label: 'Tất Cả Khóa Học', count: courses.length },
              { id: 'ENGLISH', label: 'Tiếng Anh & IELTS', count: englishCoursesCount },
              { id: 'PERSONAL_DEV', label: 'Phát Triển Cá Nhân & Sư Phạm', count: devCoursesCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTrackFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  trackFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    trackFilter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Xem dạng lưới thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Xem dạng bảng"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter dropdowns & search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm khóa học theo tên hoặc mô tả..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
            />
          </div>

          <CustomSelect
            label=""
            value={categoryFilter}
            onChange={(val) => setCategoryFilter(val)}
            options={categoryOptions}
          />

          <div className="flex items-center justify-end text-xs text-muted font-bold self-center">
            Hiển thị: <span className="text-slate-900 ml-1">{filteredCourses.length} khóa học</span>
          </div>
        </div>
      </div>

      {/* 4. COURSES CATALOG LISTING */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-line p-16 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
          <p className="text-xs font-bold text-slate-500">Đang tải danh sách khóa học...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-line p-16 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">Không tìm thấy khóa học nào phù hợp</h3>
          <p className="text-xs text-muted max-w-md mx-auto">
            {searchQuery || categoryFilter !== 'ALL'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.'
              : 'Chưa có khóa học nào trong phân hệ này. Bấm nút bên dưới để tạo khóa học đầu tiên!'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tạo Khóa Học Mới</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((c) => {
            const badge = getCategoryBadge(c.category);
            const cover = getCourseCoverUrl(c.thumbnail || c.thumbnailUrl, c.category);

            return (
              <div
                key={c.id}
                onClick={() => router.push(`/admin/courses/${c.id}`)}
                className="bg-white rounded-3xl border border-line hover:border-primary/50 shadow-xs hover:shadow-md transition duration-200 overflow-hidden flex flex-col group cursor-pointer"
              >
                {/* Thumbnail Cover */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <img
                    src={cover}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                  {/* Badges on top of cover */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black border shadow-xs backdrop-blur-md bg-white/95 ${badge.color}`}
                    >
                      {badge.label}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                        c.isPublished
                          ? 'bg-emerald-500/90 text-white shadow-xs'
                          : 'bg-slate-800/80 text-white'
                      }`}
                    >
                      {c.isPublished ? 'Đã phát hành' : 'Bản nháp'}
                    </span>
                  </div>

                  {/* Price & Level bottom tags */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                    <span className="font-extrabold text-amber-300 drop-shadow-sm">
                      {c.price ? `${Number(c.price).toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-200 bg-slate-900/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {c.level || 'Intermediate'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-primary transition line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                      {c.description || 'Chương trình đào tạo chuẩn sư phạm, bài tập thực chiến và kiểm tra năng lực.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-line space-y-3">
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5" title="Số chương học">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-slate-700">{c.moduleCount ?? 0}</span> chương
                      </div>
                      <div className="flex items-center gap-1.5" title="Số học viên ghi danh">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-bold text-slate-700">{c.studentCount ?? 0}</span> học viên
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/courses/${c.id}`);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-primary font-black text-xs transition flex items-center justify-center gap-1.5 border border-sky-200"
                      >
                        <span>Quản Lý Giáo Trình</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(c, e)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Sửa thông tin khóa học"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleTogglePublish(c, e)}
                          className={`p-2 rounded-xl transition ${
                            c.isPublished
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title={c.isPublished ? 'Ẩn khóa học' : 'Xuất bản khóa học'}
                        >
                          {c.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCourse(c.id, c.title, e)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Xóa khóa học"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE MODE */
        <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-line text-slate-400 font-black uppercase text-[10.5px]">
                <tr>
                  <th className="py-3.5 px-4">Khóa Học</th>
                  <th className="py-3.5 px-4">Phân Hệ</th>
                  <th className="py-3.5 px-4">Cấp Độ</th>
                  <th className="py-3.5 px-4">Học Phí</th>
                  <th className="py-3.5 px-4 text-center">Chương</th>
                  <th className="py-3.5 px-4 text-center">Học Viên</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredCourses.map((c) => {
                  const badge = getCategoryBadge(c.category);
                  const cover = getCourseCoverUrl(c.thumbnail || c.thumbnailUrl, c.category);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/admin/courses/${c.id}`)}
                      className="hover:bg-slate-50/80 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={cover}
                            alt=""
                            className="w-12 h-8 rounded-lg object-cover border border-line shrink-0"
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 group-hover:text-primary transition block">
                              {c.title}
                            </span>
                            <span className="text-[11px] text-muted truncate max-w-xs block">
                              {c.description || 'Chưa có mô tả'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-600">
                        {c.level || 'Intermediate'}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                        {c.price ? `${Number(c.price).toLocaleString('vi-VN')} đ` : 'Miễn phí'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-primary whitespace-nowrap">
                        {c.moduleCount ?? 0}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600 whitespace-nowrap">
                        {c.studentCount ?? 0}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            c.isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.isPublished ? 'Đã phát hành' : 'Bản nháp'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/courses/${c.id}`);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-sky-50 text-primary font-bold text-xs hover:bg-sky-100 transition border border-sky-200"
                        >
                          Chi Tiết ➔
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(c, e)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 transition rounded-lg hover:bg-slate-100"
                          title="Sửa thông tin"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCourse(c.id, c.title, e)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                          title="Xóa khóa học"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODAL CREATE / EDIT COURSE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-line p-6 sm:p-7 space-y-4 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                  Khóa học
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {editingCourseId ? 'Chỉnh Sửa Thông Tin Khóa Học' : 'Tạo Khóa Học Đào Tạo Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: IELTS Intensive Band 6.5 -> 7.5+ Masterclass"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              {/* Category & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CustomSelect
                  label="Phân hệ đào tạo *"
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  options={categoryOptions.filter((c) => c.value !== 'ALL')}
                />

                <CustomSelect
                  label="Cấp độ học viên *"
                  value={formData.level}
                  onChange={(val) => setFormData({ ...formData, level: val })}
                  options={levelOptions}
                />
              </div>

              {/* Price & Published Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Học phí (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="0 = Miễn phí"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="p-3 rounded-xl border border-line bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Trạng thái phát hành</span>
                    <span className="text-[10px] text-muted">Hiển thị cho học viên</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>

              {/* Description Rich Text Editor */}
              <RichTextEditor
                label="Mô tả mục tiêu & chuẩn đầu ra khóa học"
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                placeholder="Mô tả đối tượng học viên, kiến thức trọng tâm, chuẩn đầu ra, phương pháp giảng dạy..."
                minHeight="min-h-[140px]"
                helperText="Hỗ trợ in đậm, in nghiêng, gạch đầu dòng, danh sách quyền lợi khóa học."
              />

              {/* Thumbnail Cover Image */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Ảnh bìa khóa học (Cover Thumbnail)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="text-[11px] text-primary hover:underline font-bold flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{isUploadingCover ? 'Đang tải lên...' : 'Tải ảnh từ máy tính'}</span>
                  </button>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadCoverFile}
                    className="hidden"
                  />
                </div>

                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/... (hoặc để trống để dùng ảnh mặc định)"
                  className="w-full px-3 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                />

                {/* Cover preview */}
                <div className="mt-2 p-2 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                  <img
                    src={getCourseCoverUrl(formData.thumbnail, formData.category)}
                    alt="Preview"
                    className="w-20 h-12 object-cover rounded-lg border border-line"
                  />
                  <div className="text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800">Ảnh xem trước hiển thị</span>
                    <p className="text-slate-400 text-[10px]">
                      {formData.thumbnail ? 'Ảnh tùy chỉnh' : 'Ảnh chuẩn mặc định theo phân hệ'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-line flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingCourse}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-primary/20 transition flex items-center gap-1.5"
                >
                  {submittingCourse && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Check className="w-4 h-4" />
                  <span>
                    {editingCourseId
                      ? 'Lưu Thay Đổi Khóa Học'
                      : 'Tạo Khóa Học & Đi Đến Soạn Giáo Trình'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-muted">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
          <p className="text-xs font-bold">Đang tải danh sách khóa học...</p>
        </div>
      }
    >
      <AdminCoursesContent />
    </Suspense>
  );
}
