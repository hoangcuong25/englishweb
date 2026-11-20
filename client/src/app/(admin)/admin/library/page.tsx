'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  materialsService,
  SignedUrlResponse,
  AttachedAudioTrack,
} from '@/services/materials.service';
import { coursesService, Course } from '@/services/courses.service';
import CustomSelect from '@/components/ui/custom-select';
import { toast } from '@/components/ui/toast';
import { handleApiError } from '@/lib/api-error';
import { useAuth } from '@/lib/auth-context';
import DynamicWatermarkCanvas from '@/components/shared/dynamic-watermark-canvas';
import {
  Upload,
  CheckCircle2,
  Trash2,
  X,
  FileText,
  Music,
  GraduationCap,
  Filter,
  Eye,
  ShieldCheck,
  Lock,
  Maximize2,
  Minimize2,
  RefreshCw,
  Play,
  Headphones,
  Volume2,
  Clock,
  Plus,
  ChevronDown,
  ChevronUp,
  Paperclip,
  FolderOpen,
} from 'lucide-react';

interface ChildAudioItem {
  id: string;
  title: string;
  type?: string;
  fileKey?: string;
  fileSize?: number;
  durationSeconds?: number;
  createdAt?: string;
}

interface MaterialItem {
  id: string;
  title: string;
  fileType: 'PDF' | 'AUDIO_MP3';
  fileSize: string;
  courseId: string;
  courseTitle: string;
  isSignedUrl: boolean;
  isWatermark: boolean;
  uploadDate: string;
  children: ChildAudioItem[];
}

interface RawMaterial {
  id: string;
  title: string;
  type?: string;
  fileSize?: number;
  courseId?: string;
  course?: { id?: string; title?: string };
  isWatermarked?: boolean;
  createdAt?: string;
  lesson?: { module?: { course?: { id?: string; title?: string } } };
  children?: ChildAudioItem[];
}

