'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  Square,
  Minus,
  RotateCcw,
  Trash2,
  Download,
  Lock,
  Unlock,
  Check,
} from 'lucide-react';

export interface Point {
  x: number;
  y: number;
}

export interface WhiteboardStroke {
  id: string;
  tool: 'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'line';
  color: string;
  width: number;
  points: Point[];
}

interface WhiteboardProps {
  isHost: boolean;
  canDraw?: boolean;
  onStrokeComplete?: (stroke: WhiteboardStroke) => void;
  onClearBoard?: () => void;
  onToggleStudentDraw?: (allowed: boolean) => void;
  remoteStrokes?: WhiteboardStroke[];
  allowStudentDrawing?: boolean;
}

const COLORS = [
  '#0f172a', // Slate 900
  '#0284c7', // Sky 600
  '#10b981', // Emerald 500
  '#ef4444', // Red 500
  '#f59e0b', // Amber 500
  '#8b5cf6', // Violet 500
];

const STROKE_WIDTHS = [
  { label: 'Nhỏ', value: 2 },
  { label: 'Vừa', value: 5 },
  { label: 'Lớn', value: 10 },
];

export const Whiteboard: React.FC<WhiteboardProps> = ({
  isHost,
  canDraw = true,
  onStrokeComplete,
  onClearBoard,
  onToggleStudentDraw,
  remoteStrokes = [],
  allowStudentDrawing = true,
}) => {
  // Dual-Canvas Architecture
  // 1. bgCanvas: Background layer (grid + committed permanent strokes)
  // 2. fgCanvas: Active foreground scratchpad (current active drawing stroke only, 60fps)
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active tool settings
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'line'>('pen');
  const [color, setColor] = useState<string>('#0284c7');
  const [width, setWidth] = useState<number>(4);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);

  // High performance drawing refs (outside React State to avoid re-renders)
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<Point[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  const isDrawingAllowed = isHost || (canDraw && allowStudentDrawing);

  // Helper: Draw a single stroke with Quadratic Bézier smoothing
  const drawStrokeToContext = useCallback(
    (ctx: CanvasRenderingContext2D, stroke: WhiteboardStroke) => {
      const { tool: stTool, color: stColor, width: stWidth, points: pts } = stroke;
      if (!pts || pts.length === 0) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stTool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = stWidth * 3.5;
      } else if (stTool === 'highlighter') {
        ctx.strokeStyle = stColor;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = stWidth * 2.5;
      } else {
        ctx.strokeStyle = stColor;
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = stWidth;
      }

      if (stTool === 'rectangle' && pts.length >= 2) {
        const start = pts[0];
        const end = pts[pts.length - 1];
        ctx.beginPath();
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (stTool === 'line' && pts.length >= 2) {
        const start = pts[0];
        const end = pts[pts.length - 1];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      } else if (pts.length === 1) {
        // Single tap dot
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, stWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = stColor;
        ctx.fill();
      } else if (pts.length === 2) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.stroke();
      } else {
        // Quadratic Bézier curve smoothing for 60fps natural handwriting
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);

        for (let i = 1; i < pts.length - 1; i++) {
          const midX = (pts[i].x + pts[i + 1].x) / 2;
          const midY = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
        }

        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }

      ctx.restore();
    },
    []
  );

  // Redraw the entire background canvas (only on resize, clear, or remote sync)
  const redrawBackground = useCallback(
    (strokeList: WhiteboardStroke[]) => {
      const bgCanvas = bgCanvasRef.current;
      if (!bgCanvas) return;
      const ctx = bgCanvas.getContext('2d');
      if (!ctx) return;

      // 1. Clear & draw background
      ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

      // 2. Subtle classroom grid
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      const gridSize = 32;
      ctx.beginPath();
      for (let x = 0; x < bgCanvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, bgCanvas.height);
      }
      for (let y = 0; y < bgCanvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(bgCanvas.width, y);
      }
      ctx.stroke();

      // 3. Draw all committed strokes
      strokeList.forEach((st) => drawStrokeToContext(ctx, st));
    },
    [drawStrokeToContext]
  );

  // Synchronize remote strokes from LiveKit DataChannel
  useEffect(() => {
    if (remoteStrokes) {
      setStrokes(remoteStrokes);
      redrawBackground(remoteStrokes);
    }
  }, [remoteStrokes, redrawBackground]);

  // Handle Resize: match container size
  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const fgCanvas = fgCanvasRef.current;
    if (!bgCanvas || !fgCanvas) return;

    const updateSize = () => {
      const parent = bgCanvas.parentElement;
      if (!parent) return;

      const width = parent.clientWidth;
      const height = parent.clientHeight;

      if (bgCanvas.width !== width || bgCanvas.height !== height) {
        bgCanvas.width = width;
        bgCanvas.height = height;
        fgCanvas.width = width;
        fgCanvas.height = height;
        redrawBackground(strokes);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [strokes, redrawBackground]);

  // Coordinate helper
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): Point | null => {
    const fgCanvas = fgCanvasRef.current;
    if (!fgCanvas) return null;
    const rect = fgCanvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Render the current stroke on the active foreground scratchpad canvas
  const renderActiveStroke = () => {
    const fgCanvas = fgCanvasRef.current;
    if (!fgCanvas) return;
    const ctx = fgCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);

    if (currentPointsRef.current.length > 0) {
      const tempStroke: WhiteboardStroke = {
        id: 'active',
        tool,
        color,
        width,
        points: currentPointsRef.current,
      };
      drawStrokeToContext(ctx, tempStroke);
    }
  };

  // Mouse Down: Start drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingAllowed) return;
    const pt = getCanvasCoordinates(e);
    if (!pt) return;

    isDrawingRef.current = true;
    currentPointsRef.current = [pt];
    renderActiveStroke();
  };

  // Mouse Move: Throttled by Distance (>= 3px) & requestAnimationFrame
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isDrawingAllowed) return;
    const pt = getCanvasCoordinates(e);
    if (!pt) return;

    const pts = currentPointsRef.current;
    const lastPt = pts[pts.length - 1];

    if (lastPt) {
      // Distance thresholding: skip redundant points within 3 pixels
      const dx = pt.x - lastPt.x;
      const dy = pt.y - lastPt.y;
      if (dx * dx + dy * dy < 9 && tool !== 'rectangle' && tool !== 'line') {
        return;
      }
    }

    if (tool === 'rectangle' || tool === 'line') {
      // Shape tools only keep start point and current point
      currentPointsRef.current = [pts[0], pt];
    } else {
      currentPointsRef.current.push(pt);
    }

    // Schedule 60fps render on scratchpad canvas via requestAnimationFrame
    if (!animFrameIdRef.current) {
      animFrameIdRef.current = requestAnimationFrame(() => {
        renderActiveStroke();
        animFrameIdRef.current = null;
      });
    }
  };

  // Mouse Up: Commit stroke to Background Canvas & notify LiveKit DataChannel
  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    const pts = [...currentPointsRef.current];
    currentPointsRef.current = [];

    // Clear active scratchpad canvas
    const fgCanvas = fgCanvasRef.current;
    if (fgCanvas) {
      const fgCtx = fgCanvas.getContext('2d');
      fgCtx?.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
    }

    if (pts.length > 0) {
      const newStroke: WhiteboardStroke = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        tool,
        color,
        width,
        points: pts,
      };

      // 1. Immediately paint onto background canvas
      const bgCanvas = bgCanvasRef.current;
      if (bgCanvas) {
        const bgCtx = bgCanvas.getContext('2d');
        if (bgCtx) {
          drawStrokeToContext(bgCtx, newStroke);
        }
      }

      // 2. Update state for history / undo
      setStrokes((prev) => [...prev, newStroke]);

      // 3. Broadcast to LiveKit DataChannel
      onStrokeComplete?.(newStroke);
    }
  };

  // Actions
  const handleClear = () => {
    setStrokes([]);
    currentPointsRef.current = [];

    const fgCanvas = fgCanvasRef.current;
    if (fgCanvas) {
      const fgCtx = fgCanvas.getContext('2d');
      fgCtx?.clearRect(0, 0, fgCanvas.width, fgCanvas.height);
    }

    redrawBackground([]);
    onClearBoard?.();
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const newStrokes = strokes.slice(0, strokes.length - 1);
    setStrokes(newStrokes);
    redrawBackground(newStrokes);
  };

  const handleDownload = () => {
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;
    const image = bgCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `teacher-dong-whiteboard-${Date.now()}.png`;
    link.href = image;
    link.click();
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 select-none">
      {/* Top Floating Whiteboard Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-sky-100">
        {/* Tool Selector */}
        <div className="flex items-center space-x-1 border-r border-slate-200 pr-3">
          <button
            type="button"
            onClick={() => setTool('pen')}
            className={`p-2 rounded-xl text-sm font-medium transition cursor-pointer ${
              tool === 'pen' ? 'bg-sky-100 text-sky-700 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Bút vẽ (Pen)"
            disabled={!isDrawingAllowed}
          >
            <Pen className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTool('highlighter')}
            className={`p-2 rounded-xl text-sm font-medium transition cursor-pointer ${
              tool === 'highlighter' ? 'bg-sky-100 text-sky-700 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Bút dạ quang (Highlighter)"
            disabled={!isDrawingAllowed}
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTool('rectangle')}
            className={`p-2 rounded-xl text-sm font-medium transition cursor-pointer ${
              tool === 'rectangle' ? 'bg-sky-100 text-sky-700 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Hình chữ nhật"
            disabled={!isDrawingAllowed}
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTool('line')}
            className={`p-2 rounded-xl text-sm font-medium transition cursor-pointer ${
              tool === 'line' ? 'bg-sky-100 text-sky-700 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Đường thẳng"
            disabled={!isDrawingAllowed}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-xl text-sm font-medium transition cursor-pointer ${
              tool === 'eraser' ? 'bg-amber-100 text-amber-700 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Tẩy xóa (Eraser)"
            disabled={!isDrawingAllowed}
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center space-x-1.5 border-r border-slate-200 pr-3">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full border-2 transition relative flex items-center justify-center cursor-pointer"
              style={{
                backgroundColor: c,
                borderColor: color === c ? '#0284c7' : 'transparent',
              }}
              title={c}
              disabled={!isDrawingAllowed}
            >
              {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
            </button>
          ))}
        </div>

        {/* Width Selector */}
        <div className="flex items-center space-x-1 border-r border-slate-200 pr-3">
          {STROKE_WIDTHS.map((sw) => (
            <button
              type="button"
              key={sw.value}
              onClick={() => setWidth(sw.value)}
              className={`px-2.5 py-1 text-xs rounded-lg transition font-medium cursor-pointer ${
                width === sw.value ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
              disabled={!isDrawingAllowed}
            >
              {sw.label}
            </button>
          ))}
        </div>

        {/* Actions (Undo, Clear, Download, Host Lock) */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleUndo}
            disabled={strokes.length === 0 || !isDrawingAllowed}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition disabled:opacity-40 cursor-pointer"
            title="Hoàn tác (Undo)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={strokes.length === 0 || !isDrawingAllowed}
            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition disabled:opacity-40 cursor-pointer"
            title="Xóa trắng bảng"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Lưu ảnh bảng trắng (.png)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Admin Host control for student drawing */}
          {isHost && (
            <button
              type="button"
              onClick={() => onToggleStudentDraw?.(!allowStudentDrawing)}
              className={`ml-2 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                allowStudentDrawing
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
              title="Quyền vẽ của học viên"
            >
              {allowStudentDrawing ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Học viên được vẽ</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Đã khóa học viên vẽ</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Permission banner for student */}
      {!isHost && !allowStudentDrawing && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-amber-500/90 text-white rounded-full text-xs font-semibold shadow-md flex items-center space-x-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Giáo viên đang khóa quyền vẽ. Bạn đang ở chế độ xem bài giảng.</span>
        </div>
      )}

      {/* Dual-Canvas Container: 100% Hardware Accelerated */}
      <div className="relative flex-1 w-full h-full cursor-crosshair overflow-hidden">
        {/* Layer 1: Persistent Background Canvas (grid + committed strokes) */}
        <canvas
          ref={bgCanvasRef}
          className="absolute inset-0 w-full h-full block pointer-events-none"
        />

        {/* Layer 2: Transparent Interactive Scratchpad Canvas (active stroke only, 60fps) */}
        <canvas
          ref={fgCanvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 w-full h-full block"
        />
      </div>
    </div>
  );
};
