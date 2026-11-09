'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Square,
  RotateCcw,
  CheckCircle2,
  Clock,
  Headphones,
  Send,
} from 'lucide-react';

export default function StudentSpeakingPage() {
  const [part, setPart] = useState<'PART_1' | 'PART_2' | 'PART_3'>('PART_2');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [prepTime, setPrepTime] = useState(60);
  const [isPrepActive, setIsPrepActive] = useState(false);
  const [speakTime, setSpeakTime] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const formatSeconds = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Speaking Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-1">
            <Headphones className="w-3.5 h-3.5" />
            <span>IELTS Speaking Studio</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Phòng Thu Âm Luyện Nói & Chấm Điểm Thủ Công 100%
          </h1>
        </div>

        {/* Part selector */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          {(['PART_1', 'PART_2', 'PART_3'] as const).map((p) => (
            <button
              key={p}
              onClick={() => {
                setPart(p);
                setAudioUrl(null);
                setIsSubmitted(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                part === p
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cue Card Prompt */}
        <div className="bg-white rounded-2xl border border-line p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {part === 'PART_2' ? 'IELTS Candidate Cue Card' : 'Discussion Topic'}
            </span>
            <span className="text-[10px] font-bold text-primary bg-sky-50 px-2 py-0.5 rounded">
              {part === 'PART_2' ? '1m Prep • 2m Speaking' : 'Direct Questioning'}
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
              Describe a time when you had to make an important decision in your life.
            </h3>
            <p className="text-xs text-slate-600 font-semibold">You should say:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
              <li>What the decision was and when you made it</li>
              <li>Why this decision was important to you</li>
              <li>What difficulties or dilemmas you faced</li>
              <li>And explain how you felt after making this choice</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <p className="font-bold">Quy tắc chấm điểm (BIZ-SP-001):</p>
            <p className="text-[11px] text-amber-800">
              100% Giảng viên nghe và chấm thủ công 4 tiêu chí (FC, LR, GRA, PR) kèm nhận xét ghim theo mốc thời gian Audio.
            </p>
          </div>
        </div>

        {/* Audio Recording Studio */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-line p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="text-center space-y-3">
            {isPrepActive ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted uppercase">Thời gian chuẩn bị (Prep Time)</span>
                <p className="text-4xl font-extrabold text-amber-500 font-mono animate-pulse">
                  00:{prepTime.toString().padStart(2, '0')}
                </p>
                <p className="text-xs text-slate-500">Hãy chuẩn bị dàn ý. Hệ thống sẽ tự động bắt đầu thu âm khi hết giờ!</p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted uppercase">
                  {isRecording ? 'Đang Thu Âm Trực Tiếp' : 'Thời gian bài nói'}
                </span>
                <p className="text-4xl font-extrabold text-primary font-mono">
                  {formatSeconds(speakTime)}
                </p>
              </div>
            )}

            {/* Audio Waveform Canvas */}
            <div className="w-full h-24 bg-slate-50 rounded-2xl border border-line flex items-center justify-center overflow-hidden relative">
              <canvas
                ref={canvasRef}
                width={500}
                height={96}
                className="w-full h-full"
              />
              {!isRecording && !audioUrl && (
                <span className="text-xs text-muted absolute">
                  Nhấn &quot;Bắt Đầu Chuẩn Bị&quot; để mở micro và hiển thị sóng âm
                </span>
              )}
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {!isRecording && !audioUrl && (
              <button
                onClick={startPrep}
                className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-dark text-slate-900 font-bold text-xs shadow-md transition flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Bắt Đầu Chuẩn Bị (60s)</span>
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-2 animate-bounce"
              >
                <Square className="w-4 h-4" />
                <span>Dừng & Hoàn Thành Bản Thu</span>
              </button>
            )}

            {audioUrl && !isSubmitted && (
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <audio controls src={audioUrl} className="h-10" />
                <button
                  onClick={handleRetake}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Thu âm lại</span>
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition shadow-md shadow-primary/20 flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Nộp Bài Cho Thầy Đông Chấm</span>
                </button>
              </div>
            )}
          </div>

          {/* Submitted Banner */}
          {isSubmitted && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">Đã Nộp Bài Nói Thành Công!</h4>
              <p className="text-xs text-emerald-700">
                Bài ghi âm đã được đưa vào hàng đợi chấm của Thầy Đông. Bạn sẽ nhận được thông báo kèm điểm 4 tiêu chí và các mốc nhận xét timestamp khi Thầy chấm xong.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

