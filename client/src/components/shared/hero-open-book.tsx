'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Headphones,
  Mic,
  BookOpen,
  PenTool,
  Zap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export type IELTSSkillType = 'listening' | 'speaking' | 'reading' | 'writing';

interface SkillInfo {
  id: IELTSSkillType;
  title: string;
  shortTitle: string;
  tagline: string;
  bandTarget: string;
  accentColor: string;
  ringColor: string;
  badgeBg: string;
  icon: React.ElementType;
  description: string;
  criteria: string[];
}

const IELTS_SKILLS: SkillInfo[] = [
  {
    id: 'listening',
    title: 'Listening Lab',
    shortTitle: 'Listening',
    tagline: 'Acoustic SFU & Accents',
    bandTarget: 'Band 8.5+',
    accentColor: '#1B64B0',
    ringColor: 'ring-sky-500',
    badgeBg: 'bg-sky-50 text-[#1B64B0] border-sky-200',
    icon: Headphones,
    description: 'Luyện nghe chuẩn Cambridge với đa dạng ngữ điệu Anh - Mỹ - Úc, kiểm soát tốc độ phát thanh linh hoạt.',
    criteria: ['Section 1-4 Mastery', 'Distractor Trap Defense', 'Speed Audio 1.25x'],
  },
  {
    id: 'speaking',
    title: 'Speaking Studio',
    shortTitle: 'Speaking',
    tagline: 'Realtime Waveform & Fluency',
    bandTarget: 'Band 8.0+',
    accentColor: '#1B64B0',
    ringColor: 'ring-sky-500',
    badgeBg: 'bg-sky-50 text-[#1B64B0] border-sky-200',
    icon: Mic,
    description: 'Studio thu âm trực tuyến hiển thị trực quan dạng sóng âm qua Web Audio API kèm nhận xét timestamp chi tiết.',
    criteria: ['Fluency & Coherence', 'Lexical Resource', 'Pronunciation & Pitch'],
  },
  {
    id: 'reading',
    title: 'Reading Archive',
    shortTitle: 'Reading',
    tagline: 'Academic Scanning & Speed',
    bandTarget: 'Band 9.0',
    accentColor: '#1B64B0',
    ringColor: 'ring-sky-500',
    badgeBg: 'bg-sky-50 text-[#1B64B0] border-sky-200',
    icon: BookOpen,
    description: 'Luyện kỹ năng đọc lướt, quét thông tin và chiến lược xử lý các dạng bài Academic khó nhất trong 60 phút.',
    criteria: ['Skimming & Scanning', 'True / False / Not Given', 'Matching Headings'],
  },
  {
    id: 'writing',
    title: 'Writing AI Hub',
    shortTitle: 'Writing AI',
    tagline: 'Instant 4-Criteria Rubric',
    bandTarget: 'Band 8.0+',
    accentColor: '#1B64B0',
    ringColor: 'ring-sky-500',
    badgeBg: 'bg-sky-50 text-[#1B64B0] border-sky-200',
    icon: PenTool,
    description: 'Hệ thống AI chấm IELTS Writing Task 1 & 2 tức thì theo 4 tiêu chí chuẩn quốc tế TR, CC, LR và GRA.',
    criteria: ['Task Achievement', 'Coherence & Cohesion', 'Grammatical Accuracy'],
  },
];

