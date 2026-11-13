import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') ||
  'http://localhost:3001';

let chatSocket: Socket | null = null;
let notificationsSocket: Socket | null = null;
let whiteboardSocket: Socket | null = null;

/**
 * Get or create Chat Socket (/chat namespace)
 */
export function getChatSocket(): Socket {
  if (!chatSocket) {
    chatSocket = io(`${SOCKET_SERVER_URL}/chat`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  if (!chatSocket.connected) {
    chatSocket.connect();
  }
  return chatSocket;
}

/**
 * Get or create Notifications Socket (/notifications namespace)
 */
export function getNotificationsSocket(): Socket {
  if (!notificationsSocket) {
    notificationsSocket = io(`${SOCKET_SERVER_URL}/notifications`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  if (!notificationsSocket.connected) {
    notificationsSocket.connect();
  }
  return notificationsSocket;
}

/**
 * Get or create Whiteboard Socket (/whiteboard namespace)
 */
export function getWhiteboardSocket(): Socket {
  if (!whiteboardSocket) {
    whiteboardSocket = io(`${SOCKET_SERVER_URL}/whiteboard`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  if (!whiteboardSocket.connected) {
    whiteboardSocket.connect();
  }
  return whiteboardSocket;
}

/**
 * Disconnect all active sockets (e.g. on logout)
 */
export function disconnectAllSockets() {
  if (chatSocket) {
    chatSocket.disconnect();
    chatSocket = null;
  }
  if (notificationsSocket) {
    notificationsSocket.disconnect();
    notificationsSocket = null;
  }
  if (whiteboardSocket) {
    whiteboardSocket.disconnect();
    whiteboardSocket = null;
  }
}
