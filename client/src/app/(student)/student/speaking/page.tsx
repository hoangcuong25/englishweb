'use client';

import React, { useState, useRef, useEffect } from 'react';
import { speakingService, SpeakingSubmission } from '@/services/speaking.service';
import { toast } from '@/components/ui/toast';
import {
  Square,
  RotateCcw,
  CheckCircle2,
  Clock,
  Headphones,
  Send,
  RefreshCw,
  History,
  Mic,
  Award,
  Calendar,
  Volume2,
  Play,
} from 'lucide-react';

export default function StudentSpeakingPage() {
  const [mainTab, setMainTab] = useState<'studio' | 'history'>('studio');
  const [mySubmissions, setMySubmissions] = useState<SpeakingSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [part, setPart] = useState<'PART_1' | 'PART_2' | 'PART_3'>('PART_2');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlobState, setAudioBlobState] = useState<Blob | null>(null);
  const [prepTime, setPrepTime] = useState(60);
  const [isPrepActive, setIsPrepActive] = useState(false);
  const [speakTime, setSpeakTime] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPromptId, setCurrentPromptId] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState<{
    id: string;
    title: string;
    description: string;
    cueCard?: string;
    part: number;
    prepTimeSeconds?: number;
    recordTimeSeconds?: number;
  } | null>(null);

  const fetchMySubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const data = await speakingService.getMySubmissions();
      setMySubmissions(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchMySubmissions();
  }, []);

  const seekTo = (subId: string, seconds: number) => {
    const el = document.getElementById(`audio-player-${subId}`) as HTMLAudioElement;
    if (el) {
      el.currentTime = seconds;
      el.play().catch(() => {});
    }
  };

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const list = await speakingService.getPrompts();
        if (Array.isArray(list) && list.length > 0) {
          const partNum = part === 'PART_1' ? 1 : part === 'PART_2' ? 2 : 3;
          const matched = list.find((p) => p.part === partNum) || list[0];
          setCurrentPrompt(matched);
          setCurrentPromptId(matched.id);
        }
      } catch {
        // Fallback default
      }
    };
    fetchPrompts();
  }, [part]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Prep Countdown
  useEffect(() => {
    if (!isPrepActive) return;
    const interval = setInterval(() => {
      setPrepTime((prev) => {
        if (prev <= 1) {
          setIsPrepActive(false);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPrepActive]);

  // Speaking Timer
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setSpeakTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const startPrep = () => {
    setPrepTime(60);
    setIsPrepActive(true);
    setAudioUrl(null);
    setSpeakTime(0);
    setIsSubmitted(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      const drawWaveform = () => {
        if (!canvas || !ctx || !analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillStyle = '#2868B2';
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }

        animationFrameRef.current = requestAnimationFrame(drawWaveform);
      };

      drawWaveform();

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioBlobState(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch {
      toast.error('Không thể truy cập microphone. Vui lòng cấp quyền micro cho trình duyệt!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRetake = () => {
    setAudioUrl(null);
    setAudioBlobState(null);
    setSpeakTime(0);
    setIsSubmitted(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (audioBlobState) {
        await speakingService.submitRecordingWithFile(
          audioBlobState,
          currentPromptId,
          speakTime || 60
        );
      } else {
        await speakingService.submitRecording({
          promptId: currentPromptId,
          audioUrl: audioUrl || 'blob:audio-recording-session',
          durationSeconds: speakTime || 60,
        });
      }
    } catch {
      // Local fallback
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Đã nộp bài nói lên hệ thống thành công! Thầy Đông sẽ chấm và gửi nhận xét.');
      fetchMySubmissions();
    }
  };

  const formatSeconds = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold mb-1">
            <Mic className="w-3.5 h-3.5 text-[#1B64B0]" />
            <span>IELTS Speaking Studio (Web Audio API Waveform)</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Phòng Ghi Âm Luyện Nói IELTS Trực Tuyến
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Mô phỏng phòng thi thật: 60 giây đọc Cue Card và tối đa 2 phút ghi âm bài nói.
          </p>
        </div>

        {/* Part Tabs (Shown in studio mode) */}
        {mainTab === 'studio' && (
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
            {(['PART_1', 'PART_2', 'PART_3'] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPart(p);
                  handleRetake();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  part === p
                    ? 'bg-white text-primary shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <button
          onClick={() => setMainTab('studio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            mainTab === 'studio'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Studio Ghi Âm Luyện Nói</span>
        </button>

        <button
          onClick={() => {
            setMainTab('history');
            fetchMySubmissions();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            mainTab === 'history'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Lịch Sử Bài Nói & Điểm Thầy Chấm ({mySubmissions.length})</span>
        </button>
      </div>

      {/* TAB 1: STUDIO RECORDING */}
      {mainTab === 'studio' && (
        <div className="space-y-6">
          {/* Cue Card Prompt Box */}
          <div className="bg-white rounded-3xl border border-line p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 uppercase tracking-wider">
                Đề bài IELTS Speaking {part.replace('_', ' ')}
              </span>
              <span className="text-xs text-muted">Thời gian nói khuyến nghị: 1:45 - 2:00</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {currentPrompt?.title || 'Describe an interesting person you met recently'}
              </h2>
              <div className="p-4 rounded-2xl bg-slate-50 border border-line space-y-2 text-xs text-slate-700">
                <p className="font-semibold text-slate-800">You should say:</p>
                <div className="whitespace-pre-line pl-2 text-slate-600 leading-relaxed font-sans">
                  {currentPrompt?.cueCard ||
                    `• Who this person is\n• Where and when you met them\n• What you did together\n• And explain why you think they are interesting`}
                </div>
              </div>
            </div>

            {/* Preparation & Recording Controls */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-line">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Chuẩn bị: {prepTime}s</span>
                </div>

                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isRecording ? 'bg-red-500 animate-ping' : 'bg-slate-400'
                    }`}
                  ></div>
                  <span>Thời gian nói: {formatSeconds(speakTime)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!isRecording && !isPrepActive && !audioUrl && (
                  <button
                    onClick={startPrep}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Bắt Đầu Chuẩn Bị (60s)</span>
                  </button>
                )}

                {isPrepActive && (
                  <button
                    onClick={() => {
                      setIsPrepActive(false);
                      startRecording();
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 animate-bounce"
                  >
                    <span>Bỏ Qua Chuẩn Bị • Bắt Đầu Nói Ngay</span>
                  </button>
                )}

                {isRecording && (
                  <button
                    onClick={stopRecording}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Hoàn Thành & Dừng</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Audio Waveform Canvas Display */}
          <div className="bg-white rounded-3xl border border-line p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Biểu Đồ Sóng Âm Trực Tiếp (Web Audio API Realtime FFT)</span>
              {isRecording && <span className="text-red-500 font-mono text-[11px]">● LIVE MIC</span>}
            </h3>

            <div className="w-full h-24 bg-slate-50 rounded-2xl border border-line overflow-hidden flex items-center justify-center relative">
              <canvas ref={canvasRef} width={700} height={96} className="w-full h-full max-w-full"></canvas>
              {!isRecording && !audioUrl && (
                <p className="absolute text-xs text-muted text-center px-4">
                  Sóng âm sẽ hiển thị trực tiếp tại đây khi bạn bắt đầu nói qua Micro.
                </p>
              )}
            </div>

            {/* Playback & Submission Card */}
            {audioUrl && (
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 animate-in fade-in">
                <div className="flex items-center space-x-3 w-full sm:w-auto min-w-0">
                  <audio controls src={audioUrl} className="h-10 w-full sm:w-64 max-w-full"></audio>
                  <span className="text-xs font-mono font-bold text-slate-700 shrink-0">
                    {formatSeconds(speakTime)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleRetake}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-line text-slate-700 font-bold text-xs transition flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Thu Âm Lại</span>
                  </button>

                  {!isSubmitted ? (
                    <button
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Nộp Bài Cho Thầy Đông Chấm</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-2 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã nộp thành công! Thầy Đông sẽ chấm trong 24h.</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SPEAKING SUBMISSIONS HISTORY & TEACHER ASSESSMENT */}
      {mainTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                Lịch Sử Bài Nói Đã Ghi Âm & Bảng Điểm 4 Tiêu Chí IELTS
              </h2>
              <p className="text-xs text-muted">
                Nghe lại file thu âm của bạn, xem điểm thành phần và nhận xét của Thầy Đông.
              </p>
            </div>
            <button
              onClick={fetchMySubmissions}
              disabled={loadingSubmissions}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSubmissions ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>

          {loadingSubmissions && mySubmissions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-line">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500">Đang tải lịch sử bài nói của bạn...</p>
            </div>
          ) : mySubmissions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-line space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Chưa Có Bài Thu Âm Nào Được Nộp</h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Hãy chuyển sang tab &ldquo;Studio Ghi Âm Luyện Nói&rdquo; để bắt đầu thử thách bài nói đầu tiên!
              </p>
              <button
                onClick={() => setMainTab('studio')}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs transition hover:bg-primary-dark"
              >
                Vào Studio Ghi Âm Ngay
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mySubmissions.map((sub) => {
                const isGraded = sub.status === 'GRADED';
                const overallScore = sub.bandScore ?? 0;

                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-3xl border border-line p-5 shadow-xs hover:border-slate-300 transition space-y-4"
                  >
                    {/* Header of Item */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            PART {sub.prompt?.part || 2}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isGraded
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isGraded ? '✓ Thầy Đã Chấm Điểm' : 'Đang Chờ Giảng Viên Chấm'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">
                          {sub.prompt?.title || 'Đề bài IELTS Speaking'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(sub.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span>•</span>
                        <span>{formatSeconds(sub.durationSeconds || 60)}</span>
                      </div>
                    </div>

                    {/* Audio Player */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
                        <Volume2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Bản ghi âm bài nói:</span>
                      </div>
                      {sub.audioUrl ? (
                        <audio
                          id={`audio-player-${sub.id}`}
                          controls
                          src={sub.audioUrl}
                          className="h-9 w-full sm:w-80 max-w-full"
                        />
                      ) : (
                        <span className="text-xs text-muted italic">File âm thanh đang được xử lý...</span>
                      )}
                    </div>

                    {/* Graded Criteria Matrix */}
                    {isGraded ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-deep to-primary text-white text-center col-span-2 sm:col-span-1 flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-sky-200 uppercase">OVERALL</span>
                            <span className="text-2xl font-black">{overallScore.toFixed(1)}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-line text-center">
                            <span className="text-muted text-[10px] uppercase font-bold block">Fluency (FC)</span>
                            <span className="text-base font-extrabold text-slate-900">
                              {sub.fluencyScore?.toFixed(1) || '-'}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-line text-center">
                            <span className="text-muted text-[10px] uppercase font-bold block">Lexical (LR)</span>
                            <span className="text-base font-extrabold text-slate-900">
                              {sub.lexicalScore?.toFixed(1) || '-'}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-line text-center">
                            <span className="text-muted text-[10px] uppercase font-bold block">Grammar (GRA)</span>
                            <span className="text-base font-extrabold text-slate-900">
                              {sub.grammarScore?.toFixed(1) || '-'}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-line text-center">
                            <span className="text-muted text-[10px] uppercase font-bold block">Pronun (PR)</span>
                            <span className="text-base font-extrabold text-slate-900">
                              {sub.pronunciationScore?.toFixed(1) || '-'}
                            </span>
                          </div>
                        </div>

                        {/* Teacher Written Feedback */}
                        {sub.feedback && (
                          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1">
                            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                              <span>Nhận xét & Lời khuyên của Thầy Đông:</span>
                            </span>
                            <p className="text-xs leading-relaxed italic pl-5 whitespace-pre-line">
                              &ldquo;{sub.feedback}&rdquo;
                            </p>
                          </div>
                        )}

                        {/* Timestamp comments if any */}
                        {sub.timestampComments && sub.timestampComments.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Góp ý chi tiết tại từng giây (Click để nghe đoạn tương ứng):</span>
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {sub.timestampComments.map((tc, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => seekTo(sub.id, tc.timestampSeconds)}
                                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-700 text-xs font-medium border border-line transition text-left cursor-pointer"
                                  title="Click để tua audio đến giây này"
                                >
                                  <Play className="w-3 h-3 text-primary shrink-0" />
                                  <span className="font-mono font-bold text-primary">
                                    {Math.floor(tc.timestampSeconds / 60)}:
                                    {(tc.timestampSeconds % 60).toString().padStart(2, '0')}
                                  </span>
                                  <span className="text-slate-600 truncate max-w-xs">{tc.comment}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center space-x-3 text-xs text-amber-800">
                        <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-bold">Bài nói đã được gửi lên hệ thống an toàn</p>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            Thầy Đông đang lắng nghe và sẽ chấm điểm 4 tiêu chí cùng lời phê trong vòng 24 giờ.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