export default function HeroOpenBook() {
  const [activeSkill, setActiveSkill] = useState<IELTSSkillType | null>('speaking');
  const [hoveredSkill, setHoveredSkill] = useState<IELTSSkillType | null>(null);

  const currentSelection = hoveredSkill || activeSkill;
  const currentSkillData = IELTS_SKILLS.find((s) => s.id === currentSelection);

  return (
    <div className="w-full flex flex-col items-center overflow-hidden">
      {/* 3D Diorama Stage Container - Strictly contained without negative margins */}
      <div className="relative w-full max-w-[480px] lg:max-w-[520px] select-none py-2">
        {/* Soft Ambient Sky-Blue Glow behind the floating diorama */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-60 transition-all duration-700 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(27, 100, 176, 0.22) 0%, rgba(56, 189, 248, 0.12) 40%, transparent 75%)',
          }}
        />

        {/* Realistic Physical Ground Contact Shadow under the Pedestal */}
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[85%] h-12 rounded-full blur-xl opacity-35 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(15, 23, 42, 0.45) 0%, transparent 70%)' }}
        />

        {/* Core Transparent 3D Open Book Diorama Frame */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center">
          <Image
            src="/images/hero-diorama-book-clean.png"
            alt="Teacher Dong Academy - 3D IELTS Open Book Architectural Diorama"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 520px"
            className="object-contain object-center drop-shadow-[0_16px_30px_rgba(27,100,176,0.15)] transition-transform duration-500 hover:scale-[1.01]"
          />

          {/* Floating Holographic Academy Emblem over Central Dome */}
          <div className="absolute top-[2%] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#BBDDF5] shadow-[0_4px_16px_rgba(27,100,176,0.12)] text-[#1B64B0]">
              <span className="w-2 h-2 rounded-full bg-[#1B64B0] animate-pulse" />
              <span className="text-[10.5px] font-black tracking-wider uppercase">
                TEACHER DONG ACADEMY
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-[#DDF3FC] text-[#1B64B0] rounded-full font-mono font-bold">
                8.0+
              </span>
            </div>
            <div className="w-[1.5px] h-4 bg-gradient-to-b from-[#1B64B0]/60 to-transparent" />
          </div>

          {/* Interactive Target Reticles & Self-Contained HUD Badges ON the Diorama */}

          {/* 1. Listening Pavilion (Back-Left) */}
          <div className="absolute top-[34%] left-[28%] z-20 -translate-x-1/2 -translate-y-1/2 flex items-center">
            <button
              type="button"
              onClick={() => setActiveSkill('listening')}
              onMouseEnter={() => setHoveredSkill('listening')}
              onMouseLeave={() => setHoveredSkill(null)}
              className="relative w-7 h-7 sm:w-8 sm:h-8 group/pin cursor-pointer focus:outline-none"
              aria-label="Listening Pavilion"
            >
              <span className="absolute inset-0 rounded-full bg-[#1B64B0]/25 animate-ping" />
              <span
                className={`relative flex items-center justify-center w-full h-full rounded-full border-2 transition-all duration-300 shadow-md ${
                  currentSelection === 'listening'
                    ? 'bg-[#1B64B0] text-white border-white scale-115 shadow-[#1B64B0]/40'
                    : 'bg-white text-[#1B64B0] border-[#BBDDF5] hover:scale-110'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
              </span>
            </button>
            {/* Self-contained Inward Label (towards center) */}
            <div
              onClick={() => setActiveSkill('listening')}
              className={`hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-xl border transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                currentSelection === 'listening'
                  ? 'bg-[#1B64B0] text-white border-[#1B64B0] shadow-sm'
                  : 'bg-white/95 text-slate-800 border-slate-200 hover:border-[#1B64B0]'
              }`}
            >
              <span className="font-extrabold text-[10.5px] whitespace-nowrap">Listening</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                currentSelection === 'listening' ? 'bg-sky-950/40 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                8.5+
              </span>
            </div>
          </div>

          {/* 2. Speaking Observatory Dome (Central-Right) */}
          <div className="absolute top-[32%] right-[32%] z-20 translate-x-1/2 -translate-y-1/2 flex items-center flex-row-reverse">
            <button
              type="button"
              onClick={() => setActiveSkill('speaking')}
              onMouseEnter={() => setHoveredSkill('speaking')}
              onMouseLeave={() => setHoveredSkill(null)}
              className="relative w-7 h-7 sm:w-8 sm:h-8 group/pin cursor-pointer focus:outline-none"
              aria-label="Speaking Dome"
            >
              <span className="absolute inset-0 rounded-full bg-[#1B64B0]/25 animate-ping" />
              <span
                className={`relative flex items-center justify-center w-full h-full rounded-full border-2 transition-all duration-300 shadow-md ${
                  currentSelection === 'speaking'
                    ? 'bg-[#1B64B0] text-white border-white scale-115 shadow-[#1B64B0]/40'
                    : 'bg-white text-[#1B64B0] border-[#BBDDF5] hover:scale-110'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
              </span>
            </button>
            {/* Self-contained Inward Label */}
            <div
              onClick={() => setActiveSkill('speaking')}
              className={`hidden sm:flex items-center gap-1.5 mr-2 px-2.5 py-1 rounded-xl border transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                currentSelection === 'speaking'
                  ? 'bg-[#1B64B0] text-white border-[#1B64B0] shadow-sm'
                  : 'bg-white/95 text-slate-800 border-slate-200 hover:border-[#1B64B0]'
              }`}
            >
              <span className="font-extrabold text-[10.5px] whitespace-nowrap">Speaking</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                currentSelection === 'speaking' ? 'bg-sky-950/40 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                8.0+
              </span>
            </div>
          </div>

          {/* 3. Reading Pavilion (Front-Left Page) */}
          <div className="absolute top-[50%] left-[26%] z-20 -translate-x-1/2 -translate-y-1/2 flex items-center">
            <button
              type="button"
              onClick={() => setActiveSkill('reading')}
              onMouseEnter={() => setHoveredSkill('reading')}
              onMouseLeave={() => setHoveredSkill(null)}
              className="relative w-7 h-7 sm:w-8 sm:h-8 group/pin cursor-pointer focus:outline-none"
              aria-label="Reading Pavilion"
            >
              <span className="absolute inset-0 rounded-full bg-[#1B64B0]/25 animate-ping" />
              <span
                className={`relative flex items-center justify-center w-full h-full rounded-full border-2 transition-all duration-300 shadow-md ${
                  currentSelection === 'reading'
                    ? 'bg-[#1B64B0] text-white border-white scale-115 shadow-[#1B64B0]/40'
                    : 'bg-white text-[#1B64B0] border-[#BBDDF5] hover:scale-110'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
              </span>
            </button>
            {/* Self-contained Inward Label */}
            <div
              onClick={() => setActiveSkill('reading')}
              className={`hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-xl border transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                currentSelection === 'reading'
                  ? 'bg-[#1B64B0] text-white border-[#1B64B0] shadow-sm'
                  : 'bg-white/95 text-slate-800 border-slate-200 hover:border-[#1B64B0]'
              }`}
            >
              <span className="font-extrabold text-[10.5px] whitespace-nowrap">Reading</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                currentSelection === 'reading' ? 'bg-sky-950/40 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                9.0
              </span>
            </div>
          </div>

          {/* 4. Writing AI Pavilion (Front-Right Page) */}
          <div className="absolute top-[56%] right-[30%] z-20 translate-x-1/2 -translate-y-1/2 flex items-center flex-row-reverse">
            <button
              type="button"
              onClick={() => setActiveSkill('writing')}
              onMouseEnter={() => setHoveredSkill('writing')}
              onMouseLeave={() => setHoveredSkill(null)}
              className="relative w-7 h-7 sm:w-8 sm:h-8 group/pin cursor-pointer focus:outline-none"
              aria-label="Writing AI Pavilion"
            >
              <span className="absolute inset-0 rounded-full bg-[#1B64B0]/25 animate-ping" />
              <span
                className={`relative flex items-center justify-center w-full h-full rounded-full border-2 transition-all duration-300 shadow-md ${
                  currentSelection === 'writing'
                    ? 'bg-[#1B64B0] text-white border-white scale-115 shadow-[#1B64B0]/40'
                    : 'bg-white text-[#1B64B0] border-[#BBDDF5] hover:scale-110'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
              </span>
            </button>
            {/* Self-contained Inward Label */}
            <div
              onClick={() => setActiveSkill('writing')}
              className={`hidden sm:flex items-center gap-1.5 mr-2 px-2.5 py-1 rounded-xl border transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                currentSelection === 'writing'
                  ? 'bg-[#1B64B0] text-white border-[#1B64B0] shadow-sm'
                  : 'bg-white/95 text-slate-800 border-slate-200 hover:border-[#1B64B0]'
              }`}
            >
              <span className="font-extrabold text-[10.5px] whitespace-nowrap">Writing AI</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                currentSelection === 'writing' ? 'bg-sky-950/40 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                8.0+
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 4-Skills Selector Tabs (Clean Light-Mode UI - 100% Contained) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1 w-full max-w-[480px] lg:max-w-[520px]">
        {IELTS_SKILLS.map((skill) => {
          const Icon = skill.icon;
          const isSelected = currentSelection === skill.id;

          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => setActiveSkill(skill.id)}
              onMouseEnter={() => setHoveredSkill(skill.id)}
              onMouseLeave={() => setHoveredSkill(null)}
              className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-left border transition-all duration-200 cursor-pointer shadow-2xs select-none active:scale-[0.98] ${
                isSelected
                  ? 'bg-[#1B64B0] text-white border-[#1B64B0] shadow-md shadow-sky-900/15'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isSelected
                    ? 'text-white'
                    : 'text-slate-400 group-hover:text-[#1B64B0]'
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className={`font-bold text-xs leading-tight whitespace-nowrap ${isSelected ? 'text-white' : 'text-slate-900 group-hover:text-[#1B64B0]'}`}>
                  {skill.shortTitle}
                </p>
                <p
                  className={`text-[10px] font-mono font-semibold whitespace-nowrap mt-0.5 ${
                    isSelected ? 'text-sky-100' : 'text-slate-400'
                  }`}
                >
                  {skill.bandTarget}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Skill Criteria Card (Light Card with Teacher Dong Slate / Sky Tokens) */}
      {currentSkillData && (
        <div className="mt-3 w-full max-w-[480px] lg:max-w-[520px] p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-800 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B64B0]" />
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                {currentSkillData.title}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-50 text-[#1B64B0] border border-sky-100">
                  {currentSkillData.bandTarget}
                </span>
              </h4>
            </div>
            <span className="text-[11px] text-[#1B64B0] font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#1B64B0]" />
              EdTech SFU
            </span>
          </div>

          <p className="text-xs text-slate-600 mb-2.5 leading-relaxed">{currentSkillData.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {currentSkillData.criteria.map((c, idx) => (
              <span
                key={idx}
                className="text-[10.5px] px-2.5 py-1 rounded-lg bg-white text-slate-700 font-semibold border border-slate-200 flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1B64B0]" />
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
