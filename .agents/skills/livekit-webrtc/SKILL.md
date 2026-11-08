---
name: livekit-webrtc
description: >-
  Kỹ năng tích hợp phòng học trực tuyến WebRTC qua LiveKit SFU (1 Host + 7-8 Students), cấp token phân quyền Host/Student, bảng trắng canvas và LiveKit webhook.
---

# LiveKit WebRTC & Whiteboard Skill

## 1. Cấp Quyền Token (NestJS LiveKit Server SDK)
- **Admin (Host)**:
  - `roomJoin: true`, `roomAdmin: true`
  - `canPublish: true`, `canSubscribe: true`, `canPublishData: true`
  - Quyền mute/kick người tham gia, mở/tắt bảng trắng, chia sẻ màn hình.
- **Student (Participant)**:
  - `roomJoin: true`, `roomAdmin: false`
  - `canPublish: true`, `canSubscribe: true`, `canPublishData: true`
  - Bật/tắt mic/cam cá nhân, giơ tay phát biểu, vẽ bảng trắng khi được Admin cấp quyền.

## 2. Đồng Bộ Nét Vẽ Bảng Trắng Qua DataChannel
- Gửi sự kiện vẽ thời gian thực giữa Host và Học viên bằng `room.localParticipant.publishData()`.
- Định dạng payload:
  ```json
  { "type": "WB_STROKE", "tool": "pen", "color": "#0284c7", "size": 4, "points": [ { "x": 120, "y": 85 }, { "x": 130, "y": 90 } ] }
  ```

## 3. Webhook LiveKit
- Đăng ký endpoint `POST /api/livekit/webhook`.
- Lắng nghe sự kiện `participant_joined`, `participant_left` để ghi nhận thời gian học thực tế.
