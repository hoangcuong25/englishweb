---
name: speaking-recorder-assessment
description: >-
  Use this skill to implement browser-based audio recording with MediaRecorder API, soundwave visualization, audio playback, speaking submission uploads, and the Admin IELTS band scoring and feedback interface.
---

# Speaking Recorder & Assessment Skill

## 1. Browser Recording Workflow (Student)
1. **Request Microphone Access**:
   ```javascript
   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
   ```
2. **Audio Visualizer**:
   - Use `AudioContext` and `AnalyserNode` to draw real-time frequency/waveform bars on an HTML `<canvas>`.
3. **MediaRecorder**:
   ```javascript
   const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
   const audioChunks = [];
   mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
   mediaRecorder.onstop = () => {
     const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
     const audioUrl = URL.createObjectURL(audioBlob);
   };
   ```
4. **Playback & Re-record**:
   - Allow students to listen before submitting.
   - Display countdown/recording timer with min/max duration checks.
5. **Upload**:
   - Send blob via `multipart/form-data` or upload directly to S3/MinIO via Presigned PUT URL.

## 2. Admin Grading Interface
- **Audio Wave Player**: Custom audio player with speed controls (0.75x, 1x, 1.25x), skip 5s, waveform scrubbing.
- **IELTS Criteria Scoring Grid**:
  - Fluency & Coherence (FC)
  - Lexical Resource (LR)
  - Grammatical Range & Accuracy (GRA)
  - Pronunciation (PR)
  - Overall Band Score (0.0 to 9.0 in 0.5 increments).
- **Feedback & Timestamp Comments**:
  - Admin can enter timestamped notes (e.g. `[00:15] Pronunciation of 'comfortable'`).
  - Student receives notification or sees feedback in their speaking dashboard.
