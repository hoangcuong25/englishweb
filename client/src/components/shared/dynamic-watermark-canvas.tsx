'use client';

import React, { useEffect, useRef, useState } from 'react';

interface DynamicWatermarkProps {
  studentName?: string;
  studentId?: string;
  studentPhone?: string;
  opacity?: number;
}

export default function DynamicWatermarkCanvas({
  studentName = 'Học Viên',
  studentId = 'HV-2026',
  studentPhone = '0987654321',
  opacity = 0.28,
}: DynamicWatermarkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimestamp(
        now.toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    // Prevent context menu and shortcuts (Ctrl+S, Ctrl+P)
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let offsetX = 0;
    let offsetY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Random shift every 12 seconds
    const shiftCoordinates = () => {
      targetX = (Math.random() - 0.5) * 80;
      targetY = (Math.random() - 0.5) * 80;
    };
    shiftCoordinates();
    const shiftInterval = setInterval(shiftCoordinates, 12000);

    const watermarkText = `${studentName} • ${studentId} • ${studentPhone} • ${timestamp}`;

    const render = () => {
      // Smooth movement towards target
      offsetX += (targetX - offsetX) * 0.05;
      offsetY += (targetY - offsetY) * 0.05;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#1D4F8C';

      const gapX = 320;
      const gapY = 180;

      for (let x = -200 + offsetX; x < canvas.width + 300; x += gapX) {
        for (let y = -200 + offsetY; y < canvas.height + 300; y += gapY) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((-22 * Math.PI) / 180);
          ctx.fillText(watermarkText, 0, 0);
          ctx.restore();
        }
      }

      ctx.restore();
      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
      clearInterval(shiftInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [studentName, studentId, studentPhone, timestamp, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-30 h-full w-full select-none"
    />
  );
}