export default function AdminLibraryPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [notice, setNotice] = useState('');
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({});

  // 1. Add Exam & Audio Modal State (#materialModal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    audioTitle: '',
    courseId: '',
    isSignedUrl: true,
    isWatermark: true,
  });

  // 2. Attach Audio to Existing Material Modal State
  const [attachAudioMaterial, setAttachAudioMaterial] = useState<MaterialItem | null>(null);
  const attachAudioInputRef = useRef<HTMLInputElement>(null);
  const [attachAudioFile, setAttachAudioFile] = useState<File | null>(null);
  const [attachLocalAudioUrl, setAttachLocalAudioUrl] = useState<string | null>(null);
  const [attachAudioTitle, setAttachAudioTitle] = useState('');
  const [isSubmittingAttach, setIsSubmittingAttach] = useState(false);

  // 3. Integrated Preview State (PDF Viewer with Attached Audio Player)
  const [previewMaterial, setPreviewMaterial] = useState<MaterialItem | null>(null);
  const [signedUrlData, setSignedUrlData] = useState<SignedUrlResponse | null>(null);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<AttachedAudioTrack | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [audioPlaybackRate, setAudioPlaybackRate] = useState<number>(1);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const getFullStreamUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const origin = apiBase.replace(/\/api\/?$/, '');
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const toggleRowExpand = (id: string) => {
    setExpandedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSetAudioSpeed = (rate: number) => {
    setAudioPlaybackRate(rate);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = rate;
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await materialsService.getAll();
      if (res && Array.isArray(res.items)) {
        const mapped: MaterialItem[] = (res.items as unknown as RawMaterial[]).map((m: RawMaterial) => ({
          id: m.id,
          title: m.title,
          fileType: m.type === 'AUDIO' ? 'AUDIO_MP3' : 'PDF',
          fileSize: m.fileSize ? `${(m.fileSize / (1024 * 1024)).toFixed(1)} MB` : '8.9 MB',
          courseId: m.courseId || m.course?.id || m.lesson?.module?.course?.id || '',
          courseTitle: m.course?.title || m.lesson?.module?.course?.title || 'Tài liệu chung',
          isSignedUrl: true,
          isWatermark: m.isWatermarked !== false,
          uploadDate: m.createdAt ? new Date(m.createdAt).toLocaleDateString('vi-VN') : '20/11/2026',
          children: Array.isArray(m.children) ? m.children : [],
        }));
        setMaterials(mapped);
      }
    } catch (err) {
      console.error('Error fetching materials from API:', err);
    }
  };

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const list = await coursesService.getCourses();
        if (Array.isArray(list)) {
          setCourses(list);
          if (list.length > 0) {
            setFormData((prev) => ({
              ...prev,
              courseId: prev.courseId || list[0].id,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load courses for library:', err);
      }
    };
    loadCourses();
    fetchMaterials();
  }, []);

  const handleOpenPreview = async (m: MaterialItem, defaultAudioTrackId?: string) => {
    setPreviewMaterial(m);
    setLoadingPreview(true);
    setAudioPlaybackRate(1);
    setSelectedAudioTrack(null);
    try {
      const res = await materialsService.getSignedUrl(m.id);
      setSignedUrlData(res);
      if (res.audios && res.audios.length > 0) {
        if (defaultAudioTrackId) {
          const match = res.audios.find((a) => a.id === defaultAudioTrackId);
          setSelectedAudioTrack(match || res.audios[0]);
        } else {
          setSelectedAudioTrack(res.audios[0]);
        }
      }
    } catch (err) {
      handleApiError(err, 'Lỗi khi tạo liên kết xem trước học liệu');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePdfChange = (file: File | null) => {
    setSelectedPdfFile(file);
    if (file && !formData.title.trim()) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      setFormData((prev) => ({
        ...prev,
        title: cleanTitle,
        audioTitle: prev.audioTitle || `${cleanTitle} - Audio Bài Nghe`,
      }));
    }
  };

  const handleAudioChange = (file: File | null) => {
    if (!file) {
      setSelectedAudioFile(null);
      if (localAudioUrl) {
        URL.revokeObjectURL(localAudioUrl);
        setLocalAudioUrl(null);
      }
      return;
    }
    setSelectedAudioFile(file);
    if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    setLocalAudioUrl(URL.createObjectURL(file));

    if (!formData.audioTitle.trim()) {
      const cleanAudio = file.name.replace(/\.[^/.]+$/, '');
      setFormData((prev) => ({
        ...prev,
        audioTitle: cleanAudio,
      }));
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPdfFile && !selectedAudioFile) {
      toast.error('Vui lòng chọn tệp PDF đề thi (hoặc kèm file Audio bài nghe)!');
      return;
    }
    if (!formData.courseId) {
      toast.error('Vui lòng chọn khóa học để gán đề thi này!');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      if (selectedPdfFile) {
        fd.append('file', selectedPdfFile);
      }
      if (selectedAudioFile) {
        fd.append('audio', selectedAudioFile);
        fd.append(
          'audioTitle',
          formData.audioTitle.trim() ||
            `${formData.title.trim() || selectedPdfFile?.name || 'Đề thi'} - Audio Bài Nghe`,
        );
      }
      fd.append(
        'title',
        formData.title.trim() ||
          selectedPdfFile?.name ||
          selectedAudioFile?.name ||
          'Đề thi mới',
      );
      fd.append('courseId', formData.courseId);
      fd.append('isPrivate', String(formData.isSignedUrl));
      fd.append('isWatermarked', String(formData.isWatermark));

      await materialsService.uploadWithFile(fd);
      await fetchMaterials();
      setIsModalOpen(false);
      setSelectedPdfFile(null);
      setSelectedAudioFile(null);
      if (localAudioUrl) {
        URL.revokeObjectURL(localAudioUrl);
        setLocalAudioUrl(null);
      }
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      if (audioInputRef.current) audioInputRef.current.value = '';
      toast.success(
        `Đã tải lên đề thi "${formData.title || selectedPdfFile?.name}" ${
          selectedAudioFile ? 'kèm Audio bài nghe' : ''
        } thành công!`,
      );
    } catch (err) {
      handleApiError(err, 'Lỗi khi tải lên học liệu số');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAttachAudio = (m: MaterialItem) => {
    setAttachAudioMaterial(m);
    setAttachAudioFile(null);
    if (attachLocalAudioUrl) {
      URL.revokeObjectURL(attachLocalAudioUrl);
      setAttachLocalAudioUrl(null);
    }
    setAttachAudioTitle(`${m.title} - Audio Bài Nghe (Section 1)`);
  };

  const handleAttachAudioFileChange = (file: File | null) => {
    if (!file) {
      setAttachAudioFile(null);
      if (attachLocalAudioUrl) {
        URL.revokeObjectURL(attachLocalAudioUrl);
        setAttachLocalAudioUrl(null);
      }
      return;
    }
    setAttachAudioFile(file);
    if (attachLocalAudioUrl) URL.revokeObjectURL(attachLocalAudioUrl);
    setAttachLocalAudioUrl(URL.createObjectURL(file));

    if (!attachAudioTitle.trim() || attachAudioTitle.includes('- Audio Bài Nghe')) {
      const clean = file.name.replace(/\.[^/.]+$/, '');
      setAttachAudioTitle(`${attachAudioMaterial?.title || 'Đề thi'} - ${clean}`);
    }
  };

  const handleAttachAudioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachAudioMaterial) return;
    if (!attachAudioFile) {
      toast.error('Vui lòng chọn tệp âm thanh Audio (.mp3, .wav) để gắn vào đề thi!');
      return;
    }

    setIsSubmittingAttach(true);
    try {
      const fd = new FormData();
      fd.append('audio', attachAudioFile);
      fd.append(
        'title',
        attachAudioTitle.trim() || attachAudioFile.name.replace(/\.[^/.]+$/, ''),
      );
      fd.append('courseId', attachAudioMaterial.courseId);
      fd.append('isPrivate', 'true');
      fd.append('isWatermarked', 'true');

      await materialsService.attachAudio(attachAudioMaterial.id, fd);
      await fetchMaterials();
      setAttachAudioMaterial(null);
      setAttachAudioFile(null);
      if (attachLocalAudioUrl) {
        URL.revokeObjectURL(attachLocalAudioUrl);
        setAttachLocalAudioUrl(null);
      }
      toast.success(
        `Đã gắn thêm tệp Audio vào đề thi "${attachAudioMaterial.title}" thành công!`,
      );
    } catch (err) {
      handleApiError(err, 'Lỗi khi gắn tệp âm thanh vào đề thi');
    } finally {
      setIsSubmittingAttach(false);
    }
  };

  const handleDeleteMaterial = async (matId: string, title?: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tệp "${title || 'học liệu này'}"?`)) return;
    try {
      await materialsService.delete(matId);
      await fetchMaterials();
      setNotice('Đã xóa học liệu thành công.');
    } catch (err) {
      handleApiError(err, 'Lỗi khi xóa học liệu');
    }
    setTimeout(() => setNotice(''), 3000);
  };

  const filteredMaterials = materials.filter((m) => {
    if (selectedCourseFilter === 'ALL') return true;
    return m.courseId === selectedCourseFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Quản Lý Học Liệu & Đề Thi Số (IELTS Exam & Materials)</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Mỗi đề thi bao gồm tài liệu đề (PDF) và các tệp âm thanh bài nghe (Audio) đi kèm trực thuộc đề đó.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPdfFile(null);
            setSelectedAudioFile(null);
            if (localAudioUrl) {
              URL.revokeObjectURL(localAudioUrl);
              setLocalAudioUrl(null);
            }
            if (courses.length > 0 && !formData.courseId) {
              setFormData((prev) => ({ ...prev, courseId: courses[0].id }));
            }
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition flex items-center space-x-2 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>+ Tải Lên Đề Thi Kèm Audio</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Danh Sách Đề Thi & Giáo Trình Bảo Mật ({filteredMaterials.length})
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Khóa học:</span>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-line text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-primary shadow-sm"
            >
              <option value="ALL">Tất cả khóa học</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-line text-slate-500 font-bold">
              <tr>
                <th className="py-3 px-4">Tên Đề Thi / Học Liệu</th>
                <th className="py-3 px-4">Định Dạng</th>
                <th className="py-3 px-4">Audio Đi Kèm</th>
                <th className="py-3 px-4">Dung Lượng</th>
                <th className="py-3 px-4">Khóa Học Áp Dụng</th>
                <th className="py-3 px-4">Bảo Mật DRM</th>
                <th className="py-3 px-4">Ngày Upload</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    Chưa có đề thi hoặc học liệu nào. Bấm &quot;+ Tải Lên Đề Thi Kèm Audio&quot; để thêm đề thi đầu tiên.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((m) => {
                  const hasAudios = m.children && m.children.length > 0;
                  const isExpanded = !!expandedRowIds[m.id];
                  return (
                    <React.Fragment key={m.id}>
                      <tr className="hover:bg-slate-50/50 transition group">
                        {/* Title */}
                        <td className="py-3.5 px-4 font-bold text-slate-800 max-w-sm">
                          <div className="flex items-center space-x-2.5">
                            <span className="p-1.5 rounded-xl bg-red-100 text-red-600 shrink-0 shadow-2xs">
                              <FileText className="w-4 h-4" />
                            </span>
                            <div className="truncate">
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(m)}
                                className="text-left font-bold text-slate-900 hover:text-primary transition truncate block cursor-pointer"
                                title="Bấm để xem đề thi PDF và nghe Audio đi kèm"
                              >
                                {m.title}
                              </button>
                              {hasAudios && (
                                <button
                                  type="button"
                                  onClick={() => toggleRowExpand(m.id)}
                                  className="text-[10.5px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-0.5 cursor-pointer"
                                >
                                  <span>{m.children.length} file âm thanh bài nghe</span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Format */}
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-100 text-red-700 w-fit inline-block">
                            PDF
                          </span>
                        </td>

                        {/* Child Audio Badge */}
                        <td className="py-3.5 px-4">
                          {hasAudios ? (
                            <button
                              type="button"
                              onClick={() => toggleRowExpand(m.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-[10.5px] hover:bg-amber-100 transition cursor-pointer"
                            >
                              <Headphones className="w-3 h-3 text-amber-600" />
                              <span>{m.children.length} Audio con</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3 text-amber-600" />
                              ) : (
                                <ChevronDown className="w-3 h-3 text-amber-600" />
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAttachAudio(m)}
                              className="text-[11px] font-bold text-slate-400 hover:text-amber-600 flex items-center gap-1 transition cursor-pointer"
                              title="Gắn tệp âm thanh bài nghe vào đề thi này"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ Gắn Audio</span>
                            </button>
                          )}
                        </td>

                        {/* File Size */}
                        <td className="py-3.5 px-4 font-mono text-muted">{m.fileSize}</td>

                        {/* Course */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <span
                            className="font-semibold text-primary bg-sky-50 px-2.5 py-1 rounded-lg text-[11px] truncate block max-w-[180px]"
                            title={m.courseTitle}
                          >
                            {m.courseTitle}
                          </span>
                        </td>

                        {/* Security */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                              Signed 15m
                            </span>
                            <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded bg-sky-100 text-primary">
                              DRM Watermark
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-muted">{m.uploadDate}</td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenPreview(m)}
                              className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
                              title="Mở đề thi PDF và nghe bài nghe đính kèm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem Đề & Nghe Audio</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenAttachAudio(m)}
                              className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer border border-amber-200"
                              title="Gắn thêm bài nghe Audio vào đề này"
                            >
                              <Headphones className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMaterial(m.id, m.title)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                              title="Xóa đề thi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Sub-Row: Attached Audio Tracks */}
                      {hasAudios && isExpanded && (
                        <tr className="bg-amber-50/30 border-y border-amber-100">
                          <td colSpan={8} className="py-3 px-6">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <Headphones className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Các Tệp Âm Thanh Bài Nghe Con Trực Thuộc Đề Thi Này:</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAttachAudio(m)}
                                  className="text-[10.5px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Gắn thêm Section / File Audio khác</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {m.children.map((child, cIdx) => (
                                  <div
                                    key={child.id}
                                    className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between text-xs shadow-2xs hover:border-amber-400 transition"
                                  >
                                    <div className="flex items-center space-x-2 truncate pr-2">
                                      <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-black text-[10px] flex items-center justify-center shrink-0">
                                        #{cIdx + 1}
                                      </span>
                                      <div className="truncate">
                                        <p className="font-bold text-slate-800 truncate" title={child.title}>
                                          {child.title}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                          {child.fileSize
                                            ? `${(child.fileSize / (1024 * 1024)).toFixed(2)} MB`
                                            : 'Audio bài thi'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenPreview(m, child.id)}
                                        className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10.5px] flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                        title="Phát bài nghe này cùng đề thi"
                                      >
                                        <Play className="w-2.5 h-2.5 fill-current" />
                                        <span>Nghe</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteMaterial(child.id, child.title)}
                                        className="p-1 text-slate-300 hover:text-red-500 transition cursor-pointer"
                                        title="Xóa bài nghe này"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TẢI LÊN ĐỀ THI PDF & AUDIO ĐI KÈM TRONG CÙNG 1 FORM              */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  <span>Tải Lên Đề Thi Kèm Audio Bài Nghe</span>
                </h3>
                <p className="text-[11px] text-muted">
                  Thêm đề thi PDF (Cambridge, Mock Test) và tệp Audio đi kèm cùng lúc trong 1 đề thi.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (localAudioUrl) {
                    URL.revokeObjectURL(localAudioUrl);
                    setLocalAudioUrl(null);
                  }
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMaterial} className="space-y-4">
              {/* Exam Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên đề thi / giáo trình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Cambridge Practice Tests for IELTS 1 - Test 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary font-bold text-slate-800"
                />
              </div>

              {/* Course Selection */}
              <CustomSelect
                label="Khóa học áp dụng *"
                value={formData.courseId}
                onChange={(val) => setFormData({ ...formData, courseId: val })}
                options={
                  courses.length > 0
                    ? courses.map((c) => ({
                        value: c.id,
                        label: c.title,
                        sublabel: c.category ? `Danh mục: ${c.category}` : 'Khóa học',
                        icon: <GraduationCap className="w-4 h-4 text-primary" />,
                        badge: c.category || 'ACTIVE',
                      }))
                    : [
                        {
                          value: '',
                          label: 'Chưa có khóa học nào',
                          sublabel: 'Vui lòng tạo khóa học trước',
                          icon: <GraduationCap className="w-4 h-4 text-slate-400" />,
                        },
                      ]
                }
              />

              {/* 1. PDF File Input (Test Paper) */}
              <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2">
                <label className="block text-xs font-black text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-red-600">
                    <FileText className="w-4 h-4" />
                    <span>1. Tệp Đề Thi / Giáo Trình Chính (PDF) *</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Tối đa 50MB</span>
                </label>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => handlePdfChange(e.target.files?.[0] || null)}
                />

                {!selectedPdfFile ? (
                  <div
                    onClick={() => pdfInputRef.current?.click()}
                    className="border-2 border-dashed border-sky-300 hover:border-primary bg-white rounded-xl p-4 text-center cursor-pointer transition group"
                  >
                    <Upload className="w-6 h-6 mx-auto text-primary group-hover:scale-110 transition-transform mb-1" />
                    <p className="text-xs font-bold text-slate-700">
                      Bấm để chọn tệp PDF đề thi hoặc kéo thả vào đây
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-sky-200">
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <FileText className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{selectedPdfFile.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {(selectedPdfFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPdfFile(null);
                        if (pdfInputRef.current) pdfInputRef.current.value = '';
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* 2. Audio File Input (Child Listening Track) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-2">
                <label className="block text-xs font-black text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <Headphones className="w-4 h-4" />
                    <span>2. Tệp Âm Thanh Audio Bài Nghe Đi Kèm (Tùy chọn)</span>
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold">Hỗ trợ .mp3, .wav (100MB)</span>
                </label>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,audio/*"
                  className="hidden"
                  onChange={(e) => handleAudioChange(e.target.files?.[0] || null)}
                />

                {!selectedAudioFile ? (
                  <div
                    onClick={() => audioInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-white rounded-xl p-4 text-center cursor-pointer transition group"
                  >
                    <Headphones className="w-6 h-6 mx-auto text-amber-500 group-hover:scale-110 transition-transform mb-1" />
                    <p className="text-xs font-bold text-slate-700">
                      Bấm để chọn tệp Audio bài nghe (MP3/WAV) đi kèm đề này
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 bg-white p-3 rounded-xl border border-amber-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <Headphones className="w-5 h-5 text-amber-500 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">{selectedAudioFile.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {(selectedAudioFile.size / (1024 * 1024)).toFixed(2)} MB • Sẵn sàng tải lên
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAudioFile(null);
                          if (localAudioUrl) {
                            URL.revokeObjectURL(localAudioUrl);
                            setLocalAudioUrl(null);
                          }
                          if (audioInputRef.current) audioInputRef.current.value = '';
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Mini Audio Preview */}
                    {localAudioUrl && (
                      <div className="pt-1 border-t border-slate-100">
                        <p className="text-[10px] text-amber-800 font-bold mb-1 flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>Nghe thử bài nghe trước khi tải lên:</span>
                        </p>
                        <audio controls src={localAudioUrl} className="w-full h-8" />
                      </div>
                    )}

                    {/* Audio track title */}
                    <div>
                      <label className="block text-[10.5px] font-bold text-slate-600 mb-0.5">
                        Tên hiển thị cho bài nghe:
                      </label>
                      <input
                        type="text"
                        value={formData.audioTitle}
                        onChange={(e) => setFormData({ ...formData, audioTitle: e.target.value })}
                        placeholder="Ví dụ: Test 1 Listening Section 1-4"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-line text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Security Policy */}
              <div className="p-3 rounded-xl bg-slate-50 border border-line space-y-1 text-xs text-slate-600">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>Bảo mật Signed URL 15 phút & Phủ Dynamic Watermark DRM chống leak</span>
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    if (localAudioUrl) {
                      URL.revokeObjectURL(localAudioUrl);
                      setLocalAudioUrl(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-line hover:bg-slate-50 text-slate-600 font-bold text-xs transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!selectedPdfFile && !selectedAudioFile)}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tải lên đề thi...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Tải Lên Đề Thi & Audio Đi Kèm</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GẮN THÊM AUDIO VÀO ĐỀ THI CÓ SẴN (#attachAudioModal)             */}
      {/* ========================================================================= */}
      {attachAudioMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-line p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Headphones className="w-5 h-5 text-amber-500" />
                  <span>Gắn Tệp Audio Bài Nghe Vào Đề Thi</span>
                </h3>
                <p className="text-[11px] text-muted truncate max-w-sm">
                  Đề thi: <span className="font-bold text-slate-800">{attachAudioMaterial.title}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setAttachAudioMaterial(null);
                  if (attachLocalAudioUrl) {
                    URL.revokeObjectURL(attachLocalAudioUrl);
                    setAttachLocalAudioUrl(null);
                  }
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAttachAudioSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chọn tệp âm thanh Audio bài nghe (.mp3, .wav) <span className="text-red-500">*</span>
                </label>
                <input
                  ref={attachAudioInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,audio/*"
                  className="hidden"
                  onChange={(e) => handleAttachAudioFileChange(e.target.files?.[0] || null)}
                />

                {!attachAudioFile ? (
                  <div
                    onClick={() => attachAudioInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/30 hover:bg-amber-50 rounded-2xl p-5 text-center cursor-pointer transition"
                  >
                    <Headphones className="w-8 h-8 mx-auto text-amber-500 mb-1" />
                    <p className="text-xs font-bold text-slate-800">
                      Bấm để chọn tệp âm thanh Audio cho đề thi này
                    </p>
                    <p className="text-[10.5px] text-muted mt-0.5">
                      Hỗ trợ MP3, WAV, M4A bài thi IELTS Listening (tối đa 100MB)
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 overflow-hidden">
                        <Headphones className="w-5 h-5 text-amber-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">{attachAudioFile.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {(attachAudioFile.size / (1024 * 1024)).toFixed(2)} MB • Sẵn sàng gắn vào đề
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachAudioFile(null);
                          if (attachLocalAudioUrl) {
                            URL.revokeObjectURL(attachLocalAudioUrl);
                            setAttachLocalAudioUrl(null);
                          }
                          if (attachAudioInputRef.current) attachAudioInputRef.current.value = '';
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {attachLocalAudioUrl && (
                      <div className="pt-2 border-t border-amber-200">
                        <p className="text-[10px] text-amber-800 font-bold mb-1 flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>Nghe thử trước khi gắn vào đề:</span>
                        </p>
                        <audio controls src={attachLocalAudioUrl} className="w-full h-8" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề phần nghe (Audio Section) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={attachAudioTitle}
                  onChange={(e) => setAttachAudioTitle(e.target.value)}
                  placeholder="Ví dụ: Cambridge IELTS 1 - Test 1 Listening Section 1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setAttachAudioMaterial(null);
                    if (attachLocalAudioUrl) {
                      URL.revokeObjectURL(attachLocalAudioUrl);
                      setAttachLocalAudioUrl(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl border border-line hover:bg-slate-50 text-slate-600 font-bold text-xs transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAttach || !attachAudioFile}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingAttach ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang gắn audio...</span>
                    </>
                  ) : (
                    <>
                      <Headphones className="w-4 h-4" />
                      <span>Gắn Audio Vào Đề Thi Này</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TRÌNH XEM ĐỀ THI TÍCH HỢP (PDF VIEWER + AUDIO PLAYER BAR)         */}
      {/* ========================================================================= */}
      {previewMaterial && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm transition-all duration-300 ${
            isFocusMode ? 'p-0' : 'p-2 sm:p-5'
          }`}
        >
          <div
            className={`bg-white flex flex-col shadow-2xl overflow-hidden relative border border-slate-700 transition-all duration-300 ${
              isFocusMode ? 'w-screen h-screen rounded-none' : 'w-full max-w-6xl h-[92vh] rounded-3xl'
            }`}
          >
            {/* Top Bar: Title & Controls */}
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center space-x-3 truncate pr-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-sky-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-red-400" />
                </div>
                <div className="truncate">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate flex items-center gap-2">
                    <span>{previewMaterial.title}</span>
                    {signedUrlData?.audios && signedUrlData.audios.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-amber-500 text-slate-950 shadow-2xs">
                        {signedUrlData.audios.length} Audio Bài Nghe
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
                    setSelectedAudioTrack(null);
                    setIsFocusMode(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  title="Đóng trình xem"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* INTEGRATED AUDIO PLAYER BAR (DOCKED AT THE TOP OF THE PDF VIEWER) */}
            {signedUrlData?.audios && signedUrlData.audios.length > 0 && (
              <div className="bg-slate-950 border-b border-slate-800 px-5 py-3 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                {/* Track Selector */}
                <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                  <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                    <Headphones className="w-4 h-4" />
                  </span>
                  <div className="truncate">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Bài Nghe Trực Thuộc Đề Thi
                    </p>
                    <select
                      value={selectedAudioTrack?.id || signedUrlData.audios[0].id}
                      onChange={(e) => {
                        const target = signedUrlData.audios?.find((a) => a.id === e.target.value);
                        if (target) setSelectedAudioTrack(target);
                      }}
                      className="text-xs font-bold bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400 max-w-[280px]"
                    >
                      {signedUrlData.audios.map((a, aIdx) => (
                        <option key={a.id} value={a.id}>
                          #{aIdx + 1}: {a.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <audio
                    key={selectedAudioTrack?.signedUrl}
                    ref={audioPlayerRef}
                    controls
                    autoPlay
                    src={getFullStreamUrl(selectedAudioTrack?.signedUrl || signedUrlData.audios[0].signedUrl)}
                    className="h-9 w-full sm:w-64 md:w-80"
                  />

                  {/* Playback Speed Switcher */}
                  <div className="hidden md:flex items-center space-x-1 pl-2 border-l border-slate-800">
                    {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => handleSetAudioSpeed(speed)}
                        className={`px-2 py-0.5 rounded text-[10px] font-black transition ${
                          audioPlaybackRate === speed
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Center Stage: PDF Viewer with Dynamic Watermark DRM */}
            <div className="flex-1 relative bg-slate-100 overflow-hidden flex items-center justify-center select-none">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs font-semibold">Đang nạp đề thi qua Signed URL 15 phút...</p>
                </div>
              ) : signedUrlData?.signedUrl ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={`${getFullStreamUrl(signedUrlData.signedUrl)}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-none"
                    title={previewMaterial.title}
                  />
                  <DynamicWatermarkCanvas
                    studentName={
                      signedUrlData?.watermark?.fullName ||
                      signedUrlData?.watermark?.studentName ||
                      user?.fullName ||
                      'Quản Trị Viên Teacher Dong'
                    }
                    studentPhone={
                      signedUrlData?.watermark?.phone ||
                      signedUrlData?.watermark?.maskedPhone ||
                      user?.phone ||
                      '098***321'
                    }
                    studentId={
                      signedUrlData?.watermark?.userId ||
                      signedUrlData?.watermark?.studentCode ||
                      user?.id ||
                      'ADMIN-ROOT'
                    }
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  Không thể nạp đề thi này. Vui lòng thử lại.
                </div>
              )}
            </div>

            {/* Viewer Footer */}
            <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <span className="flex items-center space-x-1.5 text-amber-400/90 font-medium text-center sm:text-left">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Đang xem đề thi tích hợp âm thanh bài nghe • Dynamic Watermark DRM tự động hiển thị theo tài khoản {user?.fullName || 'Admin'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreviewMaterial(null);
                  setSignedUrlData(null);
                  setSelectedAudioTrack(null);
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
    </div>
  );
}
