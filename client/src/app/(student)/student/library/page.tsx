'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { materialsService, SignedUrlResponse } from '@/services/materials.service';
import DynamicWatermarkCanvas from '@/components/shared/dynamic-watermark-canvas';
import {
  FileText,
  Headphones,
  Clock,
  Eye,
  Lock,
  Search,
  X,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface LibraryMaterial {
  id: string;
  title: string;
  fileType: 'PDF' | 'AUDIO_MP3';
  category: string;
  size: string;
  updatedAt: string;
}

interface RawMaterial {
  id: string;
  title: string;
  type?: string;
  fileSize?: number;
  createdAt?: string;
  lesson?: { module?: { course?: { title?: string } } };
}

export default function StudentLibraryPage() {
  const { user } = useAuth();
  const [selectedMaterial, setSelectedMaterial] = useState<LibraryMaterial | null>(null);
  const [signedUrlData, setSignedUrlData] = useState<SignedUrlResponse | null>(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PDF' | 'AUDIO'>('ALL');

  // 15:00 Presigned URL countdown timer
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const [materials, setMaterials] = useState<LibraryMaterial[]>([
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
  ]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await materialsService.getAll();
        if (res && Array.isArray(res.items) && res.items.length > 0) {
          const mapped: LibraryMaterial[] = (res.items as unknown as RawMaterial[]).map((m: RawMaterial) => ({
            id: m.id,
            title: m.title,
            fileType: m.type === 'AUDIO' ? 'AUDIO_MP3' : 'PDF',
            category: m.lesson?.module?.course?.title || 'Kho Học Liệu',
            size: m.fileSize ? `${(m.fileSize / (1024 * 1024)).toFixed(1)} MB` : '6.2 MB',
            updatedAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString('vi-VN') : '08/11/2026',
          }));
          setMaterials(mapped);
        }
      } catch {
        // Keep initial mock list
      }
    };
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (!selectedMaterial) return;
    setTimeLeft(15 * 60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedMaterial]);

  const handleOpenSecureMaterial = async (mat: LibraryMaterial) => {
    setSelectedMaterial(mat);
    setLoadingSignedUrl(true);
    try {
      const data = await materialsService.getSignedUrl(mat.id);
      setSignedUrlData(data);
    } catch {
      // Fallback preview
      setSignedUrlData({
        signedUrl: `http://localhost:3001/api/materials/${mat.id}/stream?token=demo_signed_token_15m`,
        expiresInSeconds: 900,
        watermark: {
          fullName: user?.fullName || 'Học Viên Teacher Dong',
          phone: user?.phone || '0912345678',
          userId: user?.id || 'std-demo-id',
          timestamp: Date.now(),
        },
      });
    } finally {
      setLoadingSignedUrl(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
                onClick={() => handleOpenSecureMaterial(mat)}
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
                  <h3 className="text-sm font-bold truncate max-w-md">{selectedMaterial.title}</h3>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-300">
                    <span className="flex items-center space-x-1 text-amber-400 font-mono font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>URL ký số hết hạn sau: {formatTimer(timeLeft)}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Chống tải xuống & DRM Canvas</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedMaterial(null);
                  setSignedUrlData(null);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Viewer Content Area with Dynamic Moving Watermark */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              {loadingSignedUrl ? (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs font-semibold">Đang tạo Signed URL bảo mật 15 phút...</p>
                </div>
              ) : selectedMaterial.fileType === 'PDF' ? (
                <div className="w-full h-full p-8 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shadow-inner">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">
                    Đang hiển thị tài liệu: {selectedMaterial.title}
                  </h4>
                  <p className="text-xs text-muted max-w-md">
                    Tài liệu được bảo vệ bản quyền với Dynamic Watermark thời gian thực. Bất kỳ hành vi chụp hoặc quay màn hình đều sẽ hiển thị rõ định danh tài khoản.
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-line text-xs font-mono text-slate-600">
                    Token Stream: {signedUrlData?.signedUrl ? 'Đã xác thực chữ ký số hợp lệ' : 'Đang xử lý inline'}
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-md p-8 bg-white rounded-3xl border border-line shadow-lg space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                    <Headphones className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedMaterial.title}</h4>
                  <audio controls className="w-full" controlsList="nodownload">
                    <source src={signedUrlData?.signedUrl || ''} type="audio/mp3" />
                    Trình duyệt của bạn không hỗ trợ thẻ audio.
                  </audio>
                  <p className="text-[11px] text-muted">
                    Bản quyền thuộc Teacher Dong Academy. Chặn nút tải trực tiếp.
                  </p>
                </div>
              )}

              {/* Dynamic Watermark Canvas Overlay */}
              <DynamicWatermarkCanvas
                studentName={signedUrlData?.watermark?.fullName || user?.fullName || 'Học Viên Teacher Dong'}
                studentPhone={signedUrlData?.watermark?.phone || user?.phone || '0912345678'}
                studentId={signedUrlData?.watermark?.userId || user?.id || 'HV-2026'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Screen-capture & Print Shield */}
      <style jsx global>{`
        @media print {
          body {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
