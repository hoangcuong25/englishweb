'use client';

import React, { useState } from 'react';
import {
  PlayCircle,
  Lock,
  CheckCircle2,
  Clock,
  ChevronDown,
} from 'lucide-react';

export default function StudentCoursesPage() {
  const [expandedModule, setExpandedModule] = useState('m1');

  const modules = [
    {
      id: 'm1',
      title: 'Module 01: Foundations of Academic Writing & Lexis',
      lessonsCount: 4,
      isCompleted: true,
      lessons: [
        { id: 'l1', title: 'Lesson 01: IELTS Band Descriptors & Assessment Criteria', duration: '45 phút', isDone: true, isLocked: false },
        { id: 'l2', title: 'Lesson 02: Academic Word List (AWL) Sublist 1 & 2', duration: '50 phút', isDone: true, isLocked: false },
        { id: 'l3', title: 'Lesson 03: Paraphrasing Techniques & Nominalisation', duration: '60 phút', isDone: true, isLocked: false },
        { id: 'l4', title: 'Checkpoint 01: Vocabulary & Collocation Quiz', duration: '20 phút', isDone: true, isLocked: false },
      ],
    },
    {
      id: 'm2',
      title: 'Module 02: Planning, Brainstorming & Essay Structure',
      lessonsCount: 4,
      isCompleted: true,
      lessons: [
        { id: 'l5', title: 'Lesson 04: Idea Generation & Mind Mapping for Abstract Topics', duration: '55 phút', isDone: true, isLocked: false },
        { id: 'l6', title: 'Lesson 05: 4-Paragraph Structure for Opinion & Discussion Essays', duration: '60 phút', isDone: true, isLocked: false },
        { id: 'l7', title: 'Lesson 06: Writing High-Impact Thesis Statements', duration: '45 phút', isDone: true, isLocked: false },
        { id: 'l8', title: 'Checkpoint 02: Essay Architecture Review Quiz', duration: '20 phút', isDone: true, isLocked: false },
      ],
    },
    {
      id: 'm3',
      title: 'Module 03: Paragraph Development & Coherence (Current)',
      lessonsCount: 4,
      isCompleted: false,
      lessons: [
        { id: 'l9', title: 'Lesson 07: Topic Sentences & Supporting Ideas Development', duration: '60 phút', isDone: true, isLocked: false },
        { id: 'l10', title: 'Lesson 08: Inversion & Cleft Sentences for Cohesion (GRA 7.5+)', duration: '50 phút', isDone: true, isLocked: false },
        { id: 'l11', title: 'Lesson 09: Writing Submissions with AI Instant Feedback', duration: '40 phút', isDone: false, isLocked: false },
        { id: 'l12', title: 'Checkpoint 03: End-of-Module Mastery Quiz', duration: '20 phút', isDone: false, isLocked: false },
      ],
    },
    {
      id: 'm4',
      title: 'Module 04: Advanced Lexical Flexibility & Counter-arguments',
      lessonsCount: 3,
      isCompleted: false,
      isLocked: true, // Will unlock upon completing Checkpoint 03 (BIZ-QZ-003)
      lessons: [
        { id: 'l13', title: 'Lesson 10: Addressing Counter-arguments & Rebuttals', duration: '60 phút', isDone: false, isLocked: true },
        { id: 'l14', title: 'Lesson 11: C1/C2 Academic Precision in Writing', duration: '55 phút', isDone: false, isLocked: true },
        { id: 'l15', title: 'Checkpoint 04: Comprehensive Mock Assessment', duration: '30 phút', isDone: false, isLocked: true },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Lộ Trình Khóa Học (LMS 4 Cấp Độ)
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Cấu trúc chuẩn: Course ➔ Module ➔ Lesson ➔ Components.
        </p>
      </div>

      {/* Active Course Banner */}
      <div className="bg-white rounded-2xl border border-line p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded bg-sky-100 text-primary uppercase">
              Khóa Học Đang Theo Học
            </span>
            <span className="text-xs text-muted">Giảng viên: Thầy Đông (IELTS 8.5)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
            IELTS Masterclass 7.5+ Intensive (Writing & Speaking Focus)
          </h2>
          <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
            <span>4 Modules</span>
            <span>•</span>
            <span>15 Bài học</span>
            <span>•</span>
            <span>4 Quiz Checkpoints</span>
            <span>•</span>
            <span className="font-bold text-primary">Tiến độ: 68%</span>
          </div>
        </div>

        <div className="w-full md:w-48 bg-slate-100 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: '68%' }}></div>
        </div>
      </div>

      {/* Curriculum Accordion (Modules & Lessons) */}
      <div className="space-y-4">
        {modules.map((mod, idx) => {
          const isExpanded = expandedModule === mod.id;

          return (
            <div
              key={mod.id}
              className={`rounded-2xl border transition bg-white overflow-hidden shadow-sm ${
                mod.isLocked ? 'opacity-75 border-slate-200' : 'border-line'
              }`}
            >
              {/* Module Header Bar */}
              <button
                onClick={() => !mod.isLocked && setExpandedModule(isExpanded ? '' : mod.id)}
                className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50/50 transition"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      mod.isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : mod.isLocked
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-primary text-white'
                    }`}
                  >
                    {mod.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : mod.isLocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{mod.title}</h3>
                    <p className="text-[11px] text-muted">
                      {mod.lessonsCount} bài học & bài kiểm tra Checkpoint
                      {mod.isLocked && ' • (Yêu cầu đạt $\\ge 70\\%$ Checkpoint 03 để mở khóa)'}
                    </p>
                  </div>
                </div>

                {!mod.isLocked && (
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Lessons List */}
              {isExpanded && !mod.isLocked && (
                <div className="px-5 pb-5 space-y-2 border-t border-line/60 pt-3">
                  {mod.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-3.5 rounded-xl border border-line bg-slate-50/50 hover:bg-white hover:border-primary/40 transition flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        {lesson.isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <PlayCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-slate-800">{lesson.title}</p>
                          <span className="text-[11px] text-muted flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{lesson.duration}</span>
                          </span>
                        </div>
                      </div>

                      <button className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-sm transition">
                        {lesson.isDone ? 'Học Lại' : 'Bắt Đầu Học'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

