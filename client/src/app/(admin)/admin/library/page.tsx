'use client';

import React, { useState, useEffect, useRef } from 'react';
import { materialsService, SignedUrlResponse } from '@/services/materials.service';
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
} from 'lucide-react';

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
}

export default function AdminLibraryPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // Preview State
  const [previewMaterial, setPreviewMaterial] = useState<MaterialItem | null>(null);
  const [signedUrlData, setSignedUrlData] = useState<SignedUrlResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const handleOpenPreview = async (m: MaterialItem) => {
    setPreviewMaterial(m);
    setLoadingPreview(true);
    try {
      const res = await materialsService.getSignedUrl(m.id);
      setSignedUrlData(res);
    } catch (err) {
      handleApiError(err, 'Lỗi khi tạo liên kết xem trước học liệu');
    } finally {
      setLoadingPreview(false);
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
          fileSize: m.fileSize ? `${(m.fileSize / (1024 * 1024)).toFixed(1)} MB` : '6.2 MB',
          courseId: m.courseId || m.course?.id || m.lesson?.module?.course?.id || '',
          courseTitle: m.course?.title || m.lesson?.module?.course?.title || 'Tài liệu chung',
          isSignedUrl: true,
          isWatermark: m.isWatermarked !== false,
          uploadDate: m.createdAt ? new Date(m.createdAt).toLocaleDateString('vi-VN') : '08/11/2026',
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

  // Form State (#materialModal)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    fileType: 'PDF' as 'PDF' | 'AUDIO_MP3',
    courseId: '',
    isSignedUrl: true,
    isWatermark: true,
    allowDownload: false,
  });

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    const name = file.name;
    const isPdf = name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const isAudio =
      name.toLowerCase().endsWith('.mp3') ||
      name.toLowerCase().endsWith('.wav') ||
      name.toLowerCase().endsWith('.m4a') ||
      file.type.startsWith('audio/');

    if (isPdf) {
      setFormData((prev) => ({
        ...prev,
        fileType: 'PDF',
        title: prev.title.trim() === '' ? name.replace(/\.[^/.]+$/, '') : prev.title,
      }));
    } else if (isAudio) {
      setFormData((prev) => ({
        ...prev,
        fileType: 'AUDIO_MP3',
        title: prev.title.trim() === '' ? name.replace(/\.[^/.]+$/, '') : prev.title,
      }));
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Vui lòng chọn tệp tin PDF hoặc MP3 từ máy tính để tải lên!');
      return;
    }
    if (!formData.courseId) {
      toast.error('Vui lòng chọn khóa học để gán học liệu này!');
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('title', formData.title.trim() || selectedFile.name);
      fd.append('type', formData.fileType === 'AUDIO_MP3' ? 'AUDIO' : 'PDF');
      fd.append('courseId', formData.courseId);
      fd.append('isPrivate', String(formData.isSignedUrl));
      fd.append('isWatermarked', String(formData.isWatermark));

      await materialsService.uploadWithFile(fd);
      await fetchMaterials();
      setIsModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFormData({
        title: '',
        fileType: 'PDF',
        courseId: courses[0]?.id || '',
        isSignedUrl: true,
        isWatermark: true,
        allowDownload: false,
      });
      toast.success(`Đã tải lên và mã hóa học liệu "${formData.title || selectedFile.name}" cho khóa học thành công!`);
    } catch (err) {
      handleApiError(err, 'Lỗi khi tải lên học liệu số');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (matId: string) => {
    try {
      await materialsService.delete(matId);
      await fetchMaterials();
      setNotice('Đã xóa học liệu số thành công.');
    } catch (err) {
      handleApiError(err, 'Lỗi khi xóa học liệu số');
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
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý & Bảo Mật Học Liệu Số (LIB-SCR-001)
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Quản trị viên tải lên học liệu riêng cho từng khóa học. Mọi tài liệu được bảo vệ bằng Signed URL 15 phút và Dynamic Watermark.
          </p>
        </div>

        <button
          onClick={() => {
            if (courses.length > 0 && !formData.courseId) {
              setFormData((prev) => ({ ...prev, courseId: courses[0].id }));
            }
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition flex items-center space-x-1.5"
        >
          <Upload className="w-4 h-4" />
          <span>Tải Lên Học Liệu Cho Khóa Học</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Materials Table & Filter */}
      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Tài liệu số đã bảo mật ({filteredMaterials.length})
          </h3>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Lọc theo khóa:</span>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-line text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-primary shadow-sm"
            >
              <option value="ALL">Tất cả khóa học ({materials.length})</option>
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
                <th className="py-3 px-4">Tên Tài Liệu</th>
                <th className="py-3 px-4">Định Dạng</th>
                <th className="py-3 px-4">Dung Lượng</th>
                <th className="py-3 px-4">Khóa Học Áp Dụng</th>
                <th className="py-3 px-4">Signed URL 15m</th>
                <th className="py-3 px-4">Dynamic Watermark</th>
                <th className="py-3 px-4">Ngày Upload</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    Không có học liệu nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800 max-w-xs">
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(m)}
                        className="text-left font-bold text-slate-800 hover:text-primary transition flex items-center gap-1.5 group cursor-pointer"
                        title="Bấm để xem trực tiếp học liệu này"
                      >
                        <span className="group-hover:underline underline-offset-2">{m.title}</span>
                        <Eye className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          m.fileType === 'PDF'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {m.fileType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted">{m.fileSize}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-primary bg-sky-50 px-2 py-0.5 rounded text-[11px]">
                        {m.courseTitle}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Bật (15:00)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-100 text-primary">
                        Bật (12s random)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted">{m.uploadDate}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(m)}
                          className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-primary font-bold text-xs transition flex items-center space-x-1 cursor-pointer border border-sky-200 shadow-2xs"
                          title="Xem trực tuyến với Watermark"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMaterial(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          title="Xóa học liệu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Material Modal (#materialModal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-line p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Tải Lên Học Liệu Cho Khóa Học
                </h3>
                <p className="text-[11px] text-muted">
                  Học liệu sẽ được mã hóa và chỉ học viên đăng ký khóa học này mới có thể truy cập.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMaterial} className="space-y-4">
              {/* File Dropzone Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tệp tin học liệu (.pdf, .mp3, .wav, .m4a) <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.mp3,.wav,.m4a,application/pdf,audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileChange(f);
                  }}
                />
                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleFileChange(f);
                    }}
                    className="border-2 border-dashed border-sky-300 hover:border-primary bg-sky-50/50 hover:bg-sky-50 rounded-2xl p-5 text-center cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-105 transition-transform mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      Kéo thả tệp tin vào đây hoặc <span className="text-primary underline">chọn từ thiết bị</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PDF (tối đa 50MB) • Audio MP3 / WAV (tối đa 100MB)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-sky-200 bg-sky-50/60">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                        {formData.fileType === 'PDF' ? (
                          <FileText className="w-5 h-5 text-red-500" />
                        ) : (
                          <Music className="w-5 h-5 text-purple-500" />
                        )}
                      </div>
                      <div className="truncate text-left">
                        <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Sẵn sàng tải lên
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      title="Chọn lại tệp khác"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên tài liệu giáo trình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ví dụ: Academic Collocations for Band 8.0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CustomSelect
                  label="Định dạng tài liệu"
                  value={formData.fileType}
                  onChange={(val) => setFormData({ ...formData, fileType: val as 'PDF' | 'AUDIO_MP3' })}
                  options={[
                    {
                      value: 'PDF',
                      label: 'Giáo trình PDF',
                      sublabel: 'Tối đa 50MB, xem inline có Watermark',
                      icon: <FileText className="w-4 h-4 text-red-500" />,
                      badge: 'PDF',
                      badgeColor: 'bg-red-100 text-red-700',
                    },
                    {
                      value: 'AUDIO_MP3',
                      label: 'Âm thanh MP3',
                      sublabel: 'Tối đa 100MB, bài nghe IELTS',
                      icon: <Music className="w-4 h-4 text-purple-500" />,
                      badge: 'MP3',
                      badgeColor: 'bg-purple-100 text-purple-700',
                    },
                  ]}
                />

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
              </div>

              {/* Security policy checkboxes */}
              <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 space-y-2 text-xs">
                <p className="font-bold text-primary">Chính sách bảo mật học liệu số:</p>
                <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSignedUrl}
                    onChange={(e) => setFormData({ ...formData, isSignedUrl: e.target.checked })}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span>Áp dụng Signed URL (Tự động hết hạn sau 15:00)</span>
                </label>
                <label className="flex items-center space-x-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isWatermark}
                    onChange={(e) => setFormData({ ...formData, isWatermark: e.target.checked })}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span>Phủ Dynamic Watermark (Tên + SĐT + Mã HV chuyển động)</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.courseId}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang Tải Lên...</span>
                    </>
                  ) : (
                    <span>Tải Lên Cho Khóa Học</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secured Material Preview Modal (with PDF / Audio viewer & Dynamic Watermark) */}
      {previewMaterial && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm transition-all duration-300 ${
            isFocusMode ? 'p-0' : 'p-3 sm:p-6'
          }`}
        >
          <div
            className={`bg-white flex flex-col shadow-2xl overflow-hidden relative border border-slate-700 transition-all duration-300 ${
              isFocusMode ? 'w-screen h-screen rounded-none' : 'w-full max-w-5xl h-[88vh] rounded-3xl'
            }`}
          >
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center space-x-3 truncate pr-3">
                <div className="w-8 h-8 rounded-xl bg-primary/20 text-sky-400 flex items-center justify-center shrink-0">
                  {previewMaterial.fileType === 'PDF' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Music className="w-4 h-4" />
                  )}
                </div>
                <div className="truncate">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                    {previewMaterial.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Dynamic Watermark DRM</span>
                    </span>
                    <span>•</span>
                    <span>Khóa: {previewMaterial.courseTitle}</span>
                    <span>•</span>
                    <span>Hiệu lực Signed URL: 15 phút</span>
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
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Stage with Dynamic Watermark Overlay */}
            <div className="flex-1 relative bg-slate-100 overflow-hidden flex items-center justify-center select-none">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs font-semibold">Đang nạp học liệu qua Signed URL...</p>
                </div>
              ) : previewMaterial.fileType === 'PDF' && signedUrlData?.signedUrl ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={`${signedUrlData.signedUrl.startsWith('http') ? signedUrlData.signedUrl : `http://localhost:3001${signedUrlData.signedUrl.startsWith('/') ? '' : '/'}${signedUrlData.signedUrl}`}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-full h-full border-none"
                    title={previewMaterial.title}
                  />
                  <DynamicWatermarkCanvas
                    studentName={signedUrlData?.watermark?.fullName || user?.fullName || 'Admin Teacher Dong'}
                    studentPhone={signedUrlData?.watermark?.phone || user?.phone || '0912345678'}
                    studentId={signedUrlData?.watermark?.userId || user?.id || 'ADMIN-2026'}
                  />
                </div>
              ) : previewMaterial.fileType === 'AUDIO_MP3' && signedUrlData?.signedUrl ? (
                <div className="w-full h-full relative flex flex-col items-center justify-center p-8 bg-slate-900 text-white space-y-6">
                  <div className="w-24 h-24 rounded-3xl bg-primary/20 text-sky-400 flex items-center justify-center border border-sky-400/30 shadow-xl">
                    <Music className="w-12 h-12" />
                  </div>
                  <div className="text-center space-y-1 max-w-md">
                    <h4 className="text-base font-bold text-slate-100">{previewMaterial.title}</h4>
                    <p className="text-xs text-slate-400">
                      Tệp âm thanh giáo trình số. Phát trực tuyến bảo mật qua Signed URL.
                    </p>
                  </div>
                  <div className="w-full max-w-md p-4 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-lg">
                    <audio
                      controls
                      autoPlay
                      src={signedUrlData.signedUrl.startsWith('http') ? signedUrlData.signedUrl : `http://localhost:3001${signedUrlData.signedUrl.startsWith('/') ? '' : '/'}${signedUrlData.signedUrl}`}
                      className="w-full h-10"
                    />
                  </div>
                  <DynamicWatermarkCanvas
                    studentName={signedUrlData?.watermark?.fullName || user?.fullName || 'Admin Teacher Dong'}
                    studentPhone={signedUrlData?.watermark?.phone || user?.phone || '0912345678'}
                    studentId={signedUrlData?.watermark?.userId || user?.id || 'ADMIN-2026'}
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  Không thể nạp học liệu này. Vui lòng thử lại.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <span className="flex items-center space-x-1.5 text-amber-400/90 font-medium text-center sm:text-left">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Chế độ xem trước của Quản trị viên • Tự động kích hoạt Dynamic Watermark bảo vệ bản quyền</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreviewMaterial(null);
                  setSignedUrlData(null);
                  setIsFocusMode(false);
                }}
                className="px-4 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
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
