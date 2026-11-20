'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { coursesService, Course, CourseEnrollment, DEFAULT_COVERS } from '@/services/courses.service';
import { lessonsService } from '@/services/lessons.service';
import { materialsService, SignedUrlResponse } from '@/services/materials.service';
import { usersService, UserProfile } from '@/services/users.service';
import { useAuth } from '@/lib/auth-context';
import DynamicWatermarkCanvas from '@/components/shared/dynamic-watermark-canvas';
import CustomSelect from '@/components/ui/custom-select';
import { extractErrorMessage } from '@/lib/api-error';
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  RefreshCw,
  BookOpen,
  Briefcase,
  Baby,
  GraduationCap,
  Sparkles,
  Video,
  FileText,
  HelpCircle,
  PenTool,
  ChevronUp,
  ChevronDown,
  Layers,
  UserPlus,
  Search,
  Clock,
  CreditCard,
  ShieldCheck,
  Upload,
  Music,
  FolderOpen,
  Paperclip,
  Lock,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Compass,
  Globe,
  Eye,
  Play,
  Pause,
  Headphones,
  Volume2,
  VolumeX,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface AttachedMaterial {
  id: string;
  title: string;
  type?: string;
  fileSize?: number;
  isWatermarked?: boolean;
  parentId?: string | null;
  children?: AttachedMaterial[];
}

interface CurriculumLesson {
  id: string;
  title: string;
  order: number;
  durationMinutes?: number;
  type?: string;
  materials?: AttachedMaterial[];
}

interface ModuleItem {
  id: string;
  title: string;
  order: number;
  lessons: CurriculumLesson[];
}

