'use client';

import React, { useState } from 'react';
import {
  Headphones,
  Play,
  Pause,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  Send,
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

  const handlePublishGrade = () => {
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

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Audio Waveform Player & Timestamp Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Custom Teacher Audio Player */}
          <div className="bg-white rounded-2xl border border-line p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Học viên: Đỗ Thùy Trang (HV-0114)
                </h3>
                <p className="text-xs text-muted">Part 2: Describe an Important Life Decision</p>
              </div>
              <span className="text-xs font-mono font-bold text-primary bg-sky-50 px-2.5 py-1 rounded-lg">
                {formatSeconds(currentTime)} / {formatSeconds(duration)}
              </span>
            </div>

            {/* Simulated Waveform Scrubber */}
            <div className="space-y-2">
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  setCurrentTime(Math.round(pos * duration));
                }}
                className="w-full h-16 bg-slate-100 rounded-xl flex items-center px-4 cursor-pointer relative overflow-hidden group"
              >
                {/* Progress fill */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-primary/20 pointer-events-none"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>

                {/* Waveform bars */}
                <div className="w-full flex items-center justify-between space-x-1 h-10 pointer-events-none z-10">
                  {Array.from({ length: 48 }).map((_, i) => {
                    const barHeight = Math.sin(i * 0.4) * 16 + 20;
                    const isPlayed = (i / 48) * duration <= currentTime;
                    return (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition ${
                          isPlayed ? 'bg-primary' : 'bg-slate-300'
                        }`}
                        style={{ height: `${barHeight}px` }}
                      ></div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Player Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleJump5(-5)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
                  title="Lùi 5 giây"
                >
                  -5s
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-dark text-white flex items-center justify-center shadow-md transition"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <button
                  onClick={() => handleJump5(5)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
                  title="Tua 5 giây"
                >
                  +5s
                </button>
              </div>

              {/* Playback speed selector */}
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-muted font-bold">Tốc độ:</span>
                {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-2 py-1 rounded text-xs font-bold transition ${
                      playbackRate === rate
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timestamp Comments Studio */}
          <div className="bg-white rounded-2xl border border-line p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Ghim Nhận Xét Theo Mốc Thời Gian (Timestamp Feedback)</span>
            </h3>

            {/* Input to pin note at current time */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-primary bg-sky-50 px-2 py-0.5 rounded">
                  {formatSeconds(currentTime)}
                </span>
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Gõ nhận xét lỗi phát âm, từ vựng hoặc ngữ pháp tại giây này..."
                  className="w-full pl-24 pr-4 py-2.5 rounded-xl border border-line text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm transition flex items-center space-x-1.5 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ghim Nhận Xét</span>
              </button>
            </form>

            {/* Pinned Comments List */}
            <div className="space-y-2 pt-2">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-50 border border-line hover:border-sky-300 transition flex items-center justify-between gap-3 text-xs"
                >
                  <button
                    onClick={() => handleSeek(c.timeSeconds)}
                    className="flex items-center space-x-3 text-left flex-1"
                  >
                    <span className="font-mono font-bold text-primary bg-sky-100 hover:bg-sky-200 px-2 py-1 rounded transition">
                      {formatSeconds(c.timeSeconds)}
                    </span>
                    <span className="text-slate-800 font-medium">{c.text}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: 4-Criteria Rubric Grading */}
        <div className="bg-white rounded-2xl border border-line p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b border-line pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase">
                Bảng Chấm Điểm 4 Tiêu Chí IELTS
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-extrabold text-slate-900">Overall Band:</span>
                <span className="text-2xl font-extrabold text-amber-500 font-mono">
                  {overall}
                </span>
              </div>
            </div>

            {/* Criterion 1: FC */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Fluency & Coherence (FC)</span>
                <span className="text-primary font-mono">{fc}</span>
              </div>
              <select
                value={fc}
                onChange={(e) => setFc(parseFloat(e.target.value))}
                className="w-full p-2 rounded-xl border border-line text-xs font-bold bg-white"
              >
                {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((v) => (
                  <option key={v} value={v}>Band {v}</option>
                ))}
              </select>
            </div>

            {/* Criterion 2: LR */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Lexical Resource (LR)</span>
                <span className="text-primary font-mono">{lr}</span>
              </div>
              <select
                value={lr}
                onChange={(e) => setLr(parseFloat(e.target.value))}
                className="w-full p-2 rounded-xl border border-line text-xs font-bold bg-white"
              >
                {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((v) => (
                  <option key={v} value={v}>Band {v}</option>
                ))}
              </select>
            </div>

            {/* Criterion 3: GRA */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Grammar & Accuracy (GRA)</span>
                <span className="text-primary font-mono">{gra}</span>
              </div>
              <select
                value={gra}
                onChange={(e) => setGra(parseFloat(e.target.value))}
                className="w-full p-2 rounded-xl border border-line text-xs font-bold bg-white"
              >
                {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((v) => (
                  <option key={v} value={v}>Band {v}</option>
                ))}
              </select>
            </div>

            {/* Criterion 4: PR */}
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Pronunciation (PR)</span>
                <span className="text-primary font-mono">{pr}</span>
              </div>
              <select
                value={pr}
                onChange={(e) => setPr(parseFloat(e.target.value))}
                className="w-full p-2 rounded-xl border border-line text-xs font-bold bg-white"
              >
                {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0].map((v) => (
                  <option key={v} value={v}>Band {v}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handlePublishGrade}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Phát Hành Kết Quả Cho Học Viên</span>
          </button>
        </div>
      </div>
    </div>
  );
}

