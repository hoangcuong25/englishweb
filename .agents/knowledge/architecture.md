# Knowledge: System Architecture Overview

Kiến trúc kỹ thuật tổng quan Monorepo của dự án **Teacher Dong Academy**.

---

## 1. Mô Hình Tổng Thể

```
+-------------------------------------------------------------------------+
|                                CLIENT                                   |
|   Next.js 14 App Router (React 18, TypeScript, Tailwind CSS, shadcn/ui) |
|   - Multi-language i18n (VI, EN, ZH, JA)                                |
|   - LiveKit Components React (WebRTC Video Room)                        |
|   - Interactive Canvas Whiteboard (DataChannel Sync)                    |
|   - Audio Waveform Visualizer & MediaRecorder (Web Audio API)           |
|   - Secured PDF Viewer & Dynamic Watermark Engine                       |
+------------------------------------+------------------------------------+
                                     |
                                     | REST API / WebSocket (Socket.IO)
                                     v
+-------------------------------------------------------------------------+
|                                SERVER                                   |
|   NestJS Monolith Modular Architecture (TypeScript)                     |
|   - Auth Module: Single Concurrent Session, JWT, Bcrypt, Google OAuth   |
|   - LMS & Materials: S3/Local Storage Presigned URL Signer (15m)        |
|   - LiveKit Module: LiveKit Server SDK Token Minting, Webhook Receiver  |
|   - Speaking Module: Audio Storage, Grading & Timestamp Comments        |
|   - Writing Module: AI API Integration, Word Counter, Admin Review      |
|   - Quiz Engine: Auto Grading, Passing Score Enforcer                   |
|   - Attendance Module: Webhook Parser, Attendance Log, Excel Export     |
|   - Chat Gateway: Socket.IO Realtime Messenger                          |
+--------------------+-------------------------------+--------------------+
                     |                               |
                     v                               v
+-------------------------------+   +------------------------------------+
|         DATABASE              |   |          EXTERNAL SERVICES         |
|   MySQL 8.0 (Prisma ORM)      |   |   - LiveKit SFU Server             |
|   - 2-Role RBAC Model         |   |   - AI Writing Evaluation Engine   |
|   - 11 Modules Relational DDL |   |   - Google OAuth 2.0 Identity      |
+-------------------------------+   +------------------------------------+
```

## 2. Dòng Dữ Liệu Thời Gian Thực (Realtime Pipelines)
1. **Lớp học WebRTC**: Next.js Client kết nối thẳng tới LiveKit SFU Server thông qua WebRTC Media Streams; Trao đổi nét vẽ bảng trắng thông qua LiveKit DataChannels không phụ thuộc server trung gian.
2. **Điểm danh tự động**: LiveKit SFU bắn Webhook HTTP POST về `server/src/core/livekit/webhook` ➔ Server bóc tách sự kiện và cập nhật trực tiếp vào bảng `AttendanceRecord`.
3. **Nhắn tin Chat**: Next.js Client kết nối tới NestJS Socket.IO Gateway ➔ Server xác thực token, lưu tin nhắn vào bảng `Message` và phát sóng (broadcast) tới các bên liên quan trong phòng chat.
