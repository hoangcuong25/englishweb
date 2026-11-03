---
name: livekit-webrtc
description: >-
  Use this skill for LiveKit SFU WebRTC integration, token generation, host/participant role controls, LiveKit webhooks for auto-attendance calculation in minutes, and whiteboard synchronization via DataChannels.
---

# LiveKit WebRTC & Whiteboard Skill

This skill provides step-by-step procedures and technical specifications for the LiveKit WebRTC video classroom and whiteboard functionality.

## 1. LiveKit Token Generation in NestJS

Admin and Student have distinct grants:
- **Admin (Host)**:
  - `roomJoin: true`, `roomAdmin: true`
  - `canPublish: true`, `canSubscribe: true`, `canPublishData: true`
  - Can mute/remove participants, publish audio/video, share screen.
- **Student (Participant)**:
  - `roomJoin: true`, `roomAdmin: false`
  - `canPublish: true`, `canSubscribe: true`, `canPublishData: true`

Example NestJS Token Service:
```typescript
import { AccessToken } from 'livekit-server-sdk';

export function generateToken(roomName: string, identity: string, name: string, role: 'ADMIN' | 'STUDENT') {
  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity,
    name,
  });
  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: role === 'ADMIN',
  });
  return at.toJwt();
}
```

## 2. LiveKit Webhook & Auto Attendance Calculation

LiveKit sends webhook events:
- `participant_joined`: Record join timestamp in `AttendanceRecord`.
- `participant_left`: Record leave timestamp, calculate duration in minutes:
  `durationMinutes = Math.round((leaveTime - joinTime) / 60000)`.
- Status rules:
  - If joined within 15 minutes of scheduled start and duration >= 80% total duration: `PRESENT`.
  - If joined > 15 minutes after start: `LATE`.
  - If not joined or duration < 30%: `ABSENT`.

## 3. Whiteboard Sync via DataChannel

Send drawings or updates across peers without an extra WebSocket server:
```typescript
const encoder = new TextEncoder();
const data = encoder.encode(JSON.stringify({ type: 'WHITEBOARD_STROKE', payload }));
room.localParticipant.publishData(data, { reliable: true });
```
Listen on client:
```typescript
room.on(RoomEvent.DataReceived, (payload, participant) => {
  const data = JSON.parse(new TextDecoder().decode(payload));
  if (data.type === 'WHITEBOARD_STROKE') {
    applyWhiteboardStroke(data.payload);
  }
});
```

## 4. UI Grid Layout (1 Host + 7 Students)
- Admin video tile takes prominent top or primary left view.
- 7 Student video tiles display in a responsive grid.
- Controls bar: Mic, Camera, Screen Share, Raise Hand, Whiteboard Toggle, Leave Room.
