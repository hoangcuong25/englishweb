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

interface Point {
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'line'>('pen');
  const [color, setColor] = useState<string>('#0284c7');
  const [width, setWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<WhiteboardStroke | null>(null);

  const isDrawingAllowed = isHost || (canDraw && allowStudentDrawing);

  // Sync with remote strokes
  useEffect(() => {
    if (remoteStrokes && remoteStrokes.length > 0) {
      setStrokes(remoteStrokes);
    }
  }, [remoteStrokes]);

  // Redraw entire canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid pattern (subtle graph paper for classroom)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const allStrokes = currentStroke ? [...strokes, currentStroke] : strokes;

    allStrokes.forEach((st) => {
      if (st.points.length === 0) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (st.tool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = st.width * 3;
      } else if (st.tool === 'highlighter') {
        ctx.strokeStyle = st.color;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = st.width * 2.5;
      } else {
        ctx.strokeStyle = st.color;
        ctx.lineWidth = st.width;
      }

      if (st.tool === 'rectangle' && st.points.length >= 2) {
        const start = st.points[0];
        const end = st.points[st.points.length - 1];
        ctx.beginPath();
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (st.tool === 'line' && st.points.length >= 2) {
        const start = st.points[0];
        const end = st.points[st.points.length - 1];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(st.points[0].x, st.points[0].y);
        for (let i = 1; i < st.points.length; i++) {
          ctx.lineTo(st.points[i].x, st.points[i].y);
        }
        ctx.stroke();
      }

      ctx.restore();
    });
  }, [strokes, currentStroke]);

  // Adjust canvas size to parent container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        redrawCanvas();
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingAllowed) return;
    const point = getCanvasCoordinates(e);
    if (!point) return;

    setIsDrawing(true);
    const newStroke: WhiteboardStroke = {
      id: `${Date.now()}-${Math.random()}`,
      tool,
      color,
      width,
      points: [point],
    };
    setCurrentStroke(newStroke);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStroke || !isDrawingAllowed) return;
    const point = getCanvasCoordinates(e);
    if (!point) return;

    setCurrentStroke((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point],
      };
    });
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);

    if (currentStroke.points.length > 1) {
      setStrokes((prev) => [...prev, currentStroke]);
      onStrokeComplete?.(currentStroke);
    }
    setCurrentStroke(null);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    onClearBoard?.();
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, prev.length - 1));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = image;
    link.click();
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      {/* Top Floating Whiteboard Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-sky-100">
        {/* Tool Selector */}
        <div className="flex items-center space-x-1 border-r border-slate-200 pr-3">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg text-sm font-medium transition ${
              tool === 'pen' ? 'bg-sky-100 text-sky-700 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Bút vẽ (Pen)"
            disabled={!isDrawingAllowed}
          >
            <Pen className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('highlighter')}
            className={`p-2 rounded-lg text-sm font-medium transition ${
              tool === 'highlighter' ? 'bg-sky-100 text-sky-700 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Bút dạ quang (Highlighter)"
            disabled={!isDrawingAllowed}
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('rectangle')}
            className={`p-2 rounded-lg text-sm font-medium transition ${
              tool === 'rectangle' ? 'bg-sky-100 text-sky-700 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Hình chữ nhật"
            disabled={!isDrawingAllowed}
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`p-2 rounded-lg text-sm font-medium transition ${
              tool === 'line' ? 'bg-sky-100 text-sky-700 shadow-inner' : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Đường thẳng"
            disabled={!isDrawingAllowed}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg text-sm font-medium transition ${
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
              key={c}
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full border-2 transition relative flex items-center justify-center"
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
              key={sw.value}
              onClick={() => setWidth(sw.value)}
              className={`px-2 py-1 text-xs rounded-md transition font-medium ${
                width === sw.value ? 'bg-sky-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              disabled={!isDrawingAllowed}
            >
              {sw.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0 || !isDrawingAllowed}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition disabled:opacity-40"
            title="Hoàn tác (Undo)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            disabled={strokes.length === 0 || !isDrawingAllowed}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
            title="Xóa trắng bảng"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="Lưu ảnh bảng trắng"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Admin host control for student drawing */}
          {isHost && (
            <button
              onClick={() => onToggleStudentDraw?.(!allowStudentDrawing)}
              className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
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

      {/* Canvas Area */}
      <div className="flex-1 w-full h-full cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
