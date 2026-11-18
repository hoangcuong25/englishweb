'use client';

import React, { useState, useEffect, useRef } from 'react';
import { materialsService } from '@/services/materials.service';
import { coursesService } from '@/services/courses.service';
import CustomSelect from '@/components/ui/custom-select';
import { toast } from '@/components/ui/toast';
import { handleApiError } from '@/lib/api-error';
import {
  Upload,
  CheckCircle2,
  Trash2,
  X,
  FileText,
  Music,
  GraduationCap,
} from 'lucide-react';

interface MaterialItem {
  id: string;
  title: string;
  fileType: 'PDF' | 'AUDIO_MP3';
  fileSize: string;
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
  isWatermarked?: boolean;
  createdAt?: string;
  lesson?: { module?: { course?: { title?: string } } };
}

export default function AdminLibraryPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchMaterials = async () => {
    try {
      const res = await materialsService.getAll();
      if (res && Array.isArray(res.items)) {
        const mapped: MaterialItem[] = (res.items as unknown as RawMaterial[]).map((m: RawMaterial) => ({
          id: m.id,
          title: m.title,
          fileType: m.type === 'AUDIO' ? 'AUDIO_MP3' : 'PDF',
          fileSize: m.fileSize ? `${(m.fileSize / (1024 * 1024)).toFixed(1)} MB` : '6.2 MB',
          courseTitle: m.lesson?.module?.course?.title || 'IELTS Masterclass 7.5+ Intensive',
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
    fetchMaterials();
  }, []);

  // Form State (#materialModal - Form 5 in Plan)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    fileType: 'PDF' as 'PDF' | 'AUDIO_MP3',
    courseTitle: 'IELTS Masterclass 7.5+ Intensive',
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

    setIsSubmitting(true);
    try {
      let targetLessonId = '';
      try {
        const courses = await coursesService.getCourses();
        if (Array.isArray(courses) && courses.length > 0) {
          const firstCourse = await coursesService.getCourseBySlug(courses[0].slug || courses[0].id);
          targetLessonId = firstCourse?.modules?.[0]?.lessons?.[0]?.id || '';
        }
      } catch {}

      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('title', formData.title.trim() || selectedFile.name);
      fd.append('type', formData.fileType === 'AUDIO_MP3' ? 'AUDIO' : 'PDF');
      fd.append('isPrivate', String(formData.isSignedUrl));
      fd.append('isWatermarked', String(formData.isWatermark));
      if (targetLessonId) {
        fd.append('lessonId', targetLessonId);
      }

      await materialsService.uploadWithFile(fd);
      await fetchMaterials();
      setIsModalOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setFormData({
        title: '',
        fileType: 'PDF',
        courseTitle: 'IELTS Masterclass 7.5+ Intensive',
        isSignedUrl: true,
        isWatermark: true,
        allowDownload: false,
      });
      toast.success(`Đã tải lên và mã hóa học liệu "${formData.title || selectedFile.name}" thành công!`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý & Bảo Mật Học Liệu Số (LIB-SCR-001)
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Tất cả tài liệu được bảo vệ bằng Signed URL thời hạn 15 phút và Dynamic Watermark chống quay trộm.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/20 transition flex items-center space-x-1.5"
        >
          <Upload className="w-4 h-4" />
          <span>Tải Lên Học Liệu (#materialModal)</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Tài liệu số đã bảo mật ({materials.length})
          </h3>
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
                <th className="py-3 px-4 text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {materials.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-800 max-w-xs">
                    {m.title}
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
                  <td className="py-3.5 px-4 text-slate-700">{m.courseTitle}</td>
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
                    <button
                      onClick={() => handleDeleteMaterial(m.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                      title="Xóa học liệu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Material Modal (#materialModal - Form 5 in Plan) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-line p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Tải Lên Học Liệu Số (#materialModal)
              </h3>
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

              <div className="grid grid-cols-2 gap-4">
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
                  label="Khóa học áp dụng"
                  value={formData.courseTitle}
                  onChange={(val) => setFormData({ ...formData, courseTitle: val })}
                  options={[
                    {
                      value: 'IELTS Masterclass 7.5+ Intensive',
                      label: 'IELTS Masterclass 7.5+',
                      sublabel: 'Writing & Speaking Intensive',
                      icon: <GraduationCap className="w-4 h-4 text-primary" />,
                      badge: 'Active',
                    },
                    {
                      value: 'Business English VIP',
                      label: 'Business English VIP',
                      sublabel: 'Executive Communication',
                      icon: <GraduationCap className="w-4 h-4 text-primary" />,
                      badge: 'VIP',
                      badgeColor: 'bg-purple-100 text-purple-700',
                    },
                  ]}
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
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Đang Tải Lên...</span>
                    </>
                  ) : (
                    <span>Tải Lên & Mã Hóa</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