export default function AdminCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  // Top Tabs: 'courses' | 'enrollments'
  const [adminTab, setAdminTab] = useState<'courses' | 'enrollments'>('courses');

  // Filter & Search Courses
  const [adminTrackFilter, setAdminTrackFilter] = useState<'ALL' | 'ENGLISH' | 'PERSONAL_DEV'>('ALL');
  const [courseCategoryFilter, setCourseCategoryFilter] = useState<string>('ALL');
  const [courseSearch, setCourseSearch] = useState('');
  const [courseViewMode, setCourseViewMode] = useState<'grid' | 'table'>('grid');

  // Curriculum & Materials State
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [curriculumModules, setCurriculumModules] = useState<ModuleItem[]>([]);
  const [courseMaterials, setCourseMaterials] = useState<AttachedMaterial[]>([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  // Enrollments State
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [enrollmentFilter, setEnrollmentFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'REJECTED'>('ALL');
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [processingEnrollmentId, setProcessingEnrollmentId] = useState<string | null>(null);

  // Modals visibility
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isManualEnrollOpen, setIsManualEnrollOpen] = useState(false);

  // Students list for manual enrollment
  const [studentsList, setStudentsList] = useState<UserProfile[]>([]);
  const [manualEnrollForm, setManualEnrollForm] = useState({
    courseId: '',
    userId: '',
    note: '',
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Course thumbnail upload in modal
  const courseCoverInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  // ==========================================
  // FETCH DATA
  // ==========================================

  const fetchEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const res = await coursesService.getAdminEnrollments();
      if (Array.isArray(res)) {
        setEnrollments(res);
      }
    } catch (err) {
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await usersService.getUsers({ role: 'STUDENT', limit: 100 });
      const list = Array.isArray(res) ? res : (res as unknown as { items?: UserProfile[] })?.items || [];
      if (list.length > 0) {
        setStudentsList(list);
        setManualEnrollForm((prev) => ({ ...prev, userId: prev.userId || list[0].id }));
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await coursesService.getCourses();
      if (Array.isArray(data)) {
        const mapped = data.map((c: Record<string, unknown>) => ({
          id: String(c.id || ''),
          title: String(c.title || ''),
          slug: String(c.slug || ''),
          category: String(c.category || 'IELTS'),
          level: String(c.level || 'INTERMEDIATE'),
          price: Number(c.price || 4500000),
          thumbnail: String(c.thumbnail || c.thumbnailUrl || ''),
          status: (c.published !== false && c.isPublished !== false ? 'PUBLISHED' : 'DRAFT') as 'PUBLISHED' | 'DRAFT',
          modulesCount: Array.isArray(c.modules) ? c.modules.length : (c.moduleCount as number) || 0,
        }));
        setCourses(mapped);
        if (mapped.length > 0) {
          setSelectedCourseId((prev) => prev || mapped[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurriculum = useCallback(async (courseId: string) => {
    if (!courseId) return;
    setLoadingCurriculum(true);
    try {
      const course = await coursesService.getCourseBySlug(courseId);
      type RawMaterial = { id?: string; title?: string; type?: string; fileSize?: number; isWatermarked?: boolean };
      type RawLesson = {
        id?: string;
        title?: string;
        orderIndex?: number;
        order?: number;
        durationMinutes?: number;
        type?: string;
        materials?: RawMaterial[];
      };
      type RawModule = {
        id?: string;
        title?: string;
        orderIndex?: number;
        order?: number;
        lessons?: RawLesson[];
      };

      if (course) {
        const mapMat = (m: any): AttachedMaterial => ({
          id: m.id || '',
          title: m.title || 'Tài liệu học phần',
          type: m.type || 'PDF',
          fileSize: m.fileSize || 0,
          isWatermarked: m.isWatermarked !== false,
          parentId: m.parentId || null,
          children: Array.isArray(m.children)
            ? m.children.map((c: any) => ({
                id: c.id,
                title: c.title,
                type: c.type || 'AUDIO',
                fileSize: c.fileSize || 0,
                isWatermarked: c.isWatermarked !== false,
              }))
            : [],
        });

        // Course-level materials
        const cMaterials: AttachedMaterial[] = Array.isArray((course as any).materials)
          ? (course as any).materials.map(mapMat)
          : [];
        setCourseMaterials(cMaterials);

        // Modules & Lessons
        if (Array.isArray(course.modules)) {
          const mapped: ModuleItem[] = (course.modules as RawModule[]).map((m: RawModule, mIdx: number) => ({
            id: m.id || `mod-${mIdx + 1}`,
            title: m.title || `Module 0${mIdx + 1}`,
            order: m.orderIndex ?? m.order ?? mIdx + 1,
            lessons: (m.lessons || []).map((l: RawLesson, lIdx: number) => ({
              id: l.id || `les-${mIdx + 1}-${lIdx + 1}`,
              title: l.title || `Lesson ${lIdx + 1}`,
              order: l.orderIndex ?? l.order ?? lIdx + 1,
              durationMinutes: l.durationMinutes || 45,
              type: l.type || 'VIDEO',
              materials: Array.isArray(l.materials) ? l.materials.map(mapMat) : [],
            })),
          }));
          setCurriculumModules(mapped);
        } else {
          setCurriculumModules([]);
        }
      }
    } catch (err) {
      console.error('Error fetching course curriculum:', err);
      setCurriculumModules([]);
      setCourseMaterials([]);
    } finally {
      setLoadingCurriculum(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'enrollments') {
        setAdminTab('enrollments');
      }

      const trackParam = params.get('track');
      let targetTrack: 'ALL' | 'ENGLISH' | 'PERSONAL_DEV' = 'ALL';
      if (trackParam === 'english') {
        targetTrack = 'ENGLISH';
        setAdminTrackFilter('ENGLISH');
      } else if (trackParam === 'personal_dev') {
        targetTrack = 'PERSONAL_DEV';
        setAdminTrackFilter('PERSONAL_DEV');
      }

      const catParam = params.get('category');
      if (catParam) {
        const cat = catParam.toUpperCase();
        setCourseCategoryFilter(cat);
        const englishCats = ['IELTS', 'ENGLISH', 'BUSINESS', 'KIDS'];
        const devCats = ['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'];
        if (englishCats.includes(cat)) {
          targetTrack = 'ENGLISH';
          setAdminTrackFilter('ENGLISH');
        } else if (devCats.includes(cat)) {
          targetTrack = 'PERSONAL_DEV';
          setAdminTrackFilter('PERSONAL_DEV');
        }
      }

      const actionParam = params.get('action');
      if (actionParam === 'new') {
        const initialTrack = targetTrack === 'PERSONAL_DEV' ? 'PERSONAL_DEV' : 'ENGLISH';
        const initialCat = initialTrack === 'PERSONAL_DEV' ? 'PEDAGOGY' : (catParam?.toUpperCase() || 'IELTS');
        setEditingCourseId(null);
        setCourseFormData({
          title: '',
          track: initialTrack,
          category: initialCat,
          level: 'INTERMEDIATE',
          price: 4500000,
          shortDesc: '',
          thumbnail: DEFAULT_COVERS[initialCat] || DEFAULT_COVERS['IELTS'],
        });
        setIsCourseModalOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchCurriculum(selectedCourseId);
    }
  }, [selectedCourseId, fetchCurriculum]);

  // Currently Active Course Object
  const activeCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId) || courses[0] || null;
  }, [courses, selectedCourseId]);

  // Helper to resolve cover image
  const getCourseCover = (c?: Course | null) => {
    if (c?.thumbnail && c.thumbnail.trim().length > 5) return c.thumbnail;
    const cat = c?.category || 'IELTS';
    return DEFAULT_COVERS[cat] || DEFAULT_COVERS['IELTS'];
  };

  // ==========================================
  // 1. COURSE MODAL (#courseModal)
  // ==========================================
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    track: 'ENGLISH' as 'ENGLISH' | 'PERSONAL_DEV',
    category: 'IELTS',
    level: 'INTERMEDIATE',
    price: 4500000,
    shortDesc: '',
    thumbnail: '',
  });

  const handleOpenCreateCourseModal = () => {
    setEditingCourseId(null);
    const initialTrack = adminTrackFilter === 'PERSONAL_DEV' ? 'PERSONAL_DEV' : 'ENGLISH';
    const initialCat = initialTrack === 'PERSONAL_DEV' ? 'PEDAGOGY' : 'IELTS';
    setCourseFormData({
      title: '',
      track: initialTrack,
      category: initialCat,
      level: 'INTERMEDIATE',
      price: 4500000,
      shortDesc: '',
      thumbnail: DEFAULT_COVERS[initialCat] || DEFAULT_COVERS['IELTS'],
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourseModal = (c: Course) => {
    setEditingCourseId(c.id);
    const isEng = ['ENGLISH', 'IELTS', 'BUSINESS', 'KIDS'].includes(c.category) || c.isEnglishCourse === true;
    setCourseFormData({
      title: c.title,
      track: isEng ? 'ENGLISH' : 'PERSONAL_DEV',
      category: c.category,
      level: c.level || 'INTERMEDIATE',
      price: c.price || 4500000,
      shortDesc: c.description || '',
      thumbnail: c.thumbnail || DEFAULT_COVERS[c.category] || '',
    });
    setIsCourseModalOpen(true);
  };

  const handleUploadThumbnailFile = async (file: File | null) => {
    if (!file) return;
    setIsUploadingThumbnail(true);
    try {
      const res = await coursesService.uploadThumbnailFile(file);
      if (res && res.url) {
        setCourseFormData((prev) => ({ ...prev, thumbnail: res.url }));
        setNotice('✅ Đã tải ảnh bìa lên thành công!');
        setTimeout(() => setNotice(''), 3000);
      }
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Lỗi khi tải ảnh bìa');
      setNotice(`❌ Không thể tải ảnh bìa: ${msg}`);
      setTimeout(() => setNotice(''), 3000);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.title.trim()) {
      setNotice('❌ Vui lòng nhập tên khóa học');
      setTimeout(() => setNotice(''), 3000);
      return;
    }

    try {
      const finalThumbnail =
        courseFormData.thumbnail.trim() || DEFAULT_COVERS[courseFormData.category] || '';

      if (editingCourseId) {
        await coursesService.updateCourse(editingCourseId, {
          title: courseFormData.title.trim(),
          category: courseFormData.category,
          level: courseFormData.level,
          description: courseFormData.shortDesc.trim(),
          price: courseFormData.price,
          thumbnail: finalThumbnail,
        });
        setNotice(`✅ Đã cập nhật khóa học "${courseFormData.title}" thành công!`);
      } else {
        const res = await coursesService.createCourse({
          title: courseFormData.title.trim(),
          category: courseFormData.category,
          level: courseFormData.level,
          description: courseFormData.shortDesc.trim(),
          price: courseFormData.price,
          thumbnail: finalThumbnail,
        });
        const createdId = (res as any)?.data?.id || (res as any)?.id;
        setNotice(`✅ Đã tạo khóa học mới "${courseFormData.title}" thành công!`);
        if (createdId) setSelectedCourseId(createdId);
      }
      await fetchCourses();
      setIsCourseModalOpen(false);
      setEditingCourseId(null);
    } catch (err: unknown) {
      const displayMsg = extractErrorMessage(err, 'Lỗi khi lưu khóa học');
      setNotice(`❌ Không thể lưu khóa học: ${displayMsg}`);
    }
    setTimeout(() => setNotice(''), 4000);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này cùng toàn bộ chương học và bài học liên quan?')) return;
    try {
      await coursesService.deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      if (selectedCourseId === courseId) {
        setSelectedCourseId(courses.find((c) => c.id !== courseId)?.id || '');
      }
      setNotice('✅ Đã xóa khóa học thành công.');
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Lỗi khi xóa khóa học');
      setNotice(`❌ Không thể xóa khóa học: ${msg}`);
    }
    setTimeout(() => setNotice(''), 3000);
  };

  // ==========================================
  // 2. MODULE MODAL (#moduleModal)
  // ==========================================
  const [moduleTitleInput, setModuleTitleInput] = useState('');
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);

  const handleOpenAddModule = () => {
    if (!selectedCourseId) {
      alert('Vui lòng chọn một khóa học trước khi thêm chương!');
      return;
    }
    setModuleTitleInput('');
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitleInput.trim() || !selectedCourseId) return;
    setIsSubmittingModule(true);
    try {
      await lessonsService.createModule({
        courseId: selectedCourseId,
        title: moduleTitleInput.trim(),
        orderIndex: curriculumModules.length + 1,
      });
      await fetchCurriculum(selectedCourseId);
      await fetchCourses();
      setNotice(`✅ Đã thêm chương mới: "${moduleTitleInput.trim()}"!`);
      setIsModuleModalOpen(false);
      setModuleTitleInput('');
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Lỗi khi tạo chương học');
      setNotice(`❌ Không thể tạo chương: ${msg}`);
    } finally {
      setIsSubmittingModule(false);
      setTimeout(() => setNotice(''), 3500);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Bạn có chắc muốn xóa chương học này và các bài học bên trong?')) return;
    try {
      await lessonsService.deleteModule(moduleId);
      await fetchCurriculum(selectedCourseId);
      await fetchCourses();
      setNotice('✅ Đã xóa chương học thành công!');
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Lỗi khi xóa chương');
      setNotice(`❌ Không thể xóa chương: ${msg}`);
    }
    setTimeout(() => setNotice(''), 3500);
  };

  // ==========================================
  // 3. LESSON MODAL (#lessonModal)
  // ==========================================
  const [lessonFormData, setLessonFormData] = useState({
    courseId: '',
    moduleId: '',
    isCreatingNewModule: false,
    newModuleTitle: '',
    lessonTitle: '',
    type: 'VIDEO',
    durationMinutes: 45,
    isFreePreview: false,
  });
  const [lessonVideoFile, setLessonVideoFile] = useState<File | null>(null);
  const [lessonUploadProgress, setLessonUploadProgress] = useState<number | null>(null);

  const handleOpenAddLesson = (prefillModuleId?: string) => {
    const targetCourse = selectedCourseId || courses[0]?.id || '';
    setLessonFormData({
      courseId: targetCourse,
      moduleId: prefillModuleId || curriculumModules[0]?.id || '',
      isCreatingNewModule: curriculumModules.length === 0,
      newModuleTitle: '',
      lessonTitle: '',
      type: 'VIDEO',
      durationMinutes: 45,
      isFreePreview: false,
    });
    setLessonVideoFile(null);
    setLessonUploadProgress(null);
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonFormData.lessonTitle.trim()) {
      setNotice('❌ Vui lòng nhập tên bài học!');
      setTimeout(() => setNotice(''), 3000);
      return;
    }

    try {
      let targetModuleId = lessonFormData.moduleId;

      if (lessonFormData.isCreatingNewModule || !targetModuleId) {
        if (!lessonFormData.newModuleTitle.trim()) {
          setNotice('❌ Vui lòng nhập tên chương học mới!');
          setTimeout(() => setNotice(''), 3000);
          return;
        }
        const createdMod = await lessonsService.createModule({
          courseId: lessonFormData.courseId,
          title: lessonFormData.newModuleTitle.trim(),
          orderIndex: curriculumModules.length + 1,
        });
        targetModuleId = (createdMod as any)?.data?.id || (createdMod as any)?.id;
      }

      if (!targetModuleId) {
        throw new Error('Không thể xác định chương học');
      }

      const createdLessonRes = await lessonsService.createLesson({
        moduleId: targetModuleId,
        title: lessonFormData.lessonTitle.trim(),
        durationMinutes: Number(lessonFormData.durationMinutes) || 45,
        isFreePreview: Boolean(lessonFormData.isFreePreview),
      });

      const createdLessonId = (createdLessonRes as any)?.data?.id || (createdLessonRes as any)?.id;

      if (lessonVideoFile && createdLessonId) {
        setLessonUploadProgress(0);
        await coursesService.uploadLessonVideo(createdLessonId, lessonVideoFile, (percent) => {
          setLessonUploadProgress(percent);
        });
      }

      await fetchCurriculum(selectedCourseId);
      await fetchCourses();
      setIsLessonModalOpen(false);
      setNotice(`✅ Đã thêm bài học "${lessonFormData.lessonTitle}" thành công!`);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Lỗi khi thêm bài học');
      setNotice(`❌ Không thể thêm bài học: ${msg}`);
    }
    setTimeout(() => setNotice(''), 4000);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài học này?')) return;
    try {
      await lessonsService.deleteLesson(lessonId);
      await fetchCurriculum(selectedCourseId);
      setNotice('✅ Đã xóa bài học thành công!');
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Lỗi khi xóa bài học');
      setNotice(`❌ Không thể xóa bài học: ${msg}`);
    }
    setTimeout(() => setNotice(''), 3500);
  };

  // ==========================================
  // 4. MATERIAL MODAL & PREVIEW (#materialModal)
  // ==========================================
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const integratedAudioRef = useRef<HTMLAudioElement | null>(null);

  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [materialAudioFile, setMaterialAudioFile] = useState<File | null>(null);
  const [materialAudioTitle, setMaterialAudioTitle] = useState('');
  const [localAudioFilePreviewUrl, setLocalAudioFilePreviewUrl] = useState<string | null>(null);
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);
  const [materialFormData, setMaterialFormData] = useState({
    courseId: '',
    lessonId: '',
    title: '',
    isWatermarked: true,
  });

  // Attach Audio to Existing Material Modal State
  const [attachToMaterial, setAttachToMaterial] = useState<AttachedMaterial | null>(null);
  const [attachAudioFile, setAttachAudioFile] = useState<File | null>(null);
  const [attachAudioTitle, setAttachAudioTitle] = useState('');
  const [isSubmittingAttachAudio, setIsSubmittingAttachAudio] = useState(false);
  const attachAudioInputRef = useRef<HTMLInputElement>(null);

  // Material Preview State (Modal Viewer)
  const [previewMaterial, setPreviewMaterial] = useState<{
    id: string;
    title: string;
    type: 'PDF' | 'AUDIO';
    courseTitle?: string;
  } | null>(null);
  const [signedUrlData, setSignedUrlData] = useState<SignedUrlResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState<number>(1);
  const [activeAudioTrackIndex, setActiveAudioTrackIndex] = useState(0);
  const [isIntegratedAudioPlaying, setIsIntegratedAudioPlaying] = useState(false);
  const [integratedAudioTime, setIntegratedAudioTime] = useState(0);
  const [integratedAudioDuration, setIntegratedAudioDuration] = useState(0);

  const getFullStreamUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const origin = apiBase.replace(/\/api\/?$/, '');
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleOpenAddMaterial = (prefillLessonId?: string) => {
    setMaterialFile(null);
    setMaterialAudioFile(null);
    setMaterialAudioTitle('');
    if (localAudioFilePreviewUrl) {
      URL.revokeObjectURL(localAudioFilePreviewUrl);
      setLocalAudioFilePreviewUrl(null);
    }
    setMaterialFormData({
      courseId: selectedCourseId || courses[0]?.id || '',
      lessonId: prefillLessonId || '',
      title: '',
      isWatermarked: true,
    });
    setIsMaterialModalOpen(true);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setMaterialFile(null);
      return;
    }
    setMaterialFile(file);
    if (!materialFormData.title) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      setMaterialFormData((prev) => ({ ...prev, title: cleanTitle }));
    }
  };

  const handleAudioFileChange = (file: File | null) => {
    if (!file) {
      setMaterialAudioFile(null);
      if (localAudioFilePreviewUrl) {
        URL.revokeObjectURL(localAudioFilePreviewUrl);
        setLocalAudioFilePreviewUrl(null);
      }
      return;
    }
    setMaterialAudioFile(file);
    if (localAudioFilePreviewUrl) URL.revokeObjectURL(localAudioFilePreviewUrl);
    setLocalAudioFilePreviewUrl(URL.createObjectURL(file));

    if (!materialAudioTitle) {
      const clean = file.name.replace(/\.[^/.]+$/, '');
      setMaterialAudioTitle(clean);
    }
  };

  const handleUploadMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialFile) {
      setNotice('❌ Vui lòng chọn tệp tài liệu PDF đề thi!');
      setTimeout(() => setNotice(''), 3000);
      return;
    }

    setIsUploadingMaterial(true);
    try {
      const formData = new FormData();
      formData.append('file', materialFile);
      formData.append('title', materialFormData.title || materialFile.name);
      formData.append('type', 'PDF');
      formData.append('courseId', materialFormData.courseId || selectedCourseId);
      if (materialFormData.lessonId) {
        formData.append('lessonId', materialFormData.lessonId);
      }
      formData.append('isWatermarked', String(materialFormData.isWatermarked));

      if (materialAudioFile) {
        formData.append('audio', materialAudioFile);
        formData.append(
          'audioTitle',
          materialAudioTitle.trim() || `${materialFormData.title || materialFile.name} - Audio Bài Nghe`,
        );
      }

      await materialsService.uploadWithFile(formData);
      await fetchCurriculum(selectedCourseId);
      setIsMaterialModalOpen(false);
      setMaterialFile(null);
      setMaterialAudioFile(null);
      setMaterialAudioTitle('');
      if (localAudioFilePreviewUrl) {
        URL.revokeObjectURL(localAudioFilePreviewUrl);
        setLocalAudioFilePreviewUrl(null);
      }
      setNotice(
        `✅ Đã tải lên đề thi "${materialFormData.title || materialFile.name}" ${
          materialAudioFile ? 'kèm Audio bài nghe con' : ''
        } bảo mật thành công!`,
      );
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Lỗi khi tải lên học liệu');
      setNotice(`❌ Không thể tải lên học liệu: ${msg}`);
    } finally {
      setIsUploadingMaterial(false);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  const handleAttachAudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachToMaterial || !attachAudioFile) {
      setNotice('❌ Vui lòng chọn tệp âm thanh Audio MP3/WAV!');
      setTimeout(() => setNotice(''), 3000);
      return;
    }

    setIsSubmittingAttachAudio(true);
    try {
      const formData = new FormData();
      formData.append('audio', attachAudioFile);
      formData.append(
        'title',
        attachAudioTitle.trim() || `${attachToMaterial.title} - Audio Bài Nghe`,
      );

      await materialsService.attachAudio(attachToMaterial.id, formData);
      await fetchCurriculum(selectedCourseId);
      setAttachToMaterial(null);
      setAttachAudioFile(null);
      setAttachAudioTitle('');
      setNotice(`✅ Đã gắn tệp Audio con vào đề thi "${attachToMaterial.title}" thành công!`);
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Lỗi khi gắn tệp âm thanh');
      setNotice(`❌ Không thể gắn tệp âm thanh: ${msg}`);
    } finally {
      setIsSubmittingAttachAudio(false);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  const handleOpenPreviewMaterial = async (mat: AttachedMaterial, customCourseTitle?: string) => {
    const isAudio =
      mat.type === 'AUDIO' ||
      mat.title.toLowerCase().endsWith('.mp3') ||
      mat.title.toLowerCase().endsWith('.wav') ||
      mat.title.toLowerCase().endsWith('.m4a');

    setPreviewMaterial({
      id: mat.id,
      title: mat.title,
      type: isAudio ? 'AUDIO' : 'PDF',
      courseTitle: customCourseTitle || activeCourse?.title || 'Khóa học Teacher Dong Academy',
    });
    setLoadingPreview(true);
    setAudioPlaybackRate(1);
    setActiveAudioTrackIndex(0);
    setIsIntegratedAudioPlaying(false);
    setIntegratedAudioTime(0);

    try {
      const res = await materialsService.getSignedUrl(mat.id);
      setSignedUrlData(res);
    } catch (err) {
      console.error('Lỗi khi tạo liên kết xem trước học liệu:', err);
      setSignedUrlData({
        signedUrl: `http://localhost:3001/api/materials/${mat.id}/stream?token=demo_admin_preview`,
        expiresInSeconds: 900,
        watermark: {
          fullName: user?.fullName || 'Quản Trị Viên Teacher Dong',
          phone: user?.phone || '098***321',
          userId: user?.id || 'admin-root',
          timestamp: Date.now(),
        },
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSetAudioSpeed = (rate: number) => {
    setAudioPlaybackRate(rate);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = rate;
    }
    if (integratedAudioRef.current) {
      integratedAudioRef.current.playbackRate = rate;
    }
  };

  const togglePlayIntegratedAudio = () => {
    if (!integratedAudioRef.current) return;
    if (isIntegratedAudioPlaying) {
      integratedAudioRef.current.pause();
      setIsIntegratedAudioPlaying(false);
    } else {
      integratedAudioRef.current.play();
      setIsIntegratedAudioPlaying(true);
    }
  };

  const handleSeekIntegratedAudio = (time: number) => {
    if (!integratedAudioRef.current) return;
    integratedAudioRef.current.currentTime = time;
    setIntegratedAudioTime(time);
  };

  const formatAudioTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Bạn có chắc muốn xóa tệp học liệu này?')) return;
    try {
      await materialsService.delete(materialId);
      await fetchCurriculum(selectedCourseId);
      setNotice('✅ Đã xóa học liệu thành công!');
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Lỗi khi xóa học liệu');
      setNotice(`❌ Không thể xóa học liệu: ${msg}`);
    }
    setTimeout(() => setNotice(''), 3500);
  };

  // ==========================================
  // CURRICULUM REORDER HANDLERS
  // ==========================================
  const handleMoveModule = async (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= curriculumModules.length) return;

    const updated = [...curriculumModules];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    const reordered = updated.map((m, idx) => ({ ...m, order: idx + 1 }));
    setCurriculumModules(reordered);

    try {
      await lessonsService.reorderModules(reordered.map((m) => ({ id: m.id, order: m.order })));
    } catch {
      // Local optimistic update
    }
    setNotice(`Đã đổi vị trí chương: "${temp.title}"!`);
    setTimeout(() => setNotice(''), 3000);
  };

  const handleMoveLesson = async (moduleIdx: number, lessonIdx: number, direction: -1 | 1) => {
    const mod = curriculumModules[moduleIdx];
    const targetIdx = lessonIdx + direction;
    if (targetIdx < 0 || targetIdx >= mod.lessons.length) return;

    const updatedLessons = [...mod.lessons];
    const temp = updatedLessons[lessonIdx];
    updatedLessons[lessonIdx] = updatedLessons[targetIdx];
    updatedLessons[targetIdx] = temp;

    const reorderedLessons = updatedLessons.map((l, idx) => ({ ...l, order: idx + 1 }));
    const updatedModules = [...curriculumModules];
    updatedModules[moduleIdx] = { ...mod, lessons: reorderedLessons };
    setCurriculumModules(updatedModules);

    try {
      await lessonsService.reorderLessons(reorderedLessons.map((l) => ({ id: l.id, order: l.order })));
    } catch {
      // Local optimistic update
    }
    setNotice(`Đã đổi vị trí bài học: "${temp.title}"!`);
    setTimeout(() => setNotice(''), 3000);
  };

  // ==========================================
  // ENROLLMENT ACTIONS
  // ==========================================
  const handleApproveEnrollment = async (enrollmentId: string) => {
    setProcessingEnrollmentId(enrollmentId);
    try {
      await coursesService.approveEnrollment(enrollmentId);
      setEnrollments((prev) =>
        prev.map((e) =>
          e.id === enrollmentId ? { ...e, status: 'ACTIVE', approvedAt: new Date().toISOString() } : e,
        ),
      );
      setNotice('✅ Đã xác nhận chuyển khoản thành công và kích hoạt khóa học cho học viên!');
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Lỗi khi xác nhận');
      setNotice(`❌ Không thể xác nhận: ${msg}`);
    } finally {
      setProcessingEnrollmentId(null);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  const handleRejectEnrollment = async (enrollmentId: string) => {
    setProcessingEnrollmentId(enrollmentId);
    try {
      await coursesService.rejectEnrollment(enrollmentId);
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? { ...e, status: 'REJECTED' } : e)),
      );
      setNotice('Đã từ chối yêu cầu đăng ký khóa học.');
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Lỗi khi từ chối');
      setNotice(`Không thể từ chối: ${msg}`);
    } finally {
      setProcessingEnrollmentId(null);
      setTimeout(() => setNotice(''), 3000);
    }
  };

  const handleManualEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEnrollForm.courseId || !manualEnrollForm.userId) {
      alert('Vui lòng chọn học viên và khóa học!');
      return;
    }
    setIsSubmittingManual(true);
    try {
      await coursesService.manualEnroll({
        courseId: manualEnrollForm.courseId,
        userId: manualEnrollForm.userId,
        note: manualEnrollForm.note,
      });
      await fetchEnrollments();
      setNotice('✅ Đã ghi danh học viên vào khóa học thành công!');
      setIsManualEnrollOpen(false);
      setManualEnrollForm({ courseId: courses[0]?.id || '', userId: studentsList[0]?.id || '', note: '' });
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Lỗi khi ghi danh');
      setNotice(`Không thể ghi danh: ${msg}`);
    } finally {
      setIsSubmittingManual(false);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  // Counts by Track
  const englishCoursesCount = useMemo(() => {
    return courses.filter((c) => ['ENGLISH', 'IELTS', 'BUSINESS', 'KIDS'].includes(c.category) || c.isEnglishCourse).length;
  }, [courses]);

  const personalDevCoursesCount = useMemo(() => {
    return courses.filter((c) => ['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(c.category)).length;
  }, [courses]);

  // Filtered Courses (by Track + Pillar + Search)
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // 1. Filter by Track
      if (adminTrackFilter === 'ENGLISH') {
        const isEng = ['ENGLISH', 'IELTS', 'BUSINESS', 'KIDS'].includes(c.category) || c.isEnglishCourse === true;
        if (!isEng) return false;
      } else if (adminTrackFilter === 'PERSONAL_DEV') {
        const isPD = ['PEDAGOGY', 'LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(c.category);
        if (!isPD) return false;
      }

      // 2. Filter by Category Pill
      const matchPillar =
        courseCategoryFilter === 'ALL' ||
        c.category === courseCategoryFilter ||
        (courseCategoryFilter === 'SKILLS' &&
          ['LIFE_SKILLS', 'SOFT_SKILLS', 'PERSONAL_DEV'].includes(c.category));
      if (!matchPillar) return false;

      // 3. Filter by Search Query
      if (!courseSearch.trim()) return true;
      return c.title.toLowerCase().includes(courseSearch.toLowerCase());
    });
  }, [courses, adminTrackFilter, courseCategoryFilter, courseSearch]);

  // Filtered Enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const matchFilter = enrollmentFilter === 'ALL' || e.status === enrollmentFilter;
      if (!matchFilter) return false;
      if (!enrollmentSearch.trim()) return true;
      const q = enrollmentSearch.toLowerCase();
      const sName = e.user?.fullName?.toLowerCase() || '';
      const sEmail = e.user?.email?.toLowerCase() || '';
      const cTitle = e.course?.title?.toLowerCase() || '';
      return sName.includes(q) || sEmail.includes(q) || cTitle.includes(q);
    });
  }, [enrollments, enrollmentFilter, enrollmentSearch]);

  const pendingCount = useMemo(() => {
    return enrollments.filter((e) => e.status === 'PENDING').length;
  }, [enrollments]);

  return (
    <div className="space-y-6 select-none">
      {/* 1. Header with Fast-Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Quản Lý Đào Tạo & Cây Giáo Trình (LMS Engine)</span>
            {(loading || loadingCurriculum || loadingEnrollments) && (
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            )}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Khởi tạo khóa học kèm ảnh bìa, xây dựng cây giáo trình Modules & Lessons, đính kèm học liệu số và duyệt đăng ký.
          </p>
        </div>

        {/* 3 Prominent Actions */}
        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={() => handleOpenAddMaterial()}
            className="px-3.5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200 transition flex items-center space-x-1.5 shadow-xs"
          >
            <Paperclip className="w-4 h-4 text-sky-600" />
            <span>+ Đính Kèm Học Liệu</span>
          </button>
          <button
            onClick={() => handleOpenAddLesson()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center space-x-1.5"
          >
            <Layers className="w-4 h-4 text-slate-600" />
            <span>+ Thêm Bài Học</span>
          </button>
          <button
            onClick={handleOpenCreateCourseModal}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Khóa Học Mới</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 2. Top Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <button
          onClick={() => setAdminTab('courses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
            adminTab === 'courses'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Khóa Học & Cây Giáo Trình ({courses.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('enrollments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all ${
            adminTab === 'enrollments'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Duyệt Đăng Ký & Ghi Danh</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black animate-pulse">
              {pendingCount} chờ duyệt
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COURSES & UNIFIED CURRICULUM & MATERIAL BUILDER                     */}
      {/* ========================================================================= */}
      {adminTab === 'courses' && (
        <div className="space-y-6">
          {/* Section A: Course Catalog with Pillar Filters & View Switcher */}
          <div className="bg-white rounded-3xl border border-line p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <h2 className="text-xs sm:text-sm font-black uppercase text-slate-800 tracking-wider">
                  Danh Mục Khóa Học ({filteredCourses.length})
                </h2>
                <p className="text-[11px] text-muted">
                  Bấm &quot;Quản trị giáo trình&quot; trên khóa học để tải cây chương mục & học liệu bên dưới.
                </p>
              </div>

              {/* Search & View Mode Switcher */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm tên khóa học..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="w-full pl-8.5 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-primary"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setCourseViewMode('grid')}
                    className={`p-1.5 rounded-lg transition ${
                      courseViewMode === 'grid'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Dạng Thẻ Bìa (Grid Card)"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCourseViewMode('table')}
                    className={`p-1.5 rounded-lg transition ${
                      courseViewMode === 'table'
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Dạng Bảng Danh Sách (Table)"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Primary Track Filter Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-line/60">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setAdminTrackFilter('ALL');
                    setCourseCategoryFilter('ALL');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition ${
                    adminTrackFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tất Cả ({courses.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminTrackFilter('ENGLISH');
                    setCourseCategoryFilter('ALL');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                    adminTrackFilter === 'ENGLISH'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-sky-700'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 shrink-0" />
                  <span>Tiếng Anh & IELTS ({englishCoursesCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminTrackFilter('PERSONAL_DEV');
                    setCourseCategoryFilter('ALL');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                    adminTrackFilter === 'PERSONAL_DEV'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>Phát Triển Cá Nhân & Sư Phạm ({personalDevCoursesCount})</span>
                </button>
              </div>

              <span className="text-[11px] font-bold text-slate-400">
                Hiển thị {filteredCourses.length}/{courses.length} khóa học
              </span>
            </div>

            {/* Dynamic Pillar Filter Pills according to active track */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(adminTrackFilter === 'ENGLISH'
                ? [
                    { id: 'ALL', label: 'Tất cả Tiếng Anh' },
                    { id: 'IELTS', label: 'IELTS 4 Kỹ Năng' },
                    { id: 'ENGLISH', label: 'General English' },
                    { id: 'BUSINESS', label: 'Business English' },
                    { id: 'KIDS', label: 'Tiếng Anh Thiếu Nhi' },
                  ]
                : adminTrackFilter === 'PERSONAL_DEV'
                ? [
                    { id: 'ALL', label: 'Tất cả Kỹ Năng & Sư Phạm' },
                    { id: 'PEDAGOGY', label: 'Năng Lực Sư Phạm EdTech' },
                    { id: 'LIFE_SKILLS', label: 'Kỹ Năng Sống & Thuyết Trình' },
                    { id: 'SOFT_SKILLS', label: 'Kỹ Năng Mềm' },
                    { id: 'PERSONAL_DEV', label: 'Phát Triển Bản Thân' },
                  ]
                : [
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'IELTS', label: 'IELTS 4 Kỹ Năng' },
                    { id: 'ENGLISH', label: 'General English' },
                    { id: 'BUSINESS', label: 'Business' },
                    { id: 'KIDS', label: 'Kids English' },
                    { id: 'PEDAGOGY', label: 'Sư Phạm EdTech' },
                    { id: 'LIFE_SKILLS', label: 'Kỹ Năng Sống' },
                    { id: 'SOFT_SKILLS', label: 'Kỹ Năng Mềm' },
                    { id: 'PERSONAL_DEV', label: 'Phát Triển Bản Thân' },
                  ]
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setCourseCategoryFilter(p.id)}
                  className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition ${
                    courseCategoryFilter === p.id
                      ? adminTrackFilter === 'PERSONAL_DEV'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs'
                        : 'bg-sky-100 text-primary border border-sky-200 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* 1. GRID VIEW WITH RICH COVER IMAGES */}
            {courseViewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                {filteredCourses.map((c) => {
                  const isSelected = selectedCourseId === c.id;
                  const coverUrl = getCourseCover(c);

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCourseId(c.id)}
                      className={`group rounded-3xl border bg-white overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10'
                          : 'border-line hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        {/* 16:9 Cover Image Box */}
                        <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                          <img
                            src={coverUrl}
                            alt={c.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {/* Floating Badges */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
                              {c.category}
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/90 text-slate-800 backdrop-blur-md shadow-xs">
                              {c.level}
                            </span>
                          </div>

                          {/* Selected Active Tag */}
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-black flex items-center gap-1 shadow-md">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <span>Đang quản trị</span>
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-2">
                          <h3 className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {c.title}
                          </h3>

                          <div className="flex items-center justify-between text-xs pt-1 text-slate-600">
                            <span className="font-bold text-slate-500 flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5 text-primary" />
                              <span>{c.moduleCount ?? c.modules?.length ?? 0} chương học</span>
                            </span>
                            <span className="font-mono font-extrabold text-slate-900">
                              {(c.price ?? 2490000).toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div
                        className="px-4 py-3 bg-slate-50/60 border-t border-line flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {c.status}
                        </span>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setSelectedCourseId(c.id)}
                            className={`px-2.5 py-1 rounded-xl font-bold text-[11px] transition ${
                              isSelected
                                ? 'bg-primary text-white'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-line'
                            }`}
                          >
                            {isSelected ? 'Đang mở' : 'Mở giáo trình'}
                          </button>
                          <button
                            onClick={() => handleOpenEditCourseModal(c)}
                            className="p-1.5 text-slate-500 hover:text-primary rounded-lg hover:bg-white transition"
                            title="Sửa khóa học"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition"
                            title="Xóa khóa học"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. TABLE VIEW WITH THUMBNAIL COLUMN */}
            {courseViewMode === 'table' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-line text-slate-400 font-black uppercase tracking-wider text-[10.5px]">
                    <tr>
                      <th className="py-2.5 px-3">Ảnh Bìa</th>
                      <th className="py-2.5 px-3">Tên Khóa Học</th>
                      <th className="py-2.5 px-3">Trụ Cột</th>
                      <th className="py-2.5 px-3">Cấp Độ</th>
                      <th className="py-2.5 px-3">Học Phí</th>
                      <th className="py-2.5 px-3">Chương Học</th>
                      <th className="py-2.5 px-3">Trạng Thái</th>
                      <th className="py-2.5 px-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredCourses.map((c) => {
                      const isSelected = selectedCourseId === c.id;
                      const coverUrl = getCourseCover(c);

                      return (
                        <tr
                          key={c.id}
                          className={`transition cursor-pointer ${
                            isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50/50'
                          }`}
                          onClick={() => setSelectedCourseId(c.id)}
                        >
                          <td className="py-2.5 px-3">
                            <img
                              src={coverUrl}
                              alt={c.title}
                              className="w-16 h-10 object-cover rounded-xl shadow-2xs border border-line"
                              loading="lazy"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-extrabold text-slate-900 flex items-center gap-2">
                              {isSelected && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
                              <span>{c.title}</span>
                            </div>
                            <span className="text-[10px] text-muted font-mono">{c.slug}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-primary border border-sky-100">
                              {c.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-600">{c.level}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {(c.price ?? 2490000).toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-700">
                            {c.moduleCount ?? c.modules?.length ?? 0} modules
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                c.status === 'PUBLISHED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedCourseId(c.id)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition shadow-2xs ${
                                isSelected
                                  ? 'bg-primary text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {isSelected ? 'Đang mở' : 'Xem giáo trình'}
                            </button>
                            <button
                              onClick={() => handleOpenEditCourseModal(c)}
                              className="p-1.5 text-slate-500 hover:text-primary rounded-lg hover:bg-sky-50 transition"
                              title="Sửa khóa học"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(c.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                              title="Xóa khóa học"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section B: Unified Curriculum & Materials Builder */}
          {activeCourse && (
            <div className="bg-white rounded-3xl border border-line p-5 sm:p-6 shadow-xs space-y-5">
              {/* Active Course Banner with Cover Photo */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-white to-sky-50/50 border border-sky-100">
                <div className="flex items-center gap-4">
                  {/* Course Cover Image Preview */}
                  <img
                    src={getCourseCover(activeCourse)}
                    alt={activeCourse.title}
                    className="w-28 h-18 sm:w-36 sm:h-22 rounded-2xl object-cover shadow-sm border border-slate-200 shrink-0"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary text-white shadow-2xs">
                        GIÁO TRÌNH ĐANG QUẢN TRỊ
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-primary">
                        {activeCourse.category}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {activeCourse.level}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {activeCourse.title}
                    </h3>
                    <p className="text-xs text-muted">
                      {curriculumModules.length} Chương (Modules) •{' '}
                      {curriculumModules.reduce((acc, m) => acc + m.lessons.length, 0)} Bài học (Lessons) •{' '}
                      {courseMaterials.length +
                        curriculumModules.reduce(
                          (acc, m) => acc + m.lessons.reduce((lacc, l) => lacc + (l.materials?.length || 0), 0),
                          0,
                        )}{' '}
                      Học liệu số đính kèm
                    </p>
                  </div>
                </div>

                {/* 3 Quick Action Buttons for Curriculum */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={handleOpenAddModule}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                    <span>+ Thêm Chương (Module)</span>
                  </button>
                  <button
                    onClick={() => handleOpenAddLesson()}
                    className="px-3 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <Layers className="w-4 h-4" />
                    <span>+ Thêm Bài Học</span>
                  </button>
                  <button
                    onClick={() => handleOpenAddMaterial()}
                    className="px-3 py-2 rounded-xl bg-[#FFB547] hover:bg-[#FFA726] text-[#14263D] font-black text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <Paperclip className="w-4 h-4 text-[#14263D]" />
                    <span>+ Đính Kèm Học Liệu</span>
                  </button>
                  <Link
                    href={`/admin/assessments?tab=mocktest&courseId=${activeCourse.id}&category=${activeCourse.category}&action=new_quiz`}
                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-4 h-4 text-white" />
                    <span>+ Thêm Quiz / Test</span>
                  </Link>
                </div>
              </div>

              {/* Course-level Materials Bar */}
              {courseMaterials.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-line space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-primary" />
                      <span>Học Liệu Chung Của Khóa Học ({courseMaterials.length})</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenAddMaterial()}
                        className="text-[11px] font-bold text-primary hover:text-primary-dark hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tải Lên Đề Thi & Audio
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {courseMaterials.map((mat) => {
                      const isAudio =
                        mat.type === 'AUDIO' ||
                        mat.title.toLowerCase().endsWith('.mp3') ||
                        mat.title.toLowerCase().endsWith('.wav');
                      const hasAudios = (mat.children && mat.children.length > 0);
                      return (
                        <div
                          key={mat.id}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs group transition ${
                            isAudio
                              ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400'
                              : 'bg-white border-line hover:border-sky-300'
                          }`}
                        >
                          {isAudio ? (
                            <span className="p-1 rounded-md bg-amber-100 text-amber-700">
                              <Headphones className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="p-1 rounded-md bg-red-100 text-red-600">
                              <FileText className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenPreviewMaterial(mat)}
                            className="text-slate-800 hover:text-primary font-bold transition truncate max-w-[200px] text-left"
                            title={isAudio ? 'Nghe tệp Audio' : hasAudios ? 'Xem Đề thi & Nghe Audio con' : 'Xem tệp PDF'}
                          >
                            {mat.title}
                          </button>

                          {hasAudios && (
                            <span className="text-[9.5px] px-2 py-0.5 rounded-full font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                              <Headphones className="w-3 h-3 text-amber-700" />
                              <span>{mat.children!.length} Audio con</span>
                            </span>
                          )}

                          {!isAudio && !hasAudios && (
                            <span className="text-[9.5px] px-1.5 py-0.5 rounded font-extrabold bg-red-100 text-red-700">
                              PDF
                            </span>
                          )}

                          {!isAudio && (
                            <button
                              type="button"
                              onClick={() => {
                                setAttachToMaterial(mat);
                                setAttachAudioFile(null);
                                setAttachAudioTitle('');
                              }}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition flex items-center gap-0.5"
                              title="Gắn thêm tệp âm thanh bài nghe con vào đề này"
                            >
                              <Plus className="w-2.5 h-2.5 text-amber-600" />
                              <span>Gắn Audio</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenPreviewMaterial(mat)}
                            className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold flex items-center gap-1 transition ${
                              isAudio
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : hasAudios
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-primary hover:bg-primary-dark text-white'
                            }`}
                            title={isAudio ? 'Nghe Audio trực tuyến' : hasAudios ? 'Xem Đề & Nghe Audio tích hợp' : 'Xem trước PDF'}
                          >
                            {isAudio ? <Play className="w-2.5 h-2.5 fill-current" /> : hasAudios ? <Headphones className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                            <span>{isAudio ? 'Nghe' : hasAudios ? 'Xem & Nghe' : 'Xem'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteMaterial(mat.id)}
                            className="text-slate-400 hover:text-red-500 ml-0.5 opacity-60 hover:opacity-100 transition"
                            title="Xóa tài liệu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modules & Lessons Hierarchy Tree */}
              <div className="space-y-4">
                {loadingCurriculum ? (
                  <div className="py-12 text-center text-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    <span className="text-xs font-bold">Đang đồng bộ cây giáo trình...</span>
                  </div>
                ) : curriculumModules.length === 0 ? (
                  <div className="py-12 text-center text-muted border border-dashed border-line rounded-3xl p-6 space-y-3">
                    <Layers className="w-10 h-10 text-slate-300 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-700">Khóa học này chưa có chương học nào</h4>
                      <p className="text-xs text-muted mt-1">
                        Hãy bắt đầu bằng cách tạo Chương học (Module) đầu tiên để gắn các bài học và học liệu số.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenAddModule}
                      className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-xs"
                    >
                      + Tạo Chương Học Đầu Tiên
                    </button>
                  </div>
                ) : (
                  curriculumModules.map((mod, modIdx) => (
                    <div
                      key={mod.id}
                      className="rounded-3xl border border-line bg-slate-50/50 p-4 sm:p-5 space-y-3 hover:border-slate-300 transition"
                    >
                      {/* Module Header Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3.5 rounded-2xl border border-line shadow-xs">
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs shrink-0">
                            {mod.order}
                          </span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900">{mod.title}</h4>
                            <span className="text-[11px] text-muted font-medium">
                              {mod.lessons.length} bài học trực thuộc
                            </span>
                          </div>
                        </div>

                        {/* Module Controls */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => handleOpenAddLesson(mod.id)}
                            className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-primary font-bold text-[11px] transition flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm Bài Học</span>
                          </button>
                          <div className="flex items-center space-x-1 border-l border-line pl-1.5">
                            <button
                              type="button"
                              disabled={modIdx === 0}
                              onClick={() => handleMoveModule(modIdx, -1)}
                              className="p-1 rounded-lg border border-line bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
                              title="Chuyển lên"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              disabled={modIdx === curriculumModules.length - 1}
                              onClick={() => handleMoveModule(modIdx, 1)}
                              className="p-1 rounded-lg border border-line bg-slate-50 hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
                              title="Chuyển xuống"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteModule(mod.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Xóa chương"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Lessons List in Module */}
                      <div className="space-y-2 pl-0 sm:pl-6">
                        {mod.lessons.length === 0 ? (
                          <div className="p-3 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
                            Chương này chưa có bài học nào. Bấm &quot;Thêm Bài Học&quot; để tạo bài giảng.
                          </div>
                        ) : (
                          mod.lessons.map((les, lesIdx) => (
                            <div
                              key={les.id}
                              className="p-3 rounded-2xl bg-white border border-line text-xs space-y-2 hover:border-primary/40 transition shadow-2xs"
                            >
                              {/* Lesson Top Row */}
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center space-x-2.5">
                                  <span className="text-[10px] font-mono font-bold text-slate-400">
                                    #{les.order}
                                  </span>
                                  <span className="font-extrabold text-slate-900">{les.title}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                                    {les.type || 'VIDEO'} • {les.durationMinutes || 45}m
                                  </span>
                                </div>

                                {/* Reorder & Actions */}
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleOpenAddMaterial(les.id)}
                                    className="px-2 py-1 rounded-md bg-sky-50 hover:bg-sky-100 text-primary font-bold text-[10.5px] transition flex items-center gap-1"
                                    title="Đính kèm tài liệu vào bài này"
                                  >
                                    <Paperclip className="w-3 h-3" />
                                    <span>Đính kèm</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={lesIdx === 0}
                                    onClick={() => handleMoveLesson(modIdx, lesIdx, -1)}
                                    className="p-1 rounded text-slate-400 hover:text-primary disabled:opacity-20 transition"
                                    title="Di chuyển lên"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={lesIdx === mod.lessons.length - 1}
                                    onClick={() => handleMoveLesson(modIdx, lesIdx, 1)}
                                    className="p-1 rounded text-slate-400 hover:text-primary disabled:opacity-20 transition"
                                    title="Di chuyển xuống"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLesson(les.id)}
                                    className="p-1 rounded text-slate-400 hover:text-red-600 transition"
                                    title="Xóa bài học"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Lesson Materials Chips */}
                              {les.materials && les.materials.length > 0 && (
                                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
                                  <span className="text-[10px] text-muted font-bold">Học liệu ({les.materials.length}):</span>
                                  {les.materials.map((m) => {
                                    const isAudio =
                                      m.type === 'AUDIO' ||
                                      m.title.toLowerCase().endsWith('.mp3') ||
                                      m.title.toLowerCase().endsWith('.wav');
                                    const hasAudios = (m.children && m.children.length > 0);
                                    return (
                                      <span
                                        key={m.id}
                                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10.5px] font-semibold transition ${
                                          isAudio
                                            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                                            : 'bg-slate-50 border-slate-200 text-slate-700'
                                        }`}
                                      >
                                        {isAudio ? (
                                          <Headphones className="w-3 h-3 text-amber-600 shrink-0" />
                                        ) : (
                                          <FileText className="w-3 h-3 text-red-500 shrink-0" />
                                        )}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleOpenPreviewMaterial(
                                              m,
                                              `${activeCourse?.title || ''} • ${les.title}`,
                                            )
                                          }
                                          className="hover:underline hover:text-primary font-bold text-left truncate max-w-[130px]"
                                          title={isAudio ? 'Nghe file audio bài giảng' : hasAudios ? 'Xem Đề & Nghe Audio con' : 'Xem tài liệu PDF'}
                                        >
                                          {m.title}
                                        </button>

                                        {hasAudios && (
                                          <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 font-extrabold flex items-center gap-0.5">
                                            <Headphones className="w-2.5 h-2.5" />
                                            {m.children!.length}
                                          </span>
                                        )}

                                        {!isAudio && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setAttachToMaterial(m);
                                              setAttachAudioFile(null);
                                              setAttachAudioTitle('');
                                            }}
                                            className="px-1 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                                            title="Gắn Audio bài nghe con vào đề này"
                                          >
                                            +Audio
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleOpenPreviewMaterial(
                                              m,
                                              `${activeCourse?.title || ''} • ${les.title}`,
                                            )
                                          }
                                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-0.5 cursor-pointer ${
                                            isAudio
                                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                              : hasAudios
                                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                              : 'bg-sky-500 hover:bg-sky-600 text-white'
                                          }`}
                                          title={isAudio ? 'Nghe Audio bài giảng' : hasAudios ? 'Xem Đề thi & Nghe Audio con' : 'Xem trước PDF'}
                                        >
                                          {isAudio ? (
                                            <Play className="w-2 h-2 fill-current" />
                                          ) : hasAudios ? (
                                            <Headphones className="w-2 h-2" />
                                          ) : (
                                            <Eye className="w-2 h-2" />
                                          )}
                                          <span>{isAudio ? 'Nghe' : hasAudios ? 'Xem & Nghe' : 'Xem'}</span>
                                        </button>

                                        <button
                                          onClick={() => handleDeleteMaterial(m.id)}
                                          className="text-slate-400 hover:text-red-500 ml-0.5"
                                          title="Xóa học liệu"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ENROLLMENT APPROVAL & VIETQR MANAGEMENT                            */}
      {/* ========================================================================= */}
      {adminTab === 'enrollments' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-line shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Tổng yêu cầu đăng ký</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{enrollments.length} lượt</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-line shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Chờ đối soát sao kê (PENDING)</p>
                <p className="text-xl sm:text-2xl font-black text-amber-600">{pendingCount} yêu cầu</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-line shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Đã kích hoạt khóa học (ACTIVE)</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600">
                  {enrollments.filter((e) => e.status === 'ACTIVE').length} học viên
                </p>
              </div>
            </div>
          </div>

          {/* Filter Bar & Search */}
          <div className="bg-white p-4 rounded-3xl border border-line shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên, email, khóa học..."
                value={enrollmentSearch}
                onChange={(e) => setEnrollmentSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'ALL', label: `Tất cả (${enrollments.length})`, icon: null },
                { id: 'PENDING', label: `Chờ duyệt (${pendingCount})`, icon: Clock },
                { id: 'ACTIVE', label: 'Đã kích hoạt', icon: CheckCircle2 },
                { id: 'REJECTED', label: 'Đã từ chối', icon: X },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEnrollmentFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
                    enrollmentFilter === tab.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.icon && <tab.icon className="w-3.5 h-3.5 shrink-0" />}
                  <span>{tab.label}</span>
                </button>
              ))}

              <button
                onClick={() => setIsManualEnrollOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 ml-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Ghi Danh Thủ Công</span>
              </button>
            </div>
          </div>

          {/* Enrollments Table */}
          <div className="bg-white rounded-3xl border border-line shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-line text-slate-400 font-black uppercase text-[10.5px]">
                  <tr>
                    <th className="py-3 px-4">Học Viên</th>
                    <th className="py-3 px-4">Khóa Học Đăng Ký</th>
                    <th className="py-3 px-4">Ghi Chú Chuyển Khoản</th>
                    <th className="py-3 px-4">Thời Gian</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        Không tìm thấy yêu cầu đăng ký nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{e.user?.fullName || 'Học viên'}</div>
                          <div className="text-[11px] text-muted font-normal">{e.user?.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {e.course?.title || 'Khóa học'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">
                          {e.paymentNote || 'Quét mã VietQR'}
                        </td>
                        <td className="py-3.5 px-4 text-muted">
                          {new Date(e.enrolledAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                              e.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : e.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {e.status === 'PENDING' && (
                            <>
                              <button
                                disabled={processingEnrollmentId === e.id}
                                onClick={() => handleApproveEnrollment(e.id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition"
                              >
                                Kích hoạt
                              </button>
                              <button
                                disabled={processingEnrollmentId === e.id}
                                onClick={() => handleRejectEnrollment(e.id)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                              >
                                Từ chối
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT COURSE (#courseModal) WITH THUMBNAIL STUDIO         */}
      {/* ========================================================================= */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingCourseId ? 'Chỉnh Sửa Khóa Học & Ảnh Bìa' : 'Khởi Tạo Khóa Học Mới'}
              </h3>
              <button
                onClick={() => {
                  setIsCourseModalOpen(false);
                  setEditingCourseId(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              {/* 0. Primary Track Selection (Tiếng Anh vs Phát triển cá nhân) */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-black text-slate-800">
                  Phân Loại Trụ Cột Đào Tạo <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCourseFormData((prev) => ({
                        ...prev,
                        track: 'ENGLISH',
                        category: 'IELTS',
                        thumbnail: DEFAULT_COVERS['IELTS'],
                      }));
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      courseFormData.track === 'ENGLISH'
                        ? 'bg-sky-50 border-sky-500 text-sky-950 ring-2 ring-sky-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        courseFormData.track === 'ENGLISH' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black">Đào Tạo Tiếng Anh & IELTS</p>
                      <p className="text-[10px] text-slate-500">IELTS, Giao tiếp, Doanh nghiệp, Thiếu nhi</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCourseFormData((prev) => ({
                        ...prev,
                        track: 'PERSONAL_DEV',
                        category: 'PEDAGOGY',
                        thumbnail: DEFAULT_COVERS['PEDAGOGY'],
                      }));
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition ${
                      courseFormData.track === 'PERSONAL_DEV'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        courseFormData.track === 'PERSONAL_DEV'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black">Phát Triển Cá Nhân & Sư Phạm</p>
                      <p className="text-[10px] text-slate-500">Sư phạm EdTech, Kỹ năng sống & mềm</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 1. Course Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  placeholder={
                    courseFormData.track === 'ENGLISH'
                      ? 'Ví dụ: IELTS Masterclass 7.5+ Intensive'
                      : 'Ví dụ: Phương Pháp Giảng Dạy Tiếng Anh Hiện Đại & Làm Chủ Lớp Học'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary font-semibold text-slate-900"
                />
              </div>

              {/* 2. Cover Photo Thumbnail Studio */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <span>Ảnh Bìa Khóa Học (Cover Thumbnail)</span>
                  </label>
                  {courseFormData.thumbnail && (
                    <button
                      type="button"
                      onClick={() => setCourseFormData({ ...courseFormData, thumbnail: '' })}
                      className="text-[11px] text-red-500 hover:underline"
                    >
                      Dùng ảnh mặc định
                    </button>
                  )}
                </div>

                {/* 16:9 Image Preview Box */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-200 border border-slate-300">
                  <img
                    src={courseFormData.thumbnail || DEFAULT_COVERS[courseFormData.category] || DEFAULT_COVERS['IELTS']}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                    Xem trước ảnh bìa 16:9
                  </div>
                </div>

                {/* Upload from device or URL */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    ref={courseCoverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadThumbnailFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingThumbnail}
                    onClick={() => courseCoverInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-line shadow-2xs transition flex items-center gap-1.5 shrink-0"
                  >
                    {isUploadingThumbnail ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-primary" />
                    )}
                    <span>Tải ảnh từ máy tính</span>
                  </button>

                  <input
                    type="url"
                    value={courseFormData.thumbnail}
                    onChange={(e) => setCourseFormData({ ...courseFormData, thumbnail: e.target.value })}
                    placeholder="Hoặc dán link ảnh trực tiếp (https://...)"
                    className="flex-1 px-3 py-2 rounded-xl border border-line text-xs bg-white font-mono"
                  />
                </div>

                {/* Curated Presets Bar matching Track */}
                <div className="pt-1">
                  <span className="text-[10px] text-muted block mb-1 font-bold">
                    Gợi ý ảnh bìa cho {courseFormData.track === 'ENGLISH' ? 'phân hệ Tiếng Anh' : 'phân hệ Kỹ năng & Sư phạm'}:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {(courseFormData.track === 'ENGLISH'
                      ? [
                          { cat: 'IELTS', label: 'IELTS Master' },
                          { cat: 'ENGLISH', label: 'General English' },
                          { cat: 'BUSINESS', label: 'Business English' },
                          { cat: 'KIDS', label: 'Kids English' },
                        ]
                      : [
                          { cat: 'PEDAGOGY', label: 'Sư Phạm EdTech' },
                          { cat: 'LIFE_SKILLS', label: 'Kỹ Năng Sống' },
                          { cat: 'SOFT_SKILLS', label: 'Kỹ Năng Mềm' },
                          { cat: 'PERSONAL_DEV', label: 'Phát Triển Bản Thân' },
                        ]
                    ).map((preset) => (
                      <button
                        key={preset.cat}
                        type="button"
                        onClick={() =>
                          setCourseFormData({ ...courseFormData, thumbnail: DEFAULT_COVERS[preset.cat] })
                        }
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 text-[10.5px] font-bold text-slate-700 border border-line transition shadow-2xs whitespace-nowrap"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Category & Level */}
              <div className="grid grid-cols-2 gap-4">
                <CustomSelect
                  label="Danh Mục Trực Thuộc *"
                  value={courseFormData.category}
                  onChange={(val) => {
                    setCourseFormData((prev) => ({
                      ...prev,
                      category: val,
                      thumbnail: prev.thumbnail || DEFAULT_COVERS[val] || '',
                    }));
                  }}
                  options={
                    courseFormData.track === 'ENGLISH'
                      ? [
                          {
                            value: 'IELTS',
                            label: 'English Proficiency (IELTS)',
                            sublabel: 'Luyện thi IELTS Chuyên Sâu',
                            icon: <BookOpen className="w-4 h-4 text-sky-500" />,
                            badge: 'Core',
                          },
                          {
                            value: 'ENGLISH',
                            label: 'General English',
                            sublabel: 'Tiếng Anh Giao tiếp & Học thuật',
                            icon: <BookOpen className="w-4 h-4 text-blue-500" />,
                            badge: 'Standard',
                          },
                          {
                            value: 'BUSINESS',
                            label: 'Business English',
                            sublabel: 'Giao tiếp & Đàm phán chuyên nghiệp',
                            icon: <Briefcase className="w-4 h-4 text-emerald-500" />,
                            badge: 'VIP',
                            badgeColor: 'bg-emerald-100 text-emerald-700',
                          },
                          {
                            value: 'KIDS',
                            label: 'Kids English',
                            sublabel: 'Tiếng Anh thiếu nhi',
                            icon: <Baby className="w-4 h-4 text-amber-500" />,
                            badge: 'Junior',
                            badgeColor: 'bg-amber-100 text-amber-700',
                          },
                        ]
                      : [
                          {
                            value: 'PEDAGOGY',
                            label: 'Năng Lực Sư Phạm',
                            sublabel: 'Đào tạo giáo viên & Phương pháp',
                            icon: <GraduationCap className="w-4 h-4 text-purple-500" />,
                            badge: 'TESOL',
                          },
                          {
                            value: 'LIFE_SKILLS',
                            label: 'Kỹ Năng Sống',
                            sublabel: 'Kỹ năng sinh tồn & Thuyết trình',
                            icon: <Sparkles className="w-4 h-4 text-rose-500" />,
                            badge: 'Life',
                          },
                          {
                            value: 'SOFT_SKILLS',
                            label: 'Kỹ Năng Mềm',
                            sublabel: 'Làm việc nhóm & Đàm phán',
                            icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
                            badge: 'SoftSkills',
                          },
                          {
                            value: 'PERSONAL_DEV',
                            label: 'Phát Triển Bản Thân',
                            sublabel: 'Quản trị cảm xúc & Lãnh đạo',
                            icon: <Compass className="w-4 h-4 text-emerald-500" />,
                            badge: 'Self-Growth',
                            badgeColor: 'bg-emerald-100 text-emerald-700',
                          },
                        ]
                  }
                />

                <CustomSelect
                  label="Cấp độ mục tiêu *"
                  value={courseFormData.level}
                  onChange={(val) => setCourseFormData({ ...courseFormData, level: val })}
                  options={[
                    { value: 'BEGINNER', label: 'Beginner (4.0 - 5.0)', colorDot: 'bg-sky-400', badge: 'Tier 1' },
                    { value: 'INTERMEDIATE', label: 'Intermediate (5.5 - 6.5)', colorDot: 'bg-emerald-400', badge: 'Tier 2' },
                    { value: 'ADVANCED', label: 'Advanced (7.0 - 7.5)', colorDot: 'bg-purple-400', badge: 'Tier 3' },
                    { value: 'MASTER', label: 'Master (8.0 - 8.5+)', colorDot: 'bg-amber-400', badge: 'Elite' },
                  ]}
                />
              </div>

              {/* 4. Price */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Học phí niêm yết (VND) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={courseFormData.price}
                  onChange={(e) => setCourseFormData({ ...courseFormData, price: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold text-slate-800"
                />
              </div>

              {/* 5. Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả tóm tắt mục tiêu đầu ra
                </label>
                <textarea
                  rows={2}
                  value={courseFormData.shortDesc}
                  onChange={(e) => setCourseFormData({ ...courseFormData, shortDesc: e.target.value })}
                  placeholder="Mô tả mục tiêu chuẩn đầu ra của khóa học..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-medium text-slate-800"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCourseModalOpen(false);
                    setEditingCourseId(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm"
                >
                  {editingCourseId ? 'Lưu Thay Đổi' : 'Tạo Khóa Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD MODULE (#moduleModal)                                        */}
      {/* ========================================================================= */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Thêm Chương Học Mới (Module)
              </h3>
              <button
                onClick={() => setIsModuleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Khóa học trực thuộc
                </label>
                <input
                  type="text"
                  disabled
                  value={activeCourse?.title || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line bg-slate-50 text-xs font-bold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Chương học (Module) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={moduleTitleInput}
                  onChange={(e) => setModuleTitleInput(e.target.value)}
                  placeholder="Ví dụ: Module 03: Paragraph Development & Coherence"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-primary text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingModule}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  {isSubmittingModule && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Tạo Chương Mới</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD LESSON (#lessonModal)                                        */}
      {/* ========================================================================= */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Thêm Bài Học Mới Vào Giáo Trình
              </h3>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <CustomSelect
                label="Khóa học trực thuộc *"
                value={lessonFormData.courseId}
                onChange={(val) => {
                  setLessonFormData({ ...lessonFormData, courseId: val });
                  setSelectedCourseId(val);
                }}
                options={courses.map((c) => ({
                  value: c.id,
                  label: c.title,
                  sublabel: `${c.category} • ${c.level}`,
                  icon: <GraduationCap className="w-4 h-4 text-primary" />,
                }))}
              />

              {/* Module Selection / Creation Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Chương học (Module) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setLessonFormData((prev) => ({
                        ...prev,
                        isCreatingNewModule: !prev.isCreatingNewModule,
                      }))
                    }
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    {lessonFormData.isCreatingNewModule ? '← Chọn chương có sẵn' : '+ Tạo chương mới'}
                  </button>
                </div>

                {lessonFormData.isCreatingNewModule || curriculumModules.length === 0 ? (
                  <input
                    type="text"
                    required
                    value={lessonFormData.newModuleTitle}
                    onChange={(e) =>
                      setLessonFormData({ ...lessonFormData, newModuleTitle: e.target.value })
                    }
                    placeholder="Nhập tên chương học mới (Ví dụ: Module 02: Advanced Vocab)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-primary text-xs font-semibold"
                  />
                ) : (
                  <select
                    value={lessonFormData.moduleId}
                    onChange={(e) =>
                      setLessonFormData({ ...lessonFormData, moduleId: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold bg-white"
                  >
                    {curriculumModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên Bài học cụ thể <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lessonFormData.lessonTitle}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, lessonTitle: e.target.value })}
                  placeholder="Ví dụ: Lesson 08: Inversion & Cleft Sentences"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <CustomSelect
                  label="Loại bài học *"
                  value={lessonFormData.type}
                  onChange={(val) => setLessonFormData({ ...lessonFormData, type: val })}
                  options={[
                    {
                      value: 'VIDEO',
                      label: 'Video bài giảng',
                      sublabel: 'Video streaming HLS',
                      icon: <Video className="w-4 h-4 text-sky-500" />,
                    },
                    {
                      value: 'READING',
                      label: 'Tài liệu đọc',
                      sublabel: 'PDF & Ebook có Watermark',
                      icon: <FileText className="w-4 h-4 text-emerald-500" />,
                    },
                    {
                      value: 'QUIZ',
                      label: 'Đề thi trắc nghiệm',
                      sublabel: 'Chấm điểm tự động & Sàn 80%',
                      icon: <HelpCircle className="w-4 h-4 text-amber-500" />,
                    },
                    {
                      value: 'WRITING',
                      label: 'Bài tập Writing',
                      sublabel: 'AI chấm 4 tiêu chí IELTS',
                      icon: <PenTool className="w-4 h-4 text-purple-500" />,
                    },
                  ]}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Thời lượng ước tính (Phút) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    required
                    value={lessonFormData.durationMinutes}
                    onChange={(e) =>
                      setLessonFormData({ ...lessonFormData, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Video File Upload with Progress Indicator */}
              {lessonFormData.type === 'VIDEO' && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-line">
                  <label className="block text-xs font-bold text-slate-700">
                    File Video Bài Giảng (.mp4, .mov, Cloudinary)
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/*"
                    onChange={(e) => setLessonVideoFile(e.target.files?.[0] || null)}
                    className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary-dark cursor-pointer"
                  />
                  {lessonVideoFile && (
                    <p className="text-[11px] text-slate-600 font-medium">
                      Đã chọn: {lessonVideoFile.name} ({(lessonVideoFile.size / (1024 * 1024)).toFixed(1)} MB)
                    </p>
                  )}
                  {lessonUploadProgress !== null && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-bold text-primary">
                        <span>Đang tải video lên Cloudinary...</span>
                        <span>{lessonUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all duration-200"
                          style={{ width: `${lessonUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkFreePreview"
                  checked={lessonFormData.isFreePreview}
                  onChange={(e) =>
                    setLessonFormData({ ...lessonFormData, isFreePreview: e.target.checked })
                  }
                  className="rounded border-line text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="chkFreePreview" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Cho phép học thử miễn phí (Free Preview trước khi đăng ký)
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm"
                >
                  Tạo Bài Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: UPLOAD & ATTACH MATERIAL (#materialModal)                        */}
      {/* ========================================================================= */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-line p-6 space-y-4 my-8 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-primary" />
                  <span>Tải Lên Đề Thi & Tệp Âm Thanh Audio Con</span>
                </h3>
                <p className="text-[11px] text-muted">
                  Đề thi PDF là đối tượng cha, tệp âm thanh Audio bài nghe là đối tượng con đi kèm được mã hóa DRM 15 phút.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsMaterialModalOpen(false);
                  if (localAudioFilePreviewUrl) {
                    URL.revokeObjectURL(localAudioFilePreviewUrl);
                    setLocalAudioFilePreviewUrl(null);
                  }
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMaterialSubmit} className="space-y-4">
              {/* 1. PDF File Dropzone (Required) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Chọn tệp Đề thi / Giáo trình PDF <span className="text-red-500">* (Bắt buộc)</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleFileChange(f);
                  }}
                  className="border-2 border-dashed border-sky-300 hover:border-primary bg-sky-50/40 hover:bg-sky-50 rounded-2xl p-4 text-center transition cursor-pointer"
                >
                  {materialFile ? (
                    <div className="flex items-center justify-center gap-2 font-bold text-xs text-slate-800">
                      <FileText className="w-5 h-5 text-red-600 shrink-0" />
                      <span className="truncate max-w-xs">{materialFile.name}</span>
                      <span className="text-slate-500 text-[11px]">
                        ({(materialFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 mx-auto text-primary" />
                      <p className="text-xs font-bold text-slate-800">
                        Bấm để chọn tệp PDF đề thi hoặc kéo thả vào đây
                      </p>
                      <p className="text-[10.5px] text-muted">
                        Hỗ trợ .pdf giáo trình, đề thi (tối đa 50MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Accompanying Audio File Dropzone (Optional Child) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Headphones className="w-4 h-4 text-amber-600" />
                    <span>2. Đính kèm tệp Audio bài nghe con (Tùy chọn)</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold">
                    Child Audio Track
                  </span>
                </div>

                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,audio/*"
                  onChange={(e) => handleAudioFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                />

                <div
                  onClick={() => audioFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleAudioFileChange(f);
                  }}
                  className="border border-dashed border-amber-300 hover:border-amber-500 bg-white/80 rounded-xl p-3 text-center transition cursor-pointer"
                >
                  {materialAudioFile ? (
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-2">
                      <div className="flex items-center gap-2 truncate">
                        <Headphones className="w-4 h-4 text-amber-600 shrink-0" />
                        <span className="truncate max-w-[240px]">{materialAudioFile.name}</span>
                        <span className="text-[10.5px] text-slate-500 font-mono">
                          ({(materialAudioFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAudioFileChange(null);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Hủy chọn audio này"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-xs text-amber-800 font-semibold py-1">
                      <Headphones className="w-4 h-4 text-amber-600" />
                      <span>Bấm để đính kèm file bài nghe (.mp3, .wav tối đa 100MB)</span>
                    </div>
                  )}
                </div>

                {materialAudioFile && (
                  <div className="space-y-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Tên tệp âm thanh hiển thị cho học viên
                      </label>
                      <input
                        type="text"
                        value={materialAudioTitle}
                        onChange={(e) => setMaterialAudioTitle(e.target.value)}
                        placeholder="Ví dụ: Cambridge IELTS 1 - Test 1 Listening Section 1-4"
                        className="w-full px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold bg-white"
                      />
                    </div>

                    {localAudioFilePreviewUrl && (
                      <div className="p-2 bg-white rounded-xl border border-amber-200">
                        <p className="text-[10.5px] font-bold text-amber-800 mb-1 flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>Nghe thử audio bài nghe trước khi tải lên:</span>
                        </p>
                        <audio controls src={localAudioFilePreviewUrl} className="w-full h-8" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Material Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề hiển thị cho đề thi / giáo trình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={materialFormData.title}
                  onChange={(e) => setMaterialFormData({ ...materialFormData, title: e.target.value })}
                  placeholder="Ví dụ: Cambridge Practice Tests for IELTS 1 - Test 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold"
                />
              </div>

              {/* 4. Course & Lesson Mapping */}
              <div className="grid grid-cols-2 gap-4">
                <CustomSelect
                  label="Khóa học áp dụng *"
                  value={materialFormData.courseId}
                  onChange={(val) => {
                    setMaterialFormData({ ...materialFormData, courseId: val });
                    setSelectedCourseId(val);
                  }}
                  options={courses.map((c) => ({
                    value: c.id,
                    label: c.title,
                    sublabel: c.category,
                    icon: <GraduationCap className="w-4 h-4 text-primary" />,
                  }))}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Gán vào bài học cụ thể (Tùy chọn)
                  </label>
                  <select
                    value={materialFormData.lessonId}
                    onChange={(e) =>
                      setMaterialFormData({ ...materialFormData, lessonId: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold bg-white"
                  >
                    <option value="">-- Tài liệu chung của khóa --</option>
                    {curriculumModules.map((m) =>
                      m.lessons.map((l) => (
                        <option key={l.id} value={l.id}>
                          {m.title} ➔ {l.title}
                        </option>
                      )),
                    )}
                  </select>
                </div>
              </div>

              {/* Security info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Dynamic Watermark DRM (Họ tên + SĐT + Mã SV)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={materialFormData.isWatermarked}
                    onChange={(e) =>
                      setMaterialFormData({ ...materialFormData, isWatermarked: e.target.checked })
                    }
                    className="rounded text-primary w-4 h-4"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>URL ký số có hiệu lực 15 phút, chống tải trực tiếp và chống quay chụp.</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMaterialModalOpen(false);
                    if (localAudioFilePreviewUrl) {
                      URL.revokeObjectURL(localAudioFilePreviewUrl);
                      setLocalAudioFilePreviewUrl(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUploadingMaterial}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  {isUploadingMaterial && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Tải Lên Đề Thi & Audio Con</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ATTACH AUDIO TO EXISTING MATERIAL                                 */}
      {/* ========================================================================= */}
      {attachToMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-amber-600" />
                  <span>Gắn Tệp Audio Bài Nghe Vào Đề</span>
                </h3>
                <p className="text-[11px] text-muted truncate max-w-xs">
                  Đề thi: <span className="font-bold text-slate-800">{attachToMaterial.title}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setAttachToMaterial(null);
                  setAttachAudioFile(null);
                  setAttachAudioTitle('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAttachAudioSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn tệp âm thanh bài nghe (.mp3, .wav, .m4a) <span className="text-red-500">*</span>
                </label>
                <input
                  ref={attachAudioInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,audio/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setAttachAudioFile(f);
                    if (f && !attachAudioTitle) {
                      setAttachAudioTitle(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="hidden"
                />
                <div
                  onClick={() => attachAudioInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 rounded-2xl p-4 text-center cursor-pointer transition"
                >
                  {attachAudioFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-800">
                      <Headphones className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate max-w-[200px]">{attachAudioFile.name}</span>
                      <span className="text-[11px] text-slate-500">
                        ({(attachAudioFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Headphones className="w-6 h-6 mx-auto text-amber-600" />
                      <p className="text-xs font-bold text-slate-800">Bấm để chọn file Audio bài nghe</p>
                      <p className="text-[10px] text-muted">Hỗ trợ MP3, WAV, M4A tối đa 100MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên phần nghe hiển thị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={attachAudioTitle}
                  onChange={(e) => setAttachAudioTitle(e.target.value)}
                  placeholder="Ví dụ: Section 1 - Conversation between student and advisor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tệp âm thanh con này sẽ xuất hiện trên thanh nghe tích hợp phía trên đề thi PDF.</span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAttachToMaterial(null);
                    setAttachAudioFile(null);
                    setAttachAudioTitle('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAttachAudio || !attachAudioFile}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingAttachAudio && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Gắn Audio Vào Đề</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SECURED MATERIAL PREVIEW (PDF Viewer with Integrated Audio Bar)     */}
      {/* ========================================================================= */}
      {previewMaterial && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm transition-all duration-300 ${
            isFocusMode ? 'p-0' : 'p-3 sm:p-6'
          }`}
        >
          <div
            className={`bg-white flex flex-col shadow-2xl overflow-hidden relative border border-slate-700 transition-all duration-300 ${
              isFocusMode ? 'w-screen h-screen rounded-none' : 'w-full max-w-5xl h-[88vh] rounded-3xl'
            }`}
          >
            {/* Viewer Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center space-x-3 truncate pr-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-sky-400 flex items-center justify-center shrink-0">
                  {previewMaterial.type === 'PDF' ? (
                    <FileText className="w-4 h-4 text-red-400" />
                  ) : (
                    <Headphones className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="truncate">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate flex items-center gap-2">
                    <span>{previewMaterial.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                        previewMaterial.type === 'AUDIO'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {previewMaterial.type === 'AUDIO' ? 'ÂM THANH AUDIO' : 'TÀI LIỆU PDF'}
                    </span>
                    {signedUrlData?.audios && signedUrlData.audios.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
                        <Headphones className="w-3 h-3" />
                        <span>Kèm {signedUrlData.audios.length} Audio con</span>
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Dynamic Watermark DRM</span>
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{previewMaterial.courseTitle}</span>
                    <span>•</span>
                    <span>Signed URL: 15 phút</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  title={isFocusMode ? 'Thu nhỏ' : 'Toàn màn hình'}
                >
                  {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isFocusMode ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewMaterial(null);
                    setSignedUrlData(null);
                    setIsFocusMode(false);
                    setIsIntegratedAudioPlaying(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Đóng trình xem"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Stage */}
            <div className="flex-1 relative bg-slate-100 overflow-hidden flex flex-col items-center justify-center select-none">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs font-semibold">Đang nạp học liệu qua Signed URL 15 phút...</p>
                </div>
              ) : previewMaterial.type === 'PDF' && signedUrlData?.signedUrl ? (
                <div className="w-full h-full relative flex flex-col">
                  {/* Sticky Audio Player Bar on Top of PDF if Audios Exist */}
                  {signedUrlData.audios && signedUrlData.audios.length > 0 && (
                    <div className="w-full bg-slate-900 border-b border-slate-700/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-white z-20 shadow-md">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                          <Headphones className="w-4 h-4" />
                        </span>
                        {signedUrlData.audios.length > 1 ? (
                          <select
                            value={activeAudioTrackIndex}
                            onChange={(e) => {
                              setActiveAudioTrackIndex(Number(e.target.value));
                              setIsIntegratedAudioPlaying(false);
                            }}
                            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 font-semibold max-w-[220px] truncate"
                          >
                            {signedUrlData.audios.map((track, idx) => (
                              <option key={track.id} value={idx}>
                                {track.title || `Track Audio 0${idx + 1}`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="truncate max-w-[240px]">
                            <p className="text-xs font-bold text-slate-100 truncate">
                              {signedUrlData.audios[0]?.title || 'Audio Đề Thi'}
                            </p>
                            <span className="text-[10px] text-amber-400 font-semibold">Tệp âm thanh con đi kèm đề thi</span>
                          </div>
                        )}
                      </div>

                      {/* Integrated Audio Controls */}
                      <div className="flex items-center gap-3 flex-1 max-w-md justify-center">
                        <button
                          type="button"
                          onClick={togglePlayIntegratedAudio}
                          className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow transition cursor-pointer shrink-0"
                          title={isIntegratedAudioPlaying ? 'Tạm dừng' : 'Phát bài nghe'}
                        >
                          {isIntegratedAudioPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>

                        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatAudioTime(integratedAudioTime)}
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={integratedAudioDuration || 100}
                            value={integratedAudioTime}
                            onChange={(e) => handleSeekIntegratedAudio(Number(e.target.value))}
                            className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatAudioTime(integratedAudioDuration)}
                          </span>
                        </div>
                      </div>

                      {/* Speed switchers */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">Tốc độ:</span>
                        {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                          <button
                            key={speed}
                            type="button"
                            onClick={() => handleSetAudioSpeed(speed)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold transition cursor-pointer ${
                              audioPlaybackRate === speed
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>

                      <audio
                        ref={integratedAudioRef}
                        key={signedUrlData.audios[activeAudioTrackIndex]?.id || 'audio-track'}
                        src={getFullStreamUrl(signedUrlData.audios[activeAudioTrackIndex]?.signedUrl)}
                        onTimeUpdate={() => {
                          if (integratedAudioRef.current) {
                            setIntegratedAudioTime(integratedAudioRef.current.currentTime);
                          }
                        }}
                        onLoadedMetadata={() => {
                          if (integratedAudioRef.current) {
                            setIntegratedAudioDuration(integratedAudioRef.current.duration);
                            integratedAudioRef.current.playbackRate = audioPlaybackRate;
                          }
                        }}
                        onEnded={() => setIsIntegratedAudioPlaying(false)}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* PDF Document Stage */}
                  <div className="flex-1 w-full h-full relative">
                    <iframe
                      src={`${getFullStreamUrl(signedUrlData.signedUrl)}#toolbar=0&navpanes=0&scrollbar=1`}
                      className="w-full h-full border-none"
                      title={previewMaterial.title}
                    />
                    <DynamicWatermarkCanvas
                      studentName={signedUrlData?.watermark?.fullName || user?.fullName || 'Quản Trị Viên Teacher Dong'}
                      studentPhone={signedUrlData?.watermark?.phone || user?.phone || '098***321'}
                      studentId={signedUrlData?.watermark?.userId || user?.id || 'ADMIN-ROOT'}
                    />
                  </div>
                </div>
              ) : previewMaterial.type === 'AUDIO' && signedUrlData?.signedUrl ? (
                <div className="w-full h-full relative flex flex-col items-center justify-center p-6 sm:p-10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white space-y-6">
                  {/* Visualizer / Vinyl graphic */}
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/10 animate-pulse">
                      <Headphones className="w-14 h-14 text-amber-400" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                      IELTS Audio
                    </div>
                  </div>

                  {/* Audio info */}
                  <div className="text-center space-y-1.5 max-w-lg">
                    <h4 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
                      {previewMaterial.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Tệp âm thanh chuẩn hóa giảng dạy IELTS Audio & Speaking Studio • Phát an toàn qua Token Ký Số 15 phút.
                    </p>
                  </div>

                  {/* Player controls box */}
                  <div className="w-full max-w-lg p-5 rounded-3xl bg-slate-800/90 border border-slate-700/80 shadow-2xl space-y-3.5 backdrop-blur">
                    <audio
                      ref={audioPlayerRef}
                      controls
                      autoPlay
                      src={getFullStreamUrl(signedUrlData.signedUrl)}
                      className="w-full h-11 rounded-xl"
                    />

                    {/* Playback speed switcher */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tốc độ phát bài nghe:</span>
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                          <button
                            key={speed}
                            type="button"
                            onClick={() => handleSetAudioSpeed(speed)}
                            className={`px-2 py-1 rounded-lg text-[10.5px] font-extrabold transition ${
                              audioPlaybackRate === speed
                                ? 'bg-amber-500 text-slate-950 shadow-sm'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Watermark Canvas Protection */}
                  <DynamicWatermarkCanvas
                    studentName={signedUrlData?.watermark?.fullName || user?.fullName || 'Quản Trị Viên Teacher Dong'}
                    studentPhone={signedUrlData?.watermark?.phone || user?.phone || '098***321'}
                    studentId={signedUrlData?.watermark?.userId || user?.id || 'ADMIN-ROOT'}
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <p className="text-xs font-bold text-red-500">Không thể kết nối đến máy chủ phát học liệu.</p>
                  <p className="text-[11px] text-slate-400">Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.</p>
                </div>
              )}
            </div>

            {/* Viewer Footer */}
            <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <span className="flex items-center space-x-1.5 text-amber-400/90 font-medium text-center sm:text-left">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Chế độ kiểm duyệt học liệu của Quản trị viên • Tự động đóng dấu Watermark DRM theo tài khoản {user?.fullName || 'Admin'}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreviewMaterial(null);
                  setSignedUrlData(null);
                  setIsFocusMode(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Đóng Trình Xem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: MANUAL ENROLL (#manualEnrollModal)                               */}
      {/* ========================================================================= */}
      {isManualEnrollOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-line p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Ghi Danh Học Viên Thủ Công</span>
              </h3>
              <button
                onClick={() => setIsManualEnrollOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualEnrollSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Học Viên (Tài khoản đã tạo) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={manualEnrollForm.userId}
                  onChange={(e) =>
                    setManualEnrollForm({ ...manualEnrollForm, userId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold bg-white"
                >
                  <option value="">-- Chọn học viên --</option>
                  {studentsList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName || st.email} ({st.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn Khóa Học Ghi Danh <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={manualEnrollForm.courseId}
                  onChange={(e) =>
                    setManualEnrollForm({ ...manualEnrollForm, courseId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold bg-white"
                >
                  <option value="">-- Chọn khóa học --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
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
                  value={manualEnrollForm.note}
                  onChange={(e) =>
                    setManualEnrollForm({ ...manualEnrollForm, note: e.target.value })
                  }
                  placeholder="Ví dụ: Chuyển khoản trực tiếp tại trung tâm / Học bổng"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsManualEnrollOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  {isSubmittingManual && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Kích Hoạt Ghi Danh</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
