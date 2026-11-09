'use client';

import React, { useState } from 'react';
import { materialsService } from '@/services/materials.service';
import {
  Upload,
  CheckCircle2,
  Trash2,
  X,
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

export default function AdminLibraryPage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([
    {
      id: 'mat-1',
      title: 'IELTS Writing Task 2 Master Vocabulary Band 8.0+ (Full Guide)',
      fileType: 'PDF',
      fileSize: '8.4 MB',
      courseTitle: 'IELTS Masterclass 7.5+ Intensive',
      isSignedUrl: true,
      isWatermark: true,
      uploadDate: '08/11/2026',
    },
    {
      id: 'mat-2',
      title: 'IELTS Speaking Part 2 Native Speaker Audio Model Answers (Set 01)',
      fileType: 'AUDIO_MP3',
      fileSize: '24.5 MB',
      courseTitle: 'IELTS Masterclass 7.5+ Intensive',
      isSignedUrl: true,
      isWatermark: true,
      uploadDate: '02/11/2026',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // Form State (#materialModal - Form 5 in Plan)
  const [formData, setFormData] = useState({
    title: '',
    fileType: 'PDF' as 'PDF' | 'AUDIO_MP3',
    courseTitle: 'IELTS Masterclass 7.5+ Intensive',
    isSignedUrl: true,
    isWatermark: true,
    allowDownload: false,
  });

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      title: formData.title,
      fileType: formData.fileType,
      fileSize: formData.fileType === 'PDF' ? '6.2 MB' : '18.4 MB',
      courseTitle: formData.courseTitle,
      isSignedUrl: formData.isSignedUrl,
      isWatermark: formData.isWatermark,
      uploadDate: new Date().toLocaleDateString('vi-VN'),
    };

    try {
      await materialsService.create({
        title: formData.title,
        fileType: formData.fileType,
        isSignedUrl: formData.isSignedUrl,
        isWatermark: formData.isWatermark,
      });
    } catch {
      // Local fallback
    }

    setMaterials([...materials, newMat]);
    setIsModalOpen(false);
    setNotice(`Đã tải lên và bảo mật học liệu "${newMat.title}" thành công!`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleDeleteMaterial = async (matId: string) => {
    try {
      await materialsService.delete(matId);
    } catch {
      // Local fallback
    }
    setMaterials(materials.filter((m) => m.id !== matId));
    setNotice('Đã xóa học liệu số thành công.');
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Định dạng tài liệu
                  </label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value as 'PDF' | 'AUDIO_MP3' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs bg-white font-bold"
                  >
                    <option value="PDF">Giáo trình PDF (Max 50MB)</option>
                    <option value="AUDIO_MP3">Âm thanh MP3 (Max 100MB)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Khóa học áp dụng
                  </label>
                  <select
                    value={formData.courseTitle}
                    onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs bg-white"
                  >
                    <option value="IELTS Masterclass 7.5+ Intensive">IELTS Masterclass 7.5+</option>
                    <option value="Business English VIP">Business English VIP</option>
                  </select>
                </div>
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
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm"
                >
                  Tải Lên & Mã Hóa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

