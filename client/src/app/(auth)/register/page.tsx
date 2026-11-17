'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import CustomSelect from '@/components/ui/custom-select';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import {
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  ArrowRight,
  Target,
  Sparkles,
  BookOpen,
  Award,
  Compass,
} from 'lucide-react';

const LEARNING_FIELD_OPTIONS = [
  {
    value: 'ENGLISH',
    label: 'Tiếng Anh & Luyện Thi IELTS',
    badge: 'IELTS / Tiếng Anh',
    icon: <Award className="w-4 h-4 text-sky-600" />,
  },
  {
    value: 'LIFE_SKILLS',
    label: 'Kỹ Năng Sống & Quản Trị Cảm Xúc',
    badge: 'Kỹ Năng Sống',
    icon: <Compass className="w-4 h-4 text-emerald-600" />,
  },
  {
    value: 'SOFT_SKILLS',
    label: 'Kỹ Năng Mềm & Giao Tiếp Công Sở',
    badge: 'Kỹ Năng Mềm',
    icon: <Sparkles className="w-4 h-4 text-purple-600" />,
  },
  {
    value: 'PERSONAL_DEV',
    label: 'Phát Triển Bản Thân & Quản Trị',
    badge: 'Phát Triển',
    icon: <Target className="w-4 h-4 text-amber-600" />,
  },
  {
    value: 'PEDAGOGY',
    label: 'Phương Pháp Giảng Dạy & Sư Phạm',
    badge: 'Sư Phạm',
    icon: <BookOpen className="w-4 h-4 text-blue-600" />,
  },
];

const TARGET_OPTIONS_BY_FIELD: Record<
  string,
  { value: string; label: string; badge?: string }[]
> = {
  ENGLISH: [
    { value: '6.5', label: 'Mục tiêu Band 6.5 (Tốt nghiệp & Du học)', badge: 'Tiêu chuẩn' },
    { value: '7.0', label: 'Mục tiêu Band 7.0 (Học bổng & Định cư)', badge: 'Phổ biến' },
    { value: '7.5', label: 'Mục tiêu Band 7.5+ (Đa quốc gia & Giảng dạy)', badge: 'Cao cấp' },
    { value: '8.0+', label: 'Mục tiêu Band 8.0+ (Chuyên gia ngôn ngữ)', badge: 'Xuất sắc' },
  ],
  LIFE_SKILLS: [
    { value: 'CRITICAL_THINKING', label: 'Tư duy phản biện & Giải quyết vấn đề', badge: 'Tư duy' },
    { value: 'EMOTION_MGMT', label: 'Quản trị cảm xúc & Cân bằng cuộc sống', badge: 'Cảm xúc' },
    { value: 'HABIT_DISCIPLINE', label: 'Kỷ luật bản thân & Thói quen tích cực', badge: 'Kỷ luật' },
  ],
  SOFT_SKILLS: [
    { value: 'PRESENTATION', label: 'Thuyết trình & Hùng biện tự tin trước đám đông', badge: 'Thuyết trình' },
    { value: 'WORKPLACE_COMM', label: 'Giao tiếp công sở & Xử lý tình huống', badge: 'Giao tiếp' },
    { value: 'LEADERSHIP', label: 'Lãnh đạo đội nhóm & Quản trị dự án', badge: 'Lãnh đạo' },
  ],
  PERSONAL_DEV: [
    { value: 'TIME_PRODUCTIVITY', label: 'Quản trị thời gian & Tối ưu hiệu suất', badge: 'Hiệu suất' },
    { value: 'PERSONAL_BRAND', label: 'Xây dựng thương hiệu cá nhân & Đột phá sự nghiệp', badge: 'Sự nghiệp' },
    { value: 'STRATEGIC_MIND', label: 'Tư duy chiến lược & Định hướng mục tiêu', badge: 'Chiến lược' },
  ],
  PEDAGOGY: [
    { value: 'ACTIVE_TEACHING', label: 'Phương pháp giảng dạy tương tác hiện đại', badge: 'Giảng dạy' },
    { value: 'EDTECH_DESIGN', label: 'Thiết kế giáo án EdTech & Ứng dụng AI', badge: 'EdTech' },
    { value: 'CLASS_INSPIRATION', label: 'Nghệ thuật truyền cảm hứng trong lớp học', badge: 'Truyền cảm hứng' },
  ],
};

export default function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [learningField, setLearningField] = useState('ENGLISH');
  const [learningTarget, setLearningTarget] = useState('7.0');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFieldChange = (newField: string) => {
    setLearningField(newField);
    const availableTargets = TARGET_OPTIONS_BY_FIELD[newField] || [];
    if (availableTargets.length > 0) {
      setLearningTarget(availableTargets[0].value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp với mật khẩu đã nhập.');
      return;
    }

    if (!agreeTerms) {
      setError('Bạn cần đồng ý với Điều khoản & Chính sách bảo mật của Teacher Dong Academy.');
      return;
    }

    setLoading(true);
    try {
      await register({ fullName, email, password, phone });
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng ký tài khoản không thành công. Email hoặc số điện thoại có thể đã được đăng ký.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-bg to-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-line p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-dark to-primary text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
              TD
            </div>
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Đăng Ký Tài Khoản Học Viên
          </h1>
          <p className="text-xs text-muted">
            Học viện đào tạo: Tiếng Anh • Kỹ Năng Sống • Kỹ Năng Mềm • Phát Triển Bản Thân
          </p>
        </div>

        {/* Google OAuth Sign-Up Button */}
        <GoogleSignInButton mode="register" />

        <div className="relative flex items-center justify-center py-1">
          <div className="flex-1 border-t border-line"></div>
          <span className="shrink-0 bg-white px-3 text-[11px] font-bold text-muted uppercase tracking-wider whitespace-nowrap">
            Hoặc điền thông tin bên dưới
          </span>
          <div className="flex-1 border-t border-line"></div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên đầy đủ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nguyenvana@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full pl-9 pr-2.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Learning Field & Target Selector */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            <CustomSelect
              label="Lĩnh vực học tập quan tâm"
              value={learningField}
              onChange={handleFieldChange}
              options={LEARNING_FIELD_OPTIONS}
            />

            <CustomSelect
              label={
                learningField === 'ENGLISH'
                  ? 'Mục tiêu Band điểm IELTS'
                  : 'Mục tiêu năng lực đầu ra'
              }
              value={learningTarget}
              onChange={(val) => setLearningTarget(val)}
              options={TARGET_OPTIONS_BY_FIELD[learningField] || []}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 8 ký tự, gồm số & chữ hoa"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <label className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-primary focus:ring-0"
            />
            <span>
              Tôi đồng ý với Quy chế Đào tạo và Chính sách Bảo mật (Single Session & Watermark) của Teacher Dong Academy.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-dark disabled:opacity-50 text-slate-900 font-bold text-xs uppercase tracking-wider transition shadow-md shadow-accent/20 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Đang Xử Lý Đăng Ký...</span>
            ) : (
              <>
                <span>Hoàn Tất Đăng Ký Học Viên</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Đăng nhập tại đây
          </Link>
        </div>
      </div>
    </div>
  );
}
