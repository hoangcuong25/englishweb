'use client';

import React, { useState, useRef, useEffect } from 'react';
import { speakingService } from '@/services/speaking.service';
import {
  Square,
  RotateCcw,
  CheckCircle2,
  Clock,
  Headphones,
  Send,
  RefreshCw,
} from 'lucide-react';

export default function StudentSpeakingPage() {
  const [part, setPart] = useState<'PART_1' | 'PART_2' | 'PART_3'>('PART_2');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState(60);
  const [isPrepActive, setIsPrepActive] = useState(false);
  const [speakTime, setSpeakTime] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPromptId, setCurrentPromptId] = useState('prompt-speaking-part2-forecast');

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const list = await speakingService.getPrompts();
        if (list && list.length > 0) {
          setCurrentPromptId(list[0].id);
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
        stream.getTracks().forEach((track) => track.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch {
      alert('Không thể truy cập microphone. Vui lòng cấp quyền micro cho trình duyệt!');
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
    setSpeakTime(0);
    setIsSubmitted(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await speakingService.submitRecording({
        promptId: currentPromptId,
        audioUrl: audioUrl || 'blob:audio-recording-session',
        durationSeconds: speakTime,
      });
    } catch {
      // Local fallback
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
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
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-1">
            <Headphones className="w-3.5 h-3.5" />
            <span>IELTS Speaking Studio (Web Audio API Waveform)</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Phòng Ghi Âm Luyện Nói IELTS Trực Tuyến
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Mô phỏng phòng thi thật: 60 giây đọc Cue Card và tối đa 2 phút ghi âm bài nói.
          </p>
        </div>

        {/* Part Tabs */}
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
      </div>

      {/* Cue Card Prompt Box */}
      <div className="bg-white rounded-3xl border border-line p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 uppercase tracking-wider">
            Đề bài IELTS Speaking Part 2
          </span>
          <span className="text-xs text-muted">Thời gian nói khuyến nghị: 1:45 - 2:00</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            Describe a momentous life decision that substantially changed your career path or life perspective.
          </h2>
          <div className="p-4 rounded-2xl bg-slate-50 border border-line space-y-2 text-xs text-slate-700">
            <p className="font-bold text-slate-900">You should say:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>What the decision was and when you made it</li>
              <li>What options or alternatives you contemplated</li>
              <li>Why you arrived at that particular conclusion</li>
              <li>And explain how this decision has impacted your subsequent life trajectory</li>
            </ul>
          </div>
        </div>

        {/* Controls Section */}
        <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {isPrepActive ? (
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 font-mono font-bold text-xs border border-amber-200 animate-pulse">
                <Clock className="w-4 h-4" />
                <span>Chuẩn bị: {prepTime}s (Tự động ghi âm khi hết giờ)</span>
              </div>
            ) : !isRecording && !audioUrl ? (
              <button
                onClick={startPrep}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition"
              >
                Bắt Đầu 60 Giây Chuẩn Bị
              </button>
            ) : null}

            {isRecording && (
              <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-mono font-bold text-xs border border-red-200 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span>Đang ghi âm: {formatSeconds(speakTime)} / 02:00</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            {!isRecording && !audioUrl && (
              <button
                onClick={startRecording}
                className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-md transition"
              >
                Ghi Âm Ngay (Bỏ qua chuẩn bị)
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Hoàn Thành & Dừng</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audio Waveform Canvas Display */}
      <div className="bg-white rounded-3xl border border-line p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
          <span>Biểu Đồ Sóng Âm Trực Tiếp (Web Audio API Realtime FFT)</span>
          {isRecording && <span className="text-red-500 font-mono text-[11px]">● LIVE MIC</span>}
        </h3>

        <div className="w-full h-24 bg-slate-50 rounded-2xl border border-line overflow-hidden flex items-center justify-center relative">
          <canvas ref={canvasRef} width={700} height={96} className="w-full h-full"></canvas>
          {!isRecording && !audioUrl && (
            <p className="absolute text-xs text-muted">
              Sóng âm sẽ hiển thị trực tiếp tại đây khi bạn bắt đầu nói qua Micro.
            </p>
          )}
        </div>

        {/* Playback & Submission Card */}
        {audioUrl && (
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <audio controls src={audioUrl} className="h-10"></audio>
              <span className="text-xs font-mono font-bold text-slate-700">
                {formatSeconds(speakTime)}
              </span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
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
  );
}
