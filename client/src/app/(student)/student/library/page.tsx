'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DynamicWatermarkCanvas from '@/components/shared/dynamic-watermark-canvas';
import {
  FileText,
  Headphones,
  Clock,
  Eye,
  Lock,
  Search,
} from 'lucide-react';

interface Material {
  id: string;
  title: string;
  fileType: 'PDF' | 'AUDIO_MP3';
  category: string;
  size: string;
  updatedAt: string;
}

export default function StudentLibraryPage() {
  const { user } = useAuth();
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PDF' | 'AUDIO'>('ALL');

  // 15:00 Presigned URL countdown timer
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    if (!selectedMaterial) return;
    setTimeLeft(15 * 60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedMaterial]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const materials: Material[] = [
    {
      id: 'mat-1',
      title: 'IELTS Writing Task 2 Master Vocabulary Band 8.0+ (Full Guide)',
      fileType: 'PDF',
      category: 'IELTS Writing',
      size: '8.4 MB',
      updatedAt: '08/11/2026',
    },
    {
      id: 'mat-2',
      title: 'Academic Collocations & Linking Words for Band 7.5+',
      fileType: 'PDF',
      category: 'Vocabulary',
      size: '4.2 MB',
      updatedAt: '05/11/2026',
    },
    {
      id: 'mat-3',
      title: 'IELTS Speaking Part 2 Native Speaker Audio Model Answers (Set 01)',
      fileType: 'AUDIO_MP3',
      category: 'IELTS Speaking',
      size: '24.5 MB',
      updatedAt: '02/11/2026',
    },
    {
      id: 'mat-4',
      title: 'Business Communication English — Negotiation Phrases Handbook',
      fileType: 'PDF',
      category: 'Business English',
      size: '6.1 MB',
      updatedAt: '28/10/2026',
    },
  ];

  const filtered = materials.filter((m) => {
    const matchSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType =
      filterType === 'ALL' ||
      (filterType === 'PDF' && m.fileType === 'PDF') ||
      (filterType === 'AUDIO' && m.fileType === 'AUDIO_MP3');
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Kho Học Liệu Số Bảo Mật
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Giáo trình PDF và bài nghe Audio độc quyền của Teacher Dong Academy.
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-100 text-primary text-xs font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>Dynamic Watermark & Signed URL 15:00 Active</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-line p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm tài liệu, giáo trình..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {(['ALL', 'PDF', 'AUDIO'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === type
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'ALL' ? 'Tất cả' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mat) => (
          <div
            key={mat.id}
            className="p-5 rounded-2xl bg-white border border-line hover:border-primary/50 shadow-sm transition flex flex-col justify-between"
          >
            <div className="flex items-start space-x-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  mat.fileType === 'PDF'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {mat.fileType === 'PDF' ? (
                  <FileText className="w-5 h-5" />
                ) : (
                  <Headphones className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-sky-50 px-2 py-0.5 rounded">
                  {mat.category}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-2">
                  {mat.title}
                </h3>
                <p className="text-[11px] text-muted mt-1">
                  Dung lượng: {mat.size} • Cập nhật: {mat.updatedAt}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Chỉ xem trực tuyến</span>
              <button
                onClick={() => setSelectedMaterial(mat)}
                className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Mở Xem Bảo Mật</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Secured Material Viewer Modal (with Watermark & 15:00 Signed URL Countdown) */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative border border-line">
            {/* Viewer Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                  {selectedMaterial.fileType === 'PDF' ? <FileText className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold truncate max-w-md">
                    {selectedMaterial.title}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Bản quyền bảo mật số • Teacher Dong Academy
                  </span>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 font-mono text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Token hết hạn: {formatTimer(timeLeft)}</span>
                </div>
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* Viewer Body with Protected Canvas & Dynamic Watermark */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center p-8 select-none">
              {/* Dynamic Watermark Canvas Layer moving every 12 seconds */}
              <DynamicWatermarkCanvas
                studentName={user?.fullName || 'Học Viên Demo'}
                studentId={user?.id || 'HV-2026-88'}
                studentPhone={user?.phone || '0987654321'}
                opacity={0.3}
              />

              {/* Mock PDF Document Display */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-300 w-full max-w-2xl h-full p-8 overflow-y-auto space-y-6 text-slate-800">
                <div className="border-b border-line pb-4 text-center">
                  <h2 className="text-xl font-extrabold text-primary">
                    {selectedMaterial.title}
                  </h2>
                  <p className="text-xs text-muted mt-1">
                    Biên soạn: Thầy Đông (IELTS 8.5) — Nghiêm cấm sao chép dưới mọi hình thức.
                  </p>
                </div>

                <div className="space-y-4 text-xs leading-relaxed">
                  <p className="font-bold text-slate-900 text-sm">
                    CHƯƠNG 01: ADVANCED LINKING DEVICES & PARAGRAPH COHESION
                  </p>
                  <p>
                    Để đạt tiêu chuẩn Coherence & Cohesion (CC) từ band 7.5 trở lên trong bài thi IELTS Writing, thí sinh cần sử dụng linh hoạt các liên từ chỉ sự tương phản, nguyên nhân hệ quả và nhượng bộ một cách tự nhiên...
                  </p>
                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 space-y-2">
                    <p className="font-bold text-primary">Key Collocations:</p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700">
                      <li><strong>Exert a profound influence on:</strong> Tạo ảnh hưởng sâu sắc đến...</li>
                      <li><strong>Pave the way for:</strong> Mở đường cho...</li>
                      <li><strong>Stem predominantly from:</strong> Bắt nguồn chủ yếu từ...</li>
                    </ul>
                  </div>
                  <p>
                    Lưu ý: Mọi hành vi chụp màn hình hoặc quay lén sẽ bị hệ thống phát hiện thông qua Watermark nhận diện cá nhân và vô hiệu hóa tài khoản vĩnh viễn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

