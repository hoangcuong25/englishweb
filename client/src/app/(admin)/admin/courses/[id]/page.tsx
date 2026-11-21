'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Layers,
  FileText,
  Video,
  Upload,
  Edit3,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  FolderOpen,
  FileCheck,
  Award,
  Play,
  X,
  Check,
  Sparkles,
  Search,
  ExternalLink,
  Image as ImageIcon,
  Headphones,
} from 'lucide-react';
import { toast } from '@/components/ui/toast';
import CustomSelect from '@/components/ui/custom-select';
import RichTextEditor from '@/components/shared/rich-text-editor';
import { coursesService, Course, CourseEnrollment, getCourseCoverUrl } from '@/services/courses.service';
import { lessonsService } from '@/services/lessons.service';
import { usersService, UserProfile } from '@/services/users.service';
import { materialsService, Material, SignedUrlResponse } from '@/services/materials.service';
import { extractErrorMessage } from '@/lib/api-error';
import { useCurrency } from '@/lib/currency-context';

interface AttachedMaterial {
  id: string;
  title: string;
  type: string;
  fileKey?: string;
  fileSize?: number;
  lessonId?: string;
  createdAt?: string;
  children?: any[];
}

interface LessonItem {
  id: string;
  title: string;
  order: number;
  durationMinutes?: number;
  content?: string;
  videoUrl?: string;
  type?: string;
  materials?: AttachedMaterial[];
  quizzes?: any[];
}

interface ModuleItem {
  id: string;
  title: string;
  order: number;
  lessons: LessonItem[];
}

function CourseDetailContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const { formatPrice, convertToUsd, formatUsd, formatVnd, currency } = useCurrency();

  // Course Details State
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'curriculum' | 'materials' | 'enrollments'>('curriculum');

  // Curriculum State
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Materials & Enrollments State
  const [courseMaterials, setCourseMaterials] = useState<AttachedMaterial[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrollmentSearch, setEnrollmentSearch] = useState('');

  // Modals State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [submittingModule, setSubmittingModule] = useState(false);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [targetModuleId, setTargetModuleId] = useState('');
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    content: '',
    durationMinutes: 20,
    videoUrl: '',
    order: 1,
  });
  const [submittingLesson, setSubmittingLesson] = useState(false);

  // Video Upload Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [uploadLessonId, setUploadLessonId] = useState<string | null>(null);
  const [uploadLessonTitle, setUploadLessonTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Manual Enroll Modal State
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState<UserProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [enrollNote, setEnrollNote] = useState('');
  const [submittingEnroll, setSubmittingEnroll] = useState(false);

  // Course Edit Modal State
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    slug: '',
    track: 'ENGLISH' as 'ENGLISH' | 'PERSONAL_DEV',
    category: 'IELTS',
    level: 'BEGINNER',
    price: 0,
    description: '',
    thumbnail: '',
    isPublished: false,
  });
  const [submittingCourseEdit, setSubmittingCourseEdit] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Material Upload Modal State
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialLessonId, setMaterialLessonId] = useState('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialAudioFile, setMaterialAudioFile] = useState<File | null>(null);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const materialFileInputRef = useRef<HTMLInputElement>(null);
  const materialAudioInputRef = useRef<HTMLInputElement>(null);

  // Fetch Course Details & Curriculum
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setLoadingCurriculum(true);
    try {
      const data = await coursesService.getCourseBySlug(courseId);
      if (data) {
        setCourse({
          ...data,
          id: String(data.id || ''),
          category: data.category || 'IELTS',
          isPublished: data.isPublished ?? data.published ?? false,
        });

        // Map materials
        const materialsList: AttachedMaterial[] = [];
        const seenIds = new Set<string>();

        if (Array.isArray((data as any).materials)) {
          (data as any).materials.forEach((m: any) => {
            if (m.id && !seenIds.has(m.id)) {
              seenIds.add(m.id);
              materialsList.push({
                id: m.id,
                title: m.title || 'Tài liệu học tập',
                type: m.type || 'DOCUMENT',
                fileKey: m.fileKey,
                fileSize: m.fileSize,
                lessonId: m.lessonId,
                createdAt: m.createdAt,
                children: m.children,
              });
            }
          });
        }

        try {
          const directMaterials = await materialsService.getAll({ courseId: data.id });
          if (directMaterials && Array.isArray(directMaterials.items)) {
            directMaterials.items.forEach((m: any) => {
              if (m.id && !seenIds.has(m.id)) {
                seenIds.add(m.id);
                materialsList.push({
                  id: m.id,
                  title: m.title || 'Tài liệu học tập',
                  type: m.type || 'DOCUMENT',
                  fileKey: (m as any).fileKey,
                  fileSize: m.fileSize,
                  lessonId: m.lessonId,
                  createdAt: m.createdAt,
                  children: m.children,
                });
              }
            });
          }
        } catch {
          // ignore fallback
        }

        setCourseMaterials(materialsList);

        // Map modules & lessons
        if (Array.isArray(data.modules)) {
          const mappedModules: ModuleItem[] = data.modules.map((m: any, mIdx: number) => ({
            id: m.id || `mod-${mIdx + 1}`,
            title: m.title || `Chương ${mIdx + 1}`,
            order: m.orderIndex ?? m.order ?? mIdx + 1,
            lessons: Array.isArray(m.lessons)
              ? m.lessons.map((l: any, lIdx: number) => ({
                  id: l.id || `les-${lIdx + 1}`,
                  title: l.title || `Bài học ${lIdx + 1}`,
                  order: l.orderIndex ?? l.order ?? lIdx + 1,
                  durationMinutes: l.durationMinutes ?? 20,
                  content: l.content || '',
                  videoUrl: l.videoUrl || '',
                  type: l.type || 'VIDEO',
                  materials: Array.isArray(l.materials)
                    ? l.materials.map((mat: any) => ({
                        id: mat.id,
                        title: mat.title,
                        type: mat.type,
                        fileSize: mat.fileSize,
                      }))
                    : [],
                  quizzes: Array.isArray(l.quizzes) ? l.quizzes : [],
                }))
              : [],
          }));

          setModules(mappedModules);

          // Expand all modules by default
          const exp: Record<string, boolean> = {};
          mappedModules.forEach((m) => {
            exp[m.id] = true;
          });
          setExpandedModules(exp);
        } else {
          setModules([]);
        }
      }
    } catch (err) {
      toast.error(`Lỗi tải thông tin khóa học: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setLoading(false);
      setLoadingCurriculum(false);
    }
  }, [courseId]);

  // Fetch Enrollments for this course
  const fetchEnrollments = useCallback(async () => {
    if (!courseId) return;
    setLoadingEnrollments(true);
    try {
      const res = await coursesService.getAdminEnrollments(undefined, courseId);
      if (Array.isArray(res)) {
        setEnrollments(res);
      }
    } catch {
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  }, [courseId]);

  // Fetch Students for manual enrollment modal
  const fetchStudents = async () => {
    try {
      const res = await usersService.getUsers({ role: 'STUDENT', limit: 100 });
      const list = Array.isArray(res) ? res : (res as any)?.items || [];
      setStudentsList(list);
      if (list.length > 0 && !selectedStudentId) {
        setSelectedStudentId(list[0].id);
      }
    } catch {
      setStudentsList([]);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  useEffect(() => {
    if (activeTab === 'enrollments') {
      fetchEnrollments();
    }
  }, [activeTab, fetchEnrollments]);

  // Counters
  const totalLessonsCount = useMemo(() => {
    return modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
  }, [modules]);

  // Toggle Module Expand/Collapse
  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // Toggle Publish
  const handleTogglePublish = async () => {
    if (!course) return;
    const newStatus = !course.isPublished;
    try {
      await coursesService.updateCourse(course.id, { isPublished: newStatus });
      setCourse((prev) => (prev ? { ...prev, isPublished: newStatus } : null));
      toast.success(newStatus ? 'Đã xuất bản khóa học công khai!' : 'Đã chuyển khóa học về chế độ Bản nháp.');
    } catch (err) {
      toast.error(`Lỗi cập nhật trạng thái: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    }
  };

  // Delete Course
  const handleDeleteCourse = async () => {
    if (!course) return;
    if (!confirm(`Bạn có chắc muốn xóa vĩnh viễn khóa học "${course.title}"?`)) return;
    try {
      await coursesService.deleteCourse(course.id);
      toast.success('Đã xóa khóa học!');
      router.push('/admin/courses');
    } catch (err) {
      toast.error(`Lỗi khi xóa khóa học: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    }
  };

  // Open Edit Course Modal
  const handleOpenEditCourse = () => {
    if (!course) return;
    setCourseFormData({
      title: course.title || '',
      slug: course.slug || '',
      track: ((course as any).track as any) || 'ENGLISH',
      category: course.category || 'IELTS',
      level: course.level || 'BEGINNER',
      price: course.price ? Number(course.price) : 0,
      description: course.description || '',
      thumbnail: course.thumbnail || (course as any).thumbnailUrl || '',
      isPublished: course.isPublished || false,
    });
    setIsEditCourseModalOpen(true);
  };

  // Upload Cover Image
  const handleUploadCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingCover(true);
      const res = await coursesService.uploadThumbnailFile(file);
      if (res && res.url) {
        setCourseFormData((prev) => ({ ...prev, thumbnail: res.url }));
        toast.success('Đã tải ảnh bìa lên thành công!');
      }
    } catch (err) {
      toast.error(`Lỗi tải ảnh bìa: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  // Save Course Edit
  const handleSaveCourseEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    try {
      setSubmittingCourseEdit(true);
      await coursesService.updateCourse(course.id, {
        title: courseFormData.title.trim(),
        slug: courseFormData.slug.trim(),
        track: courseFormData.track,
        category: courseFormData.category,
        level: courseFormData.level,
        price: courseFormData.price,
        description: courseFormData.description,
        thumbnail: courseFormData.thumbnail || undefined,
        isPublished: courseFormData.isPublished,
      });
      toast.success('Đã cập nhật thông tin khóa học thành công!');
      setIsEditCourseModalOpen(false);
      await fetchCourseData();
    } catch (err) {
      toast.error(`Lỗi lưu khóa học: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setSubmittingCourseEdit(false);
    }
  };

  // =========================================================================
  // MODULE CRUD
  // =========================================================================
  const handleOpenAddModule = () => {
    setEditingModuleId(null);
    setModuleTitle(`Chương ${modules.length + 1}: `);
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: ModuleItem) => {
    setEditingModuleId(mod.id);
    setModuleTitle(mod.title);
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) {
      toast.error('Vui lòng nhập tên chương!');
      return;
    }

    setSubmittingModule(true);
    try {
      if (editingModuleId) {
        await lessonsService.updateModule(editingModuleId, { title: moduleTitle.trim() });
        toast.success('Đã cập nhật tên chương!');
      } else {
        await lessonsService.createModule({
          courseId,
          title: moduleTitle.trim(),
          order: modules.length + 1,
        });
        toast.success('Đã thêm chương mới thành công!');
      }
      setIsModuleModalOpen(false);
      await fetchCourseData();
    } catch (err) {
      toast.error(`Lỗi khi lưu chương: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setSubmittingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa chương "${title}" và toàn bộ bài học bên trong?`)) return;
    try {
      await lessonsService.deleteModule(moduleId);
      toast.success('Đã xóa chương thành công!');
      await fetchCourseData();
    } catch (err) {
      toast.error(`Lỗi khi xóa chương: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    }
  };

  // =========================================================================
  // LESSON CRUD
  // =========================================================================
  const handleOpenAddLesson = (moduleId: string) => {
    const parentMod = modules.find((m) => m.id === moduleId);
    const existingLessons = parentMod?.lessons?.length || 0;

    setEditingLessonId(null);
    setTargetModuleId(moduleId);
    setLessonFormData({
      title: `Bài ${existingLessons + 1}: `,
      content: '',
      durationMinutes: 25,
      videoUrl: '',
      order: existingLessons + 1,
    });
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson: LessonItem, moduleId: string) => {
    setEditingLessonId(lesson.id);
    setTargetModuleId(moduleId);
    setLessonFormData({
      title: lesson.title,
      content: lesson.content || '',
      durationMinutes: lesson.durationMinutes ?? 25,
      videoUrl: lesson.videoUrl || '',
      order: lesson.order ?? 1,
    });
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonFormData.title.trim()) {
      toast.error('Vui lòng nhập tên bài học!');
      return;
    }

    setSubmittingLesson(true);
    try {
      const payload = {
        title: lessonFormData.title.trim(),
        content: lessonFormData.content || undefined,
        durationMinutes: Number(lessonFormData.durationMinutes) || 20,
        videoUrl: lessonFormData.videoUrl?.trim() || undefined,
        order: Number(lessonFormData.order) || 1,
      };

      if (editingLessonId) {
        await lessonsService.updateLesson(editingLessonId, payload);
        toast.success('Đã cập nhật bài học!');
      } else {
        await lessonsService.createLesson({
          ...payload,
          moduleId: targetModuleId,
        });
        toast.success('Đã thêm bài học mới thành công!');
      }
      setIsLessonModalOpen(false);
      await fetchCourseData();
    } catch (err) {
      toast.error(`Lỗi khi lưu bài học: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa bài học "${title}"?`)) return;
    try {
      await lessonsService.deleteLesson(lessonId);
      toast.success('Đã xóa bài học thành công!');
      await fetchCourseData();
    } catch (err) {
      toast.error(`Lỗi khi xóa bài học: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    }
  };

  // =========================================================================
  // LESSON VIDEO UPLOAD
  // =========================================================================
  const handleOpenVideoUpload = (lesson: LessonItem) => {
    setUploadLessonId(lesson.id);
    setUploadLessonTitle(lesson.title);
    setUploadProgress(0);
    setIsVideoModalOpen(true);
  };

  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadLessonId) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Vui lòng chọn file video hợp lệ (MP4, WebM, MOV)!');
      return;
    }

    setIsUploadingVideo(true);
    setUploadProgress(10);
    try {
      await coursesService.uploadLessonVideo(uploadLessonId, file, (percent) => {
        setUploadProgress(percent);
      });
      toast.success(`Đã nạp video bài giảng thành công cho bài "${uploadLessonTitle}"!`);
      setIsVideoModalOpen(false);
      await fetchCourseData();
    } catch (err) {
      toast.error(`Lỗi tải video bài giảng: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // =========================================================================
  // MANUAL ENROLLMENT
  // =========================================================================
  const handleOpenManualEnroll = () => {
    fetchStudents();
    setEnrollNote('');
    setIsEnrollModalOpen(true);
  };

  const handleExecuteManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      toast.error('Vui lòng chọn học viên cần ghi danh!');
      return;
    }

    setSubmittingEnroll(true);
    try {
      await coursesService.manualEnroll({
        courseId,
        userId: selectedStudentId,
        note: enrollNote.trim() || undefined,
      });
      toast.success('Đã ghi danh học viên vào khóa học thành công!');
      setIsEnrollModalOpen(false);
      await fetchEnrollments();
    } catch (err) {
      toast.error(`Lỗi khi ghi danh: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setSubmittingEnroll(false);
    }
  };

  const handleApproveEnrollment = async (enrollId: string) => {
    try {
      await coursesService.approveEnrollment(enrollId);
      toast.success('Đã duyệt học viên vào khóa học!');
      await fetchEnrollments();
    } catch (err) {
      toast.error(`Lỗi duyệt: ${extractErrorMessage(err, 'Thất bại')}`);
    }
  };

  const handleRejectEnrollment = async (enrollId: string) => {
    if (!confirm('Bạn có chắc muốn hủy đăng ký của học viên này?')) return;
    try {
      await coursesService.rejectEnrollment(enrollId);
      toast.success('Đã hủy đăng ký!');
      await fetchEnrollments();
    } catch (err) {
      toast.error(`Lỗi hủy: ${extractErrorMessage(err, 'Thất bại')}`);
    }
  };

  // =========================================================================
  // MATERIALS MANAGEMENT HANDLERS (CLOUDINARY & SIGNED ACCESS)
  // =========================================================================
  const allLessons = useMemo(() => {
    const list: { id: string; title: string; moduleTitle: string }[] = [];
    modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        list.push({ id: les.id, title: les.title, moduleTitle: mod.title });
      });
    });
    return list;
  }, [modules]);

  const handleOpenAddMaterial = () => {
    setMaterialTitle('');
    setMaterialLessonId('');
    setMaterialFile(null);
    setMaterialAudioFile(null);
    setIsMaterialModalOpen(true);
  };

  const handleSelectMaterialFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMaterialFile(file);
      if (!materialTitle) {
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        setMaterialTitle(baseName);
      }
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialFile) {
      toast.error('Vui lòng chọn tệp tài liệu để tải lên!');
      return;
    }
    if (!course?.id) {
      toast.error('Không tìm thấy thông tin khóa học!');
      return;
    }

    setIsUploadingMaterial(true);
    try {
      const formData = new FormData();
      formData.append('file', materialFile);
      if (materialAudioFile) {
        formData.append('audio', materialAudioFile);
      }
      formData.append('title', materialTitle.trim() || materialFile.name);
      formData.append('courseId', course.id);
      if (materialLessonId) {
        formData.append('lessonId', materialLessonId);
      }
      formData.append('isPrivate', 'true');

      await materialsService.uploadWithFile(formData);
      toast.success('🎉 Đã tải lên và gán tài liệu cho khóa học thành công!');
      setIsMaterialModalOpen(false);
      await fetchCourseData();
    } catch (err: any) {
      toast.error(`Lỗi tải lên tài liệu: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    } finally {
      setIsUploadingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài liệu "${title}"?`)) return;
    try {
      await materialsService.delete(materialId);
      toast.success('Đã xóa tài liệu khỏi khóa học!');
      await fetchCourseData();
    } catch (err: any) {
      toast.error(`Lỗi khi xóa tài liệu: ${extractErrorMessage(err, 'Thao tác thất bại')}`);
    }
  };

  const handlePreviewMaterial = async (materialId: string) => {
    try {
      toast.info('Đang tạo liên kết bảo mật có Dynamic Watermark...');
      const res = await materialsService.getSignedUrl(materialId);
      if (res.signedUrl) {
        window.open(res.signedUrl, '_blank');
      } else {
        toast.error('Không thể mở liên kết tài liệu');
      }
    } catch (err: any) {
      toast.error(`Lỗi mở tài liệu: ${extractErrorMessage(err, 'Không thể truy cập')}`);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-muted">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
        <p className="text-xs font-bold text-slate-500">Đang tải thông tin khóa học & giáo trình...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-800">Không tìm thấy khóa học</h3>
        <p className="text-xs text-muted">Khóa học này không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.</p>
        <Link
          href="/admin/courses"
          className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về danh sách khóa học</span>
        </Link>
      </div>
    );
  }

  const coverUrl = getCourseCoverUrl(course.thumbnail || course.thumbnailUrl, course.category);

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto pb-16">
      {/* 1. TOP BREADCRUMB & BACK BUTTON */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-line hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay Lại Danh Sách Khóa Học</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenEditCourse}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-white border border-line hover:bg-slate-50 text-slate-700 shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-primary" />
            <span>Sửa Khóa Học</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePublish}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              course.isPublished
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-line hover:bg-slate-200'
            }`}
          >
            {course.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{course.isPublished ? 'Đã Xuất Bản' : 'Bản Nháp (Ẩn)'}</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteCourse}
            className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
            title="Xóa khóa học"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. COURSE SUMMARY BANNER */}
      <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={coverUrl}
              alt=""
              className="w-24 sm:w-32 aspect-video object-cover rounded-2xl border border-line shrink-0 shadow-xs"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {course.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {course.level || 'Intermediate'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                  <span>{course.price ? formatPrice(course.price) : 'Miễn phí'}</span>
                  {course.price ? (
                    <span className="text-amber-600/70 font-semibold border-l border-amber-300 pl-1.5">
                      {currency === 'USD' ? `≈ ${formatVnd(course.price)}` : `≈ ${formatUsd(convertToUsd(course.price))}`}
                    </span>
                  ) : null}
                </span>
              </div>
              <h1 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">
                {course.title}
              </h1>
              <p className="text-xs text-muted max-w-2xl line-clamp-2">
                {course.description || 'Chương trình đào tạo chuẩn sư phạm, bài tập thực chiến và kiểm tra năng lực.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-line self-stretch md:self-auto justify-around">
            <div className="text-center px-2">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Chương
              </span>
              <span className="text-lg font-black text-primary">{modules.length}</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="text-center px-2">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Bài Học
              </span>
              <span className="text-lg font-black text-slate-800">{totalLessonsCount}</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="text-center px-2">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Học Viên
              </span>
              <span className="text-lg font-black text-emerald-600">{enrollments.length}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-t border-line px-5 sm:px-6 bg-slate-50/50">
          {[
            { id: 'curriculum', label: 'Khung Chương Trình & Bài Học', icon: BookOpen, count: modules.length },
            { id: 'materials', label: 'Tài Liệu & Học Liệu', icon: FolderOpen, count: courseMaterials.length },
            { id: 'enrollments', label: 'Học Viên Ghi Danh', icon: Users, count: enrollments.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 text-xs font-black transition flex items-center gap-2 border-b-2 -mb-px ${
                  isActive
                    ? 'border-primary text-primary bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      {/* ========================================================================= */}
      {/* TAB 1: CURRICULUM (CHƯƠNG & BÀI HỌC)                                      */}
      {/* ========================================================================= */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-line shadow-xs">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>Cấu Trúc Khung Chương Trình Giáo Trình</span>
              </h2>
              <p className="text-[11px] text-muted">
                Tạo các chương (Modules) và thêm các bài học (Lessons) kèm video bài giảng, tài liệu học và bài quiz.
              </p>
            </div>

            <button
              onClick={handleOpenAddModule}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-md shadow-primary/20 transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Chương Mới</span>
            </button>
          </div>

          {/* Modules List */}
          {loadingCurriculum ? (
            <div className="bg-white rounded-3xl border border-line p-12 text-center shadow-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
              <p className="text-xs text-muted">Đang tải cấu trúc chương trình...</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="bg-white rounded-3xl border border-line p-16 text-center shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-primary flex items-center justify-center mx-auto">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">Chưa có chương học nào</h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Khóa học chưa được thiết lập giáo trình. Bấm nút bên dưới để tạo chương đầu tiên và bắt đầu thêm bài giảng!
              </p>
              <button
                onClick={handleOpenAddModule}
                className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Chương Đầu Tiên</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {modules.map((mod, modIdx) => {
                const isExpanded = expandedModules[mod.id] ?? true;

                return (
                  <div
                    key={mod.id}
                    className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden transition"
                  >
                    {/* Module Accordion Header */}
                    <div className="p-4 flex items-center justify-between gap-3 bg-slate-50/70 border-b border-line">
                      <div
                        onClick={() => toggleModuleExpand(mod.id)}
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        <button
                          type="button"
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                            {modIdx + 1}
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-900">{mod.title}</h3>
                        </div>

                        <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-line">
                          {mod.lessons?.length || 0} bài học
                        </span>
                      </div>

                      {/* Module Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenAddLesson(mod.id)}
                          className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-primary font-bold text-xs transition flex items-center gap-1 border border-sky-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Thêm Bài Học</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModule(mod)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                          title="Sửa tên chương"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteModule(mod.id, mod.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Xóa chương"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons inside Module */}
                    {isExpanded && (
                      <div className="p-4 space-y-2">
                        {mod.lessons.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Chương này chưa có bài học nào. Bấm nút{' '}
                            <span className="font-bold text-primary">+ Thêm Bài Học</span> để nạp bài giảng!
                          </div>
                        ) : (
                          mod.lessons.map((lesson, lesIdx) => (
                            <div
                              key={lesson.id}
                              className="p-3 rounded-xl border border-line bg-white hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                                  #{lesIdx + 1}
                                </span>

                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition">
                                      {lesson.title}
                                    </h4>

                                    {/* Media badges */}
                                    {lesson.videoUrl && (
                                      <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                        <Video className="w-3 h-3" />
                                        <span>Video</span>
                                      </span>
                                    )}

                                    {lesson.materials && lesson.materials.length > 0 && (
                                      <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        <span>{lesson.materials.length} Tài liệu</span>
                                      </span>
                                    )}

                                    {lesson.quizzes && lesson.quizzes.length > 0 && (
                                      <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                                        <FileCheck className="w-3 h-3" />
                                        <span>{lesson.quizzes.length} Quiz</span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 text-[11px] text-muted font-medium">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span>{lesson.durationMinutes || 20} phút</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Lesson Actions */}
                              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenVideoUpload(lesson)}
                                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 border ${
                                    lesson.videoUrl
                                      ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                      : 'bg-slate-100 text-slate-700 border-line hover:bg-slate-200'
                                  }`}
                                  title="Upload hoặc đổi video bài giảng"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>{lesson.videoUrl ? 'Đổi Video' : 'Nạp Video'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditLesson(lesson, mod.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                  title="Chỉnh sửa nội dung bài học"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                  title="Xóa bài học"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COURSE MATERIALS (TÀI LIỆU KHÓA HỌC)                               */}
      {/* ========================================================================= */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Kho Tài Liệu & Học Liệu Của Khóa Học</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-primary border border-sky-200">
                  {courseMaterials.length} Học liệu
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Quản lý giáo trình PDF, slide bài giảng, file âm thanh nghe (MP3) lưu trữ Cloudinary, bảo mật Dynamic Watermark chỉ dành riêng cho học viên đã đăng ký.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddMaterial}
              className="px-4 py-2.5 rounded-xl bg-primary text-white font-extrabold text-xs hover:bg-primary-dark transition inline-flex items-center gap-2 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tải Lên Tài Liệu Mới (Cloudinary)</span>
            </button>
          </div>

          {courseMaterials.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-line rounded-2xl bg-slate-50/50">
              <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Chưa có tài liệu nào cho khóa học này</h4>
              <p className="text-xs text-muted mt-1 max-w-md mx-auto">
                Nhấn vào nút &quot;Tải Lên Tài Liệu Mới&quot; ở trên để tải file PDF, slide bài giảng hoặc file nghe MP3 lên Cloudinary cho học viên khóa học này.
              </p>
              <button
                type="button"
                onClick={handleOpenAddMaterial}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark transition inline-flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải Lên Tài Liệu Đầu Tiên</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {courseMaterials.map((mat) => {
                const isAudio = mat.type === 'AUDIO' || mat.fileKey?.endsWith('.mp3');
                const isPdf = mat.type === 'PDF' || mat.fileKey?.endsWith('.pdf');
                const formattedSize = mat.fileSize
                  ? `${(mat.fileSize / (1024 * 1024)).toFixed(1)} MB`
                  : undefined;
                const assignedLesson = mat.lessonId
                  ? allLessons.find((l) => l.id === mat.lessonId)
                  : null;

                return (
                  <div
                    key={mat.id}
                    className="p-4 rounded-2xl border border-line bg-slate-50/70 hover:bg-white hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          isAudio
                            ? 'bg-amber-100 text-amber-700'
                            : isPdf
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-sky-100 text-primary'
                        }`}
                      >
                        {isAudio ? <Headphones className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9.5px] font-black uppercase tracking-wider ${
                              isAudio
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {mat.type}
                          </span>
                          {mat.fileKey?.includes('cloudinary') && (
                            <span className="px-2 py-0.5 rounded-md text-[9.5px] font-bold bg-sky-50 text-primary border border-sky-200">
                              ☁️ Cloudinary
                            </span>
                          )}
                          {formattedSize && (
                            <span className="text-[10px] text-muted font-mono">{formattedSize}</span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed">
                          {mat.title}
                        </h4>

                        {assignedLesson ? (
                          <span className="text-[10.5px] text-slate-500 line-clamp-1 mt-1 block">
                            📌 Gán cho: <strong className="text-slate-700">{assignedLesson.title}</strong>
                          </span>
                        ) : (
                          <span className="text-[10.5px] text-slate-400 block mt-1">
                            🌐 Tài liệu chung cho toàn khóa học
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-line/60 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handlePreviewMaterial(mat.id)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-primary border border-line hover:border-sky-300 font-bold text-[11px] transition flex items-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem Bảo Mật</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                        title="Xóa tài liệu khỏi khóa học"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ENROLLMENTS (HỌC VIÊN ĐĂNG KÝ)                                     */}
      {/* ========================================================================= */}
      {activeTab === 'enrollments' && (
        <div className="bg-white rounded-3xl border border-line p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Danh Sách Học Viên Khóa Học</h3>
              <p className="text-xs text-muted">
                Quản lý các học viên đã đăng ký, tiến độ học tập và phê duyệt quyền truy cập.
              </p>
            </div>
            <button
              onClick={handleOpenManualEnroll}
              className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Ghi Danh Học Viên Thủ Công</span>
            </button>
          </div>

          {loadingEnrollments ? (
            <div className="py-12 text-center text-xs text-muted">Đang tải danh sách học viên...</div>
          ) : enrollments.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted">
              Chưa có học viên nào đăng ký khóa học này.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-line text-slate-400 font-black uppercase text-[10.5px]">
                  <tr>
                    <th className="py-3 px-4">Học Viên</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Tiến Độ</th>
                    <th className="py-3 px-4">Ngày Ghi Danh</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {enrollments.map((en) => (
                    <tr key={en.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {en.user?.fullName || 'Học viên'}
                      </td>
                      <td className="py-3.5 px-4 text-muted">{en.user?.email || 'N/A'}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${en.progressPercent || 0}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-700">
                            {en.progressPercent || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-muted">
                        {en.enrolledAt ? new Date(en.enrolledAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            en.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : en.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {en.status === 'ACTIVE' ? 'Đang học' : en.status === 'PENDING' ? 'Chờ duyệt' : 'Đã hủy'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {en.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleApproveEnrollment(en.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
                          >
                            Duyệt
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRejectEnrollment(en.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition"
                          title="Hủy đăng ký"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT MODULE                                                */}
      {/* ========================================================================= */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingModuleId ? 'Sửa Tên Chương' : 'Thêm Chương Mới (Module)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModuleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên chương giáo trình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="Ví dụ: Chương 1: Giới thiệu & Cấu trúc bài thi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingModule}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5"
                >
                  {submittingModule && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingModuleId ? 'Lưu Thay Đổi' : 'Tạo Chương Mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT LESSON                                                */}
      {/* ========================================================================= */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-slate-900">
                {editingLessonId ? 'Chỉnh Sửa Bài Học' : 'Thêm Bài Học Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsLessonModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề bài học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lessonFormData.title}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                  placeholder="Ví dụ: Bài 1: Chiến thuật xử lý True / False / Not Given"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời lượng ước tính (Phút)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={lessonFormData.durationMinutes}
                    onChange={(e) =>
                      setLessonFormData({ ...lessonFormData, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min="1"
                    value={lessonFormData.order}
                    onChange={(e) =>
                      setLessonFormData({ ...lessonFormData, order: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Video bài giảng (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={lessonFormData.videoUrl}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, videoUrl: e.target.value })}
                  placeholder="https://.../video.mp4 (hoặc bạn có thể tải lên video sau khi tạo bài học)"
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <RichTextEditor
                  label="Nội dung bài học & Ghi chú kiến thức"
                  value={lessonFormData.content}
                  onChange={(val) => setLessonFormData({ ...lessonFormData, content: val })}
                  placeholder="Nhập lý thuyết trọng tâm, bài tập ứng dụng hoặc tóm tắt kiến thức bài học..."
                  minHeight="min-h-[140px]"
                />
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingLesson}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5"
                >
                  {submittingLesson && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingLessonId ? 'Lưu Thay Đổi' : 'Tạo Bài Học'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIDEO UPLOAD FOR LESSON                                          */}
      {/* ========================================================================= */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                <span>Nạp Video Bài Giảng</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] text-muted block">Bài học đích:</span>
                <span className="text-xs font-bold text-slate-800">{uploadLessonTitle}</span>
              </div>

              <div
                onClick={() => videoInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-line hover:border-primary/50 bg-slate-50 hover:bg-sky-50/50 rounded-2xl text-center cursor-pointer transition space-y-2"
              >
                <Video className="w-8 h-8 text-primary mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  {isUploadingVideo ? 'Đang tải lên...' : 'Nhấp để chọn file video từ máy tính'}
                </p>
                <p className="text-[10.5px] text-muted">Hỗ trợ định dạng: MP4, WebM, MOV (Tối đa 500MB)</p>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileSelected}
                  className="hidden"
                />
              </div>

              {/* Progress bar */}
              {isUploadingVideo && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Tiến độ tải lên:</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-line flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  disabled={isUploadingVideo}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: MANUAL ENROLLMENT                                                */}
      {/* ========================================================================= */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Ghi Danh Học Viên Vào Khóa Học</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteManualEnroll} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn học viên <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold bg-white focus:outline-none focus:border-primary"
                >
                  {studentsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú ghi danh (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={enrollNote}
                  onChange={(e) => setEnrollNote(e.target.value)}
                  placeholder="Ví dụ: Đã đóng học phí chuyển khoản ngân hàng..."
                  className="w-full px-3.5 py-2 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingEnroll}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5"
                >
                  {submittingEnroll && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <Check className="w-3.5 h-3.5" />
                  <span>Xác Nhận Ghi Danh</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EDIT COURSE DETAILS (WITH RICHTEXTEDITOR)                        */}
      {/* ========================================================================= */}
      {isEditCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-line p-6 my-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" />
                <span>Chỉnh Sửa Thông Tin Khóa Học</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditCourseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourseEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đường dẫn tĩnh (Slug) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={courseFormData.slug}
                  onChange={(e) => setCourseFormData({ ...courseFormData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="Phân hệ đào tạo (Track) *"
                  value={courseFormData.track}
                  onChange={(val) => {
                    const newTrack = val as 'ENGLISH' | 'PERSONAL_DEV';
                    const defaultCat = newTrack === 'ENGLISH' ? 'IELTS' : 'PEDAGOGY';
                    setCourseFormData({ ...courseFormData, track: newTrack, category: defaultCat });
                  }}
                  options={[
                    { value: 'ENGLISH', label: '🇬🇧 Đào tạo Tiếng Anh & IELTS' },
                    { value: 'PERSONAL_DEV', label: '🌟 Phát triển Năng lực & Sư phạm' },
                  ]}
                />

                <CustomSelect
                  label="Chuyên mục đào tạo *"
                  value={courseFormData.category}
                  onChange={(val) => setCourseFormData({ ...courseFormData, category: val })}
                  options={
                    courseFormData.track === 'ENGLISH'
                      ? [
                          { value: 'IELTS', label: 'IELTS Master (Academic & General)' },
                          { value: 'ENGLISH', label: 'General English (Giao tiếp & Ngữ pháp)' },
                          { value: 'BUSINESS', label: 'Business English (Thương mại & Công sở)' },
                          { value: 'KIDS', label: 'Kids English (Thiếu nhi)' },
                        ]
                      : [
                          { value: 'PEDAGOGY', label: 'Nghiệp vụ Sư phạm & Giảng dạy' },
                          { value: 'LIFE_SKILLS', label: 'Kỹ năng Sống & Giao tiếp xã hội' },
                          { value: 'SOFT_SKILLS', label: 'Kỹ năng Mềm (Đàm phán, Làm việc nhóm)' },
                          { value: 'PERSONAL_DEV', label: 'Phát triển Bản thân & Lãnh đạo' },
                        ]
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CustomSelect
                  label="Trình độ (Level) *"
                  value={courseFormData.level}
                  onChange={(val) => setCourseFormData({ ...courseFormData, level: val })}
                  options={[
                    { value: 'BEGINNER', label: 'Mới bắt đầu (Beginner / 0 - 3.5)' },
                    { value: 'INTERMEDIATE', label: 'Trung cấp (Intermediate / 4.0 - 5.5)' },
                    { value: 'ADVANCED', label: 'Nâng cao (Advanced / 6.0 - 7.5)' },
                    { value: 'MASTER', label: 'Chuyên gia (Master / 8.0+)' },
                  ]}
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Học phí (VND) <span className="text-red-500">*</span>
                    </label>
                    {courseFormData.price > 0 && (
                      <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        ≈ {formatUsd(convertToUsd(courseFormData.price))} USD
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={courseFormData.price}
                    onChange={(e) => setCourseFormData({ ...courseFormData, price: Number(e.target.value) })}
                    placeholder="0 = Miễn phí"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                  {courseFormData.price > 0 && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Tỷ giá quy đổi quốc tế tham chiếu: 1 USD ≈ 25.400 VND
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl border border-line bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Trạng thái phát hành</span>
                    <span className="text-[10px] text-muted">Hiển thị cho học viên</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={courseFormData.isPublished}
                    onChange={(e) => setCourseFormData({ ...courseFormData, isPublished: e.target.checked })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>

              {/* Description Rich Text Editor */}
              <RichTextEditor
                label="Mô tả mục tiêu & chuẩn đầu ra khóa học"
                value={courseFormData.description}
                onChange={(val) => setCourseFormData({ ...courseFormData, description: val })}
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
                  value={courseFormData.thumbnail}
                  onChange={(e) => setCourseFormData({ ...courseFormData, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/... hoặc tải ảnh lên"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-medium focus:outline-none focus:border-primary"
                />

                {courseFormData.thumbnail && (
                  <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 border border-line rounded-xl">
                    <img
                      src={courseFormData.thumbnail}
                      alt="Thumbnail preview"
                      className="w-16 h-10 object-cover rounded-lg border border-line"
                    />
                    <div className="text-[11px] text-slate-600 truncate flex-1">
                      <span className="font-bold text-emerald-600 block">✓ Ảnh bìa hợp lệ</span>
                      <span className="text-slate-400 truncate block">{courseFormData.thumbnail}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditCourseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingCourseEdit}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-md shadow-primary/20 flex items-center gap-2"
                >
                  {submittingCourseEdit && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Check className="w-4 h-4" />
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD COURSE MATERIAL (CLOUDINARY)                                */}
      {/* ========================================================================= */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-line p-6 my-8 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-primary flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Tải Lên Tài Liệu Khóa Học</h3>
                  <p className="text-[11px] text-muted">Lưu trữ trên Cloudinary, bảo vệ bản quyền cho học viên đã đăng ký</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMaterialModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMaterial} className="space-y-4">
              {/* Primary Material File Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tệp tài liệu chính (PDF, Word, Excel, Slide...) <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => materialFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                    materialFile
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-line hover:border-primary hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={materialFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp3,.wav,.m4a"
                    onChange={handleSelectMaterialFile}
                    className="hidden"
                  />
                  {materialFile ? (
                    <div className="space-y-1">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate max-w-sm mx-auto">{materialFile.name}</p>
                      <span className="text-[11px] text-muted font-mono">
                        {(materialFile.size / (1024 * 1024)).toFixed(2)} MB • Nhấn để đổi tệp khác
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">Nhấn để chọn tệp từ máy tính</p>
                      <p className="text-[10.5px] text-muted">
                        Hỗ trợ PDF, DOCX, PPTX, XLSX, MP3 (Tối đa 50MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề tài liệu hiển thị cho học viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="Ví dụ: Cambridge IELTS 19 Academic Test 1 Guide..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              {/* Scope: Assign to course or specific lesson */}
              <div>
                <CustomSelect
                  label="Phạm vi áp dụng trong khóa học"
                  value={materialLessonId}
                  onChange={(val) => setMaterialLessonId(val)}
                  options={[
                    { value: '', label: '🌐 Toàn bộ khóa học (Tài liệu học tập chung)' },
                    ...allLessons.map((l) => ({
                      value: l.id,
                      label: `📖 [${l.moduleTitle}] ${l.title}`,
                    })),
                  ]}
                />
              </div>

              {/* Optional Audio File Picker */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tệp âm thanh đính kèm (Tùy chọn - Dành cho IELTS Listening)</span>
                  </label>
                  {materialAudioFile && (
                    <button
                      type="button"
                      onClick={() => setMaterialAudioFile(null)}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Xóa file âm thanh
                    </button>
                  )}
                </div>
                <input
                  ref={materialAudioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setMaterialAudioFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 rounded-xl border border-line text-xs bg-slate-50 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                />
              </div>

              {/* Watermark & Security Notice */}
              <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bảo Mật Dynamic Watermark & Quyền Riêng Tư
                </span>
                <p className="leading-relaxed">
                  Tài liệu sẽ tự động chèn Watermark họ tên & SĐT của từng học viên khi mở, ngăn chặn quay chụp màn hình và chỉ học viên có đăng ký mới được cấp link truy cập.
                </p>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUploadingMaterial || !materialFile}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-md shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploadingMaterial && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingMaterial ? 'Đang tải lên Cloudinary...' : 'Tải Lên & Lưu Tài Liệu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CourseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-muted">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
          <p className="text-xs font-bold">Đang nạp dữ liệu khóa học...</p>
        </div>
      }
    >
      <CourseDetailContent />
    </Suspense>
  );
}
