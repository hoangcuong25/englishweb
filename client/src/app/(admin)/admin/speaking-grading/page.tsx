'use client';

import React, { useState, useEffect } from 'react';
import { speakingService, SpeakingSubmission } from '@/services/speaking.service';
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
} from 'lucide-react';

interface TimestampComment {
  id: string;
  timeSeconds: number;
  text: string;
}

export default function AdminSpeakingGradingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(15);
  const [duration] = useState(114); // 01:54
  const [playbackRate, setPlaybackRate] = useState(1.0);

  // Criteria scores
  const [fc, setFc] = useState(7.0);
  const [lr, setLr] = useState(7.5);
  const [gra, setGra] = useState(7.0);
  const [pr, setPr] = useState(7.0);

  // Timestamp comments
  const [comments, setComments] = useState<TimestampComment[]>([
    { id: 'c1', timeSeconds: 12, text: 'Phát âm ending sound /s/ ở từ "restaurants" rất rõ ràng.' },
    { id: 'c2', timeSeconds: 45, text: 'Dùng cấu trúc "If I had not taken that decision..." rất tự nhiên (Band 7.5 GRA).' },
    { id: 'c3', timeSeconds: 88, text: 'Chú ý ngữ điệu (Intonation) khi ngắt ý, hơi đều giọng.' },
  ]);

  const [newCommentText, setNewCommentText] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState<SpeakingSubmission[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string>('submission-spk-demo-1');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const data = await speakingService.getAdminSubmissions();
        if (data && data.length > 0) {
          setSubmissions(data);
          setSelectedSubId(data[0].id);
        }
      } catch {
        // Fallback default
      }
    };
    fetchSubmissions();
  }, []);

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

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
  };

  const handleJump5 = (delta: number) => {
    setCurrentTime((prev) => Math.max(0, Math.min(duration, prev + delta)));
  };

  const handlePublishGrade = async () => {
    setIsSubmitting(true);
    try {
      await speakingService.gradeSubmission(selectedSubId, {
        fluencyScore: fc,
        lexicalScore: lr,
        grammarScore: gra,
        pronunciationScore: pr,
        feedback: 'Bài nói trôi chảy, phát âm tự nhiên. Cần chú ý ngữ điệu ở những câu dài.',
        timestampComments: comments.map((c) => ({
          timestampSeconds: c.timeSeconds,
          comment: c.text,
        })),
      });
    } catch {
      // Local fallback
    } finally {
      setIsSubmitting(false);
    }
    setSubmittedNotice(`Đã hoàn tất chấm điểm Speaking cho học viên Đỗ Thùy Trang: Overall Band ${overall}!`);
    setTimeout(() => setSubmittedNotice(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-1">
          <Headphones className="w-3.5 h-3.5" />
          <span>Speaking Assessment Studio (BIZ-SP-001)</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Phòng Nghe & Chấm Điểm IELTS Speaking Thủ Công
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Quy tắc chuẩn: 100% Giảng viên trực tiếp nghe và ghim nhận xét theo mốc thời gian Audio.
        </p>
      </div>

      {submittedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{submittedNotice}</span>
        </div>
      )}

      {/* Candidate Overview Card */}
      <div className="p-5 rounded-2xl bg-white border border-line shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-sky-100 text-primary">
            IELTS Speaking Part 2
          </span>
          <h2 className="text-base font-extrabold text-slate-900 mt-1">
            Học viên: Đỗ Thùy Trang (Lớp IELTS Masterclass 7.5+)
          </h2>
          <p className="text-xs text-muted">
            Chủ đề: Describe a memorable journey you have taken in the past year.
          </p>

          {submissions.length > 0 && (
            <div className="mt-2.5 flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-500">Chọn bài nộp:</span>
              <select
                value={selectedSubId}
                onChange={(e) => setSelectedSubId(e.target.value)}
                className="text-xs bg-slate-50 border border-line rounded-lg px-2.5 py-1 font-semibold text-slate-700 focus:outline-none"
              >
                {submissions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.student?.fullName || 'Học viên'} - {s.prompt?.title || 'Speaking Prompt'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 text-right">
          <div>
            <span className="text-[10px] text-muted font-bold uppercase">Estimated Overall Band</span>
            <p className="text-3xl font-black text-primary">{overall.toFixed(1)}</p>
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
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
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

            {/* Interactive Progress Bar */}
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
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleJump5(-5)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold transition"
                >
                  -5s
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition shadow-md shadow-primary/20"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <button
                  onClick={() => handleJump5(5)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold transition"
                >
                  +5s
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Nhấn trực tiếp vào mốc thời gian để ghim nhận xét
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
                placeholder="Nhập nhận xét phát âm / từ vựng tại giây này..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition shadow-sm flex items-center space-x-1"
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
                      onClick={() => handleSeek(c.timeSeconds)}
                      className="px-2 py-0.5 rounded font-mono font-bold bg-sky-100 text-primary hover:bg-sky-200 transition text-[11px] mt-0.5"
                    >
                      ▶ {formatSeconds(c.timeSeconds)}
                    </button>
                    <p className="text-slate-700 leading-relaxed pt-0.5">{c.text}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 4 Criteria Rubric (5 Cols) */}
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
                className="w-full accent-primary"
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
                className="w-full accent-primary"
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
                className="w-full accent-primary"
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
                className="w-full accent-primary"
              />
            </div>

            {/* Overall Summary Box */}
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase">Tổng Điểm Chấm</span>
                <p className="text-xl font-black text-primary">Overall Band {overall.toFixed(1)}</p>
              </div>
              <button
                disabled={isSubmitting}
                onClick={handlePublishGrade}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
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
    </div>
  );
}
