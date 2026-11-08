---
name: speaking-recorder-assessment
description: >-
  Kỹ năng xây dựng studio thu âm giọng nói với hiển thị sóng âm qua Web Audio API và giao diện Admin chấm điểm 4 tiêu chí IELTS Speaking kèm timestamp comments.
---

# Speaking Recorder & Assessment Skill

## 1. Phía Học Viên (Student Audio Recording)
1. Sử dụng `navigator.mediaDevices.getUserMedia({ audio: true })`.
2. Tạo visualizer hiển thị sóng âm thanh thời gian thực trên HTML `<canvas>` qua `AudioContext` và `AnalyserNode`.
3. Ghi âm bằng `MediaRecorder` định dạng `audio/webm` hoặc `audio/mp3`.
4. Cho phép học viên nghe lại, tua audio, thu âm lại và theo dõi giới hạn thời gian (ví dụ 30s - 120s).
5. Nộp bản ghi âm lên server thông qua Multipart form data hoặc S3 Presigned URL.

## 2. Phía Admin (Teacher Grading Studio)
1. **Audio Player Tùy Chỉnh**:
   - Tua nhanh/chậm: 0.75x, 1x, 1.25x, 1.5x, 2x.
   - Nút tua nhanh / lùi 5 giây (`-5s` / `+5s`).
   - Waveform scrubbing giúp chọn mốc phát tức thì.
2. **Chấm Điểm 4 Tiêu Chí IELTS Speaking**:
   - Fluency & Coherence (FC) [0 - 9.0]
   - Lexical Resource (LR) [0 - 9.0]
   - Grammatical Range & Accuracy (GRA) [0 - 9.0]
   - Pronunciation (PR) [0 - 9.0]
   - Overall Band Score (tự động tính trung bình cộng làm tròn 0.5 hoặc nhập tay).
3. **Timestamp Comments**:
   - Thêm ghi chú nhận xét trực tiếp tại mốc giây cụ thể (ví dụ: `00:23 - Chú ý phát âm ending sound /s/`).
   - Học viên khi click vào nhận xét sẽ tự động nhảy đến đúng giây đó trong audio.
