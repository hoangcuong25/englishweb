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
    accentColor: '#0284C7', // Sky Blue 600
    ringColor: 'ring-sky-500',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: Headphones,
    description: 'Master British, American & Australian accents with live audio playback and speed control.',
    criteria: ['Section 1-4 Mastery', 'Distractor Trap Defense', 'Speed Audio 1.25x'],
  },
  {
    id: 'speaking',
    title: 'Speaking Studio',
    shortTitle: 'Speaking',
    tagline: 'Realtime Waveform & Fluency',
    bandTarget: 'Band 8.0+',
    accentColor: '#D97706', // Amber 600
    ringColor: 'ring-amber-500',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Mic,
    description: 'Live studio recording with Web Audio API waveform and timestamped coaching comments.',
    criteria: ['Fluency & Coherence', 'Lexical Resource', 'Pronunciation & Pitch'],
  },
  {
    id: 'reading',
    title: 'Reading Archive',
    shortTitle: 'Reading',
    tagline: 'Academic Scanning & Speed',
    bandTarget: 'Band 9.0',
    accentColor: '#059669', // Emerald 600
    ringColor: 'ring-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: BookOpen,
    description: 'High-speed analytical reading across academic research papers and historical texts.',
    criteria: ['Skimming & Scanning', 'True / False / Not Given', 'Matching Headings'],
  },
  {
    id: 'writing',
    title: 'Writing AI Hub',
    shortTitle: 'Writing AI',
    tagline: 'Instant 4-Criteria Rubric',
    bandTarget: 'Band 8.0+',
    accentColor: '#7C3AED', // Violet 600
    ringColor: 'ring-violet-500',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
    icon: PenTool,
    description: 'Automated evaluation for IELTS Task 1 & 2 with detailed lexical and grammar suggestions.',
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
            background:
              currentSelection === 'listening'
                ? 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.22) 0%, transparent 70%)'
                : currentSelection === 'speaking'
                ? 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.2) 0%, transparent 70%)'
                : currentSelection === 'reading'
                ? 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 70%)'
                : currentSelection === 'writing'
                ? 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 70%)'
                : 'radial-gradient(circle at 50% 50%, rgba(27, 100, 176, 0.18) 0%, rgba(56, 189, 248, 0.12) 40%, transparent 75%)',
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
              <span className="absolute inset-0 rounded-full bg-sky-500/30 animate-ping" />
              <span
                className={`relative flex items-center justify-center w-full h-full rounded-full border-2 transition-all duration-300 shadow-md ${
                  currentSelection === 'listening'
                    ? 'bg-sky-600 text-white border-white scale-115 shadow-sky-400/50'
                    : 'bg-white text-sky-600 border-sky-400 hover:scale-110'
                }`}
              >
                <Headphones className="w-3.5 h-3.5" />
              </span>
            </button>
            {/* Self-contained Inward Label (towards center) */}
            <div
              onClick={() => setActiveSkill('listening')}
              className={`hidden sm:flex items-center gap-1 ml-2 px-2 py-0.5 rounded-lg border transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                currentSelection === 'listening'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-white/90 text-slate-800 border-slate-200 hover:border-sky-300'
              }`}
            >
              <span className="font-extrabold text-[10px] whitespace-nowrap">Listening</span>
              <span className={`text-[8.5px] font-mono font-bold px-1 rounded ${
                currentSelection === 'listening' ? 'bg-sky-800 text-white' : 'bg-sky-50 text-sky-700'
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
              <span className="absolute inset-0 rounded-full bg-amber-500/30 animate-ping" />
              <span
                className={`relative flex items-center justify-center w-full h-full rounded-full border-2 transition-all duration-300 shadow-md ${
                  currentSelection === 'speaking'
                    ? 'bg-amber-500 text-white border-white scale-115 shadow-amber-400/50'
                    : 'bg-white text-amber-600 border-amber-400 hover:scale-110'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
              </span>
            </button>
            {/* Self-contained Inward Label */}
            <div
              onClick={() => setActiveSkill('speaking')}
              className={`hidden sm:flex items-center gap-1 mr-2 px-2 py-0.5 rounded-lg border transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                currentSelection === 'speaking'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-white/90 text-slate-800 border-slate-200 hover:border-amber-300'
              }`}
            >
              <span className="font-extrabold text-[10px] whitespace-nowrap">Speaking</span>
              <span className={`text-[8.5px] font-mono font-bold px-1 rounded ${
                currentSelection === 'speaking' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-800'
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
              <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
              <span
                className={`relative flex items-center justify-center w-full h-full rounded-full border-2 transition-all duration-300 shadow-md ${
                  currentSelection === 'reading'
                    ? 'bg-emerald-600 text-white border-white scale-115 shadow-emerald-400/50'
                    : 'bg-white text-emerald-600 border-emerald-400 hover:scale-110'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
              </span>
            </button>
            {/* Self-contained Inward Label */}
            <div
              onClick={() => setActiveSkill('reading')}
              className={`hidden sm:flex items-center gap-1 ml-2 px-2 py-0.5 rounded-lg border transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                currentSelection === 'reading'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white/90 text-slate-800 border-slate-200 hover:border-emerald-300'
              }`}
            >
              <span className="font-extrabold text-[10px] whitespace-nowrap">Reading</span>
              <span className={`text-[8.5px] font-mono font-bold px-1 rounded ${
                currentSelection === 'reading' ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-800'
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
              <span className="absolute inset-0 rounded-full bg-violet-500/30 animate-ping" />
              <span
                className={`relative flex items-center justify-center w-full h-full rounded-full border-2 transition-all duration-300 shadow-md ${
                  currentSelection === 'writing'
                    ? 'bg-violet-600 text-white border-white scale-115 shadow-violet-400/50'
                    : 'bg-white text-violet-600 border-violet-400 hover:scale-110'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
              </span>
            </button>
            {/* Self-contained Inward Label */}
            <div
              onClick={() => setActiveSkill('writing')}
              className={`hidden sm:flex items-center gap-1 mr-2 px-2 py-0.5 rounded-lg border transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                currentSelection === 'writing'
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                  : 'bg-white/90 text-slate-800 border-slate-200 hover:border-violet-300'
              }`}
            >
              <span className="font-extrabold text-[10px] whitespace-nowrap">Writing AI</span>
              <span className={`text-[8.5px] font-mono font-bold px-1 rounded ${
                currentSelection === 'writing' ? 'bg-violet-800 text-white' : 'bg-violet-50 text-violet-800'
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
              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-left border transition-all duration-200 cursor-pointer shadow-2xs ${isSelected
                ? 'bg-[#1B64B0] text-white border-[#1B64B0] shadow-md shadow-sky-900/15'
                : 'bg-white text-[#14263D] border-[#E2E8F0] hover:border-sky-300 hover:bg-sky-50/50'
                }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold ${isSelected ? 'bg-white/20 text-white' : ''
                  }`}
                style={{
                  backgroundColor: !isSelected ? `${skill.accentColor}18` : undefined,
                  color: !isSelected ? skill.accentColor : undefined,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-bold text-xs leading-tight whitespace-nowrap ${isSelected ? 'text-white' : 'text-[#14263D]'}`}>
                  {skill.shortTitle}
                </p>
                <p
                  className={`text-[10px] font-mono font-semibold whitespace-nowrap ${isSelected ? 'text-sky-100' : ''
                    }`}
                  style={{ color: !isSelected ? skill.accentColor : undefined }}
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
        <div className="mt-3 w-full max-w-[480px] lg:max-w-[520px] p-3.5 rounded-2xl bg-white border border-[#E1EBF5] shadow-lg shadow-sky-900/5 text-[#14263D] transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentSkillData.accentColor }}
              />
              <h4 className="font-extrabold text-sm text-[#14263D] flex items-center gap-1.5">
                {currentSkillData.title}
                <span
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${currentSkillData.accentColor}15`,
                    color: currentSkillData.accentColor,
                  }}
                >
                  {currentSkillData.bandTarget}
                </span>
              </h4>
            </div>
            <span className="text-[11px] text-[#1B64B0] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#1B83B6]" />
              EdTech SFU
            </span>
          </div>

          <p className="text-xs text-[#55687D] mb-2.5 leading-relaxed">{currentSkillData.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {currentSkillData.criteria.map((c, idx) => (
              <span
                key={idx}
                className="text-[10.5px] px-2.5 py-1 rounded-lg bg-[#F7FAFD] text-[#14263D] font-semibold border border-[#E1EBF5] flex items-center gap-1.5"
              >
                <Zap className="w-3 h-3 text-[#1B83B6]" />
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
