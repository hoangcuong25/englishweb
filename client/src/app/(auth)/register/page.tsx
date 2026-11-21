'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { authService } from '@/services/auth.service';
import CustomSelect from '@/components/ui/custom-select';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import { PasswordInput } from '@/components/ui/password-input';
import { toast } from '@/components/ui/toast';
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
  KeyRound,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
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
    { value: 'TEACHING_DESIGN', label: 'Thiết kế giáo án hiện đại & Ứng dụng AI', badge: 'Giáo án' },
    { value: 'CLASS_INSPIRATION', label: 'Nghệ thuật truyền cảm hứng trong lớp học', badge: 'Truyền cảm hứng' },
  ],
};

export default function RegisterPage() {
  const { register } = useAuth();
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
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

  // OTP State
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleFieldChange = (newField: string) => {
    setLearningField(newField);
    const availableTargets = TARGET_OPTIONS_BY_FIELD[newField] || [];
    if (availableTargets.length > 0) {
      setLearningTarget(availableTargets[0].value);
    }
  };

  // Step 1: Validate form & Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

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
      await authService.requestRegisterOtp(email.trim(), fullName.trim());
      setStep('OTP');
      setCountdown(60);
      toast.success(`Mã OTP đã được gửi đến email: ${email.trim()}`);
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể gửi mã OTP. Email này có thể đã được đăng ký hoặc có lỗi kết nối.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError('');
    try {
      await authService.requestRegisterOtp(email.trim(), fullName.trim());
      setCountdown(60);
      toast.success('Mã OTP mới đã được gửi lại vào email của bạn!');
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể gửi lại mã OTP. Vui lòng thử lại sau.';
      setError(errorMsg);
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP & Complete Registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.trim().length < 6) {
      setError('Vui lòng nhập đầy đủ mã xác thực OTP 6 chữ số được gửi qua email.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        otp: otp.trim(),
      });
      toast.success('🎉 Đăng ký tài khoản thành công! Chào mừng bạn đến với học viện.');
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Mã xác thực OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại.';
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
            {step === 'FORM' ? 'Đăng Ký Tài Khoản Học Viên' : 'Xác Thực Mã OTP Email'}
          </h1>
          <p className="text-xs text-muted">
            {step === 'FORM'
              ? 'Học viện đào tạo: Tiếng Anh • Kỹ Năng Sống • Kỹ Năng Mềm • Sư Phạm'
              : `Mã OTP xác thực 6 chữ số đã được gửi đến email: ${email}`}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: FORM INPUT */}
        {step === 'FORM' && (
          <>
            <GoogleSignInButton />

            <div className="relative flex items-center justify-center">
              <div className="border-t border-line w-full"></div>
              <span className="bg-white px-3 text-xs text-muted font-bold uppercase tracking-wider">
                hoặc đăng ký bằng email
              </span>
              <div className="border-t border-line w-full"></div>
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên học viên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email cá nhân <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hệ thống sẽ gửi mã OTP xác thực tới địa chỉ email này.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại liên hệ
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-line text-xs sm:text-sm font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-1 border-t border-line">
                <CustomSelect
                  label="Lĩnh vực đào tạo quan tâm"
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
                <PasswordInput
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <PasswordInput
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                />
              </div>

              <label className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-0"
                />
                <span>
                  Tôi đồng ý với Quy chế Đào tạo và Chính sách Bảo mật của Teacher Dong Academy.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary hover:bg-[#154E8A] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-primary/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang gửi mã OTP...</span>
                  </span>
                ) : (
                  <>
                    <span>Tiếp Tục: Nhận Mã OTP Xác Thực</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: VERIFY OTP */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyAndRegister} className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-sky-100 text-primary flex items-center justify-center mx-auto">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                Nhập mã xác thực 6 chữ số
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Hệ thống đã gửi mã OTP xác nhận về hòm thư <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến (hoặc thư rác).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                Mã xác thực OTP (6 chữ số) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                autoFocus
                className="w-full py-3 rounded-xl border-2 border-primary/40 focus:border-primary text-center text-2xl font-mono font-bold tracking-[10px] text-slate-900 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <button
                type="button"
                onClick={() => setStep('FORM')}
                className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sửa thông tin</span>
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 0 || resending}
                className="text-primary font-bold hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer"
              >
                {resending
                  ? 'Đang gửi lại...'
                  : countdown > 0
                  ? `Gửi lại mã sau (${countdown}s)`
                  : 'Gửi lại mã OTP'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-dark disabled:opacity-50 text-slate-900 font-black text-xs uppercase tracking-wider transition shadow-md shadow-accent/20 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực & tạo tài khoản...</span>
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Xác Nhận & Hoàn Tất Đăng Ký</span>
                </>
              )}
            </button>
          </form>
        )}

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
