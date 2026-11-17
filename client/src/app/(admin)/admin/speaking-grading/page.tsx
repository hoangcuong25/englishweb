'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { speakingService, SpeakingSubmission } from '@/services/speaking.service';
import { toast } from '@/components/ui/toast';
import {
  Headphones,
  Play,
  Pause,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Send,
  RefreshCw,
  Mic,
  FileText,
  User,
} from 'lucide-react';

interface TimestampComment {
  id: string;
  timeSeconds: number;
  text: string;
}

export default function AdminSpeakingGradingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(114);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Criteria scores
  const [fc, setFc] = useState(7.0);
  const [lr, setLr] = useState(7.0);
  const [gra, setGra] = useState(7.0);
  const [pr, setPr] = useState(7.0);
  const [teacherFeedback, setTeacherFeedback] = useState(
    'Bài nói có cấu trúc tốt, phát âm tương đối chuẩn xác. Cần chú ý ngữ điệu ở các câu phức và làm phong phú thêm từ vựng học thuật.'
  );

  // Timestamp comments
  const [comments, setComments] = useState<TimestampComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Submissions list from DB
  const [submissions, setSubmissions] = useState<SpeakingSubmission[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string>('');

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const data = await speakingService.getAdminSubmissions();
      if (data && Array.isArray(data) && data.length > 0) {
        setSubmissions(data);
        if (!selectedSubId || !data.some((s) => s.id === selectedSubId)) {
          setSelectedSubId(data[0].id);
        }
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      console.error('Error fetching admin speaking submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Current selected submission
  const currentSub = submissions.find((s) => s.id === selectedSubId) || submissions[0];

  // When selected submission changes, load its data
  useEffect(() => {
    if (!currentSub) return;

    if (currentSub.fluencyScore !== undefined && currentSub.fluencyScore !== null) {
      setFc(currentSub.fluencyScore);
    }
    if (currentSub.lexicalScore !== undefined && currentSub.lexicalScore !== null) {
      setLr(currentSub.lexicalScore);
    }
    if (currentSub.grammarScore !== undefined && currentSub.grammarScore !== null) {
      setGra(currentSub.grammarScore);
    }
    if (currentSub.pronunciationScore !== undefined && currentSub.pronunciationScore !== null) {
      setPr(currentSub.pronunciationScore);
    }
    if (currentSub.feedback) {
      setTeacherFeedback(currentSub.feedback);
    }
    if (currentSub.durationSeconds) {
      setDuration(currentSub.durationSeconds);
    }

    // Load timestamp feedback
    const rawTs = ((currentSub as unknown as Record<string, unknown>).timestampFeedback ||
      currentSub.timestampComments) as Array<Record<string, unknown>> | undefined;

    if (Array.isArray(rawTs) && rawTs.length > 0) {
      setComments(
        rawTs.map((item, idx) => {
          let timeSec = 0;
          if (typeof item.timeSeconds === 'number') {
            timeSec = item.timeSeconds;
          } else if (typeof item.timestampSeconds === 'number') {
            timeSec = item.timestampSeconds;
          } else if (typeof item.timestamp === 'string') {
            const parts = item.timestamp.split(':');
            if (parts.length === 2) {
              timeSec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
            }
          }
          const text =
            (item.note as string) ||
            (item.text as string) ||
            (item.comment as string) ||
            '';
          return {
            id: `c-${idx}-${Date.now()}`,
            timeSeconds: timeSec,
            text,
          };
        })
      );
    } else {
      setComments([
        { id: 'c1', timeSeconds: 15, text: 'Phát âm ending sound /s/ rất rõ ràng.' },
        { id: 'c2', timeSeconds: 45, text: 'Dùng cấu trúc câu phức tự nhiên.' },
      ]);
    }

    // Reset audio state
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, [selectedSubId]);

  const calculateOverall = () => {
    const raw = (fc + lr + gra + pr) / 4;
    return Math.round(raw * 2) / 2;
  };

  const overall = calculateOverall();

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (seconds: number) => {
    const clamped = Math.max(0, Math.min(duration, seconds));
    setCurrentTime(clamped);
    if (audioRef.current) {
      audioRef.current.currentTime = clamped;
    }
  };

  const handleJump5 = (delta: number) => {
    handleSeek(currentTime + delta);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment: TimestampComment = {
      id: `c-${Date.now()}`,
      timeSeconds: currentTime,
      text: newCommentText.trim(),
    };
    setComments([...comments, newComment].sort((a, b) => a.timeSeconds - b.timeSeconds));
    setNewCommentText('');
  };

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  const handlePublishGrade = async () => {
    if (!currentSub) return;
    setIsSubmitting(true);
    try {
      await speakingService.gradeSubmission(currentSub.id, {
        fluencyScore: fc,
        lexicalScore: lr,
        grammarScore: gra,
        pronunciationScore: pr,
        bandScore: overall,
        feedback: teacherFeedback.trim(),
        timestampFeedback: comments.map((c) => ({
          timestamp: formatSeconds(c.timeSeconds),
          note: c.text,
        })),
      });

      // Update local state
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === currentSub.id
            ? {
                ...s,
                status: 'GRADED',
                bandScore: overall,
                fluencyScore: fc,
                lexicalScore: lr,
                grammarScore: gra,
                pronunciationScore: pr,
                feedback: teacherFeedback,
              }
            : s
        )
      );

      const studentName = currentSub.student?.fullName || 'học viên';
      setSubmittedNotice(
        `Đã lưu và công bố kết quả chấm bài Speaking cho ${studentName}: Overall Band ${overall}!`
      );
      toast.success(`Đã hoàn tất chấm điểm bài nói Speaking (Band ${overall})!`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể lưu điểm Speaking. Vui lòng kiểm tra lại.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmittedNotice(''), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden HTML5 Audio Element for Real Playback */}
      {currentSub && (
        <audio
          ref={audioRef}
          src={currentSub.audioUrl}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(Math.floor(audioRef.current.currentTime));
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration) {
              setDuration(Math.floor(audioRef.current.duration));
            }
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-1">
            <Headphones className="w-3.5 h-3.5" />
            <span>Speaking Assessment Studio (Live API Connected)</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Phòng Nghe & Chấm Điểm IELTS Speaking
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Giảng viên nghe bài ghi âm thực tế của học viên, kéo thả chấm 4 tiêu chí và ghim nhận xét theo mốc thời gian.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSubmissions}
          className="p-2.5 rounded-xl bg-white border border-line hover:border-primary text-slate-600 hover:text-primary transition shadow-xs flex items-center gap-1.5 text-xs font-bold w-fit cursor-pointer"
          title="Làm mới danh sách"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line gap-2">
        <Link
          href="/admin/speaking-grading"
          className="px-4 py-2 text-xs font-bold text-primary border-b-2 border-primary transition flex items-center space-x-2"
        >
          <Headphones className="w-4 h-4" />
          <span>Chấm Điểm Bài Nói ({submissions.length})</span>
        </Link>
        <Link
          href="/admin/speaking-prompts"
          className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition flex items-center space-x-2 border-b-2 border-transparent"
        >
          <Mic className="w-4 h-4" />
          <span>Ngân Hàng Đề Thi Speaking</span>
        </Link>
      </div>

      {submittedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{submittedNotice}</span>
        </div>
      )}

      {currentSub ? (
        <>
          {/* Candidate Overview Card */}
          <div className="p-5 rounded-2xl bg-white border border-line shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-sky-100 text-primary">
                  {currentSub.prompt?.title || 'IELTS Speaking'}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                    currentSub.status === 'GRADED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}
                >
                  {currentSub.status === 'GRADED' ? 'ĐÃ CHẤM ĐIỂM' : 'CHỜ CHẤM ĐIỂM'}
                </span>
              </div>

              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span>Học viên: {currentSub.student?.fullName || 'Học viên'}</span>
                <span className="text-xs text-muted font-normal">({currentSub.student?.email})</span>
              </h2>

              <p className="text-xs text-slate-600">
                Chủ đề đề bài: <strong>{currentSub.prompt?.title || 'Speaking Topic'}</strong>
              </p>

              {submissions.length > 1 && (
                <div className="pt-1 flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-slate-500">Chọn bài nộp khác:</span>
                  <select
                    value={selectedSubId}
                    onChange={(e) => setSelectedSubId(e.target.value)}
                    className="text-xs bg-slate-50 border border-line rounded-lg px-2.5 py-1 font-semibold text-slate-700 focus:outline-none focus:border-primary"
                  >
                    {submissions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.student?.fullName || 'Học viên'} - {s.prompt?.title || 'Đề bài'} ({s.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 text-right bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-muted font-bold uppercase">Estimated Overall Band</span>
                <p className="text-3xl font-black text-primary">{overall.toFixed(1)}</p>
                <span className="text-[10px] text-slate-500 font-medium">Trung bình cộng 4 tiêu chí</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Waveform Player & Timestamp Notes (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Audio Player Container */}
              <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-md space-y-5">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-mono text-amber-400 font-bold">
                    {formatSeconds(currentTime)} / {formatSeconds(duration)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400">Tốc độ:</span>
                    {[0.8, 1.0, 1.2].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => handleRateChange(rate)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          playbackRate === rate
                            ? 'bg-primary text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Waveform Visualization (Dynamic Audio Waves) */}
                <div className="h-14 flex items-center justify-between gap-1 px-1 bg-slate-950/60 rounded-xl p-2 border border-slate-800/80">
                  {Array.from({ length: 48 }).map((_, i) => {
                    const isActive = i / 48 <= currentTime / (duration || 1);
                    const heightMod = Math.sin(i * 0.4 + (isPlaying ? Date.now() / 300 : 0)) * 0.4 + 0.6;
                    const barHeight = Math.max(15, Math.floor(heightMod * 44));
                    return (
                      <div
                        key={i}
                        onClick={() => handleSeek(Math.floor((i / 48) * duration))}
                        style={{ height: `${barHeight}px` }}
                        className={`w-1 rounded-full cursor-pointer transition-all duration-100 ${
                          isActive
                            ? 'bg-gradient-to-t from-sky-500 to-amber-400 shadow-sm shadow-sky-500/50'
                            : 'bg-slate-700/60 hover:bg-slate-600'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Interactive Progress Bar with Timestamp Marker Pins */}
                <div className="relative pt-3 pb-1">
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      handleSeek(Math.floor(pos * duration));
                    }}
                    className="w-full bg-slate-800 h-3 rounded-full cursor-pointer relative overflow-hidden group"
                  >
                    <div
                      className="bg-primary h-full transition-all duration-150"
                      style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                    ></div>
                  </div>

                  {/* Pin markers for each timestamp comment */}
                  {comments.map((c) => {
                    const leftPercent = Math.min(99, Math.max(1, (c.timeSeconds / (duration || 1)) * 100));
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSeek(c.timeSeconds);
                        }}
                        title={`Mốc ${formatSeconds(c.timeSeconds)}: ${c.text}`}
                        style={{ left: `${leftPercent}%` }}
                        className="absolute -top-1 -translate-x-1/2 p-1 group z-10 focus:outline-none cursor-pointer"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 block group-hover:scale-150 group-hover:bg-amber-300 transition shadow-sm" />
                      </button>
                    );
                  })}
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleJump5(-5)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      -5s
                    </button>
                    <button
                      type="button"
                      onClick={togglePlayPause}
                      className="p-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition shadow-md shadow-primary/20 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJump5(5)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      +5s
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Bấm phát để nghe giọng học viên & ghim nhận xét theo giây
                  </div>
                </div>
              </div>

              {/* Timestamp Comments Box */}
              <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-800 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Ghi Chú Nhận Xét Theo Mốc Thời Gian ({comments.length}):</span>
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <span className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 font-mono font-bold text-xs flex items-center">
                    {formatSeconds(currentTime)}
                  </span>
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Nhập nhận xét phát âm / ngữ pháp tại giây này..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-primary font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition shadow-sm flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ghim</span>
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-2 pt-1">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-line bg-slate-50/50 hover:bg-white transition flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start space-x-2.5">
                        <button
                          type="button"
                          onClick={() => handleSeek(c.timeSeconds)}
                          className="px-2 py-0.5 rounded font-mono font-bold bg-sky-100 text-primary hover:bg-sky-200 transition text-[11px] mt-0.5 cursor-pointer"
                        >
                          ▶ {formatSeconds(c.timeSeconds)}
                        </button>
                        <p className="text-slate-700 leading-relaxed pt-0.5">{c.text}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: 4 Criteria Rubric & Overall Feedback (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-line p-6 shadow-sm space-y-5">
                <h3 className="text-xs font-extrabold uppercase text-slate-800 border-b border-line pb-3">
                  Chấm Điểm 4 Tiêu Chí IELTS Speaking
                </h3>

                {/* Criteria 1: FC */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">1. Fluency & Coherence (FC)</span>
                    <span className="font-extrabold text-primary font-mono text-sm">Band {fc.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="4.0"
                    max="9.0"
                    step="0.5"
                    value={fc}
                    onChange={(e) => setFc(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Criteria 2: LR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">2. Lexical Resource (LR)</span>
                    <span className="font-extrabold text-primary font-mono text-sm">Band {lr.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="4.0"
                    max="9.0"
                    step="0.5"
                    value={lr}
                    onChange={(e) => setLr(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Criteria 3: GRA */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">3. Grammatical Range & Accuracy (GRA)</span>
                    <span className="font-extrabold text-primary font-mono text-sm">Band {gra.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="4.0"
                    max="9.0"
                    step="0.5"
                    value={gra}
                    onChange={(e) => setGra(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Criteria 4: PR */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">4. Pronunciation (PR)</span>
                    <span className="font-extrabold text-primary font-mono text-sm">Band {pr.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="4.0"
                    max="9.0"
                    step="0.5"
                    value={pr}
                    onChange={(e) => setPr(parseFloat(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Teacher Feedback Textarea */}
                <div className="space-y-1.5 pt-2 border-t border-line">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>Nhận xét tổng quan của giảng viên</span>
                  </label>
                  <textarea
                    rows={4}
                    value={teacherFeedback}
                    onChange={(e) => setTeacherFeedback(e.target.value)}
                    placeholder="Nhập nhận xét chi tiết về bài nói của học viên..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary font-medium"
                  />
                </div>

                {/* Overall Summary Box */}
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-muted uppercase">Điểm Overall</span>
                    <p className="text-xl font-black text-primary">Band {overall.toFixed(1)}</p>
                  </div>
                  <button
                    disabled={isSubmitting}
                    onClick={handlePublishGrade}
                    className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Lưu & Công Bố Điểm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="p-12 rounded-3xl bg-white border border-line text-center space-y-4 shadow-xs">
          <Headphones className="w-12 h-12 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">Chưa có bài nộp Speaking nào cần chấm</h3>
            <p className="text-xs text-muted max-w-md mx-auto">
              Khi học viên hoàn tất bài ghi âm trong phòng luyện nói, danh sách bài nộp sẽ tự động hiển thị tại đây để bạn nghe và chấm điểm.
            </p>
          </div>
          <Link
            href="/admin/speaking-prompts"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary-dark transition"
          >
            <Mic className="w-4 h-4" />
            <span>Quản Lý Ngân Hàng Đề Thi Speaking</span>
          </Link>
        </div>
      )}
    </div>
  );
}
