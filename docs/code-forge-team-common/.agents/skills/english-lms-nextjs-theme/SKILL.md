---
name: english-lms-nextjs-theme
description: >-
  Use this skill to build Next.js 14+ App Router frontend components, role-based middleware routing (/admin vs /student), light-blue theme styling with Tailwind CSS and shadcn/ui, PDF Viewer, and Audio Player.
---

# Next.js 14 & UI Theme Skill

## 1. Role-based Route Structure
- `/` -> Landing page with course showcases.
- `/(auth)/login` & `/(auth)/register` -> Auth pages.
- `/(student)/student/*` -> Student Portal:
  - `/student/dashboard`: Enrolled courses, upcoming LiveKit classes, study statistics.
  - `/student/courses/[courseId]`: Course syllabus, modules, lessons.
  - `/student/lessons/[lessonId]`: Video/PDF viewer, Audio player, quiz button, speaking recorder.
  - `/student/classroom/[roomId]`: LiveKit WebRTC video room + whiteboard.
- `/(admin)/admin/*` -> Admin Portal:
  - `/admin/dashboard`: Metrics (students count, active classes, submissions needing review).
  - `/admin/courses`: Course CRUD, module & lesson reordering.
  - `/admin/users`: Student management & enrollment.
  - `/admin/speaking`: Submissions queue and grading UI.
  - `/admin/attendance`: Session attendance logs and Excel export.
  - `/admin/classroom/[roomId]`: Host classroom interface with control panel.

## 2. Next.js Middleware Protection
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const role = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/student') && role !== 'STUDENT' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}
```

## 3. Light Blue Theme Configuration (Tailwind CSS)
Primary brand colors:
- Background: `#f8fafc` (slate-50) or `#f0f7ff` (sky-50)
- Brand Primary: `#0284c7` (sky-600) / `#0ea5e9` (sky-500)
- Brand Accent: `#38bdf8` (sky-400)
- Surface/Card: `#ffffff`
- Text Main: `#0f172a` (slate-900)
- Text Muted: `#64748b` (slate-500)
- Success: `#10b981` (emerald-500)
- Warning: `#f59e0b` (amber-500)
- Danger: `#ef4444` (red-500)
