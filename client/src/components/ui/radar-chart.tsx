'use client';

import React from 'react';

export interface RadarChartItem {
  label: string;
  value: number; // 0 -> 100
  maxValue?: number;
  fullMark?: number;
}

interface RadarChartProps {
  data: RadarChartItem[];
  size?: number;
  className?: string;
  fillColor?: string;
  strokeColor?: string;
  gridColor?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 360,
  className = '',
  fillColor = 'rgba(2, 132, 199, 0.25)', // Sky blue fill
  strokeColor = '#0284c7', // Primary Sky-600
  gridColor = '#e2e8f0', // Slate-200
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-xs text-slate-400 font-medium">
        Chưa có đủ dữ liệu để vẽ biểu đồ mạng nhện.
      </div>
    );
  }

  const center = size / 2;
  const radius = (size / 2) * 0.68; // Leave margin for outer labels
  const totalAxes = data.length;
  const angleStep = (2 * Math.PI) / totalAxes;
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0]; // Concentric rings

  // Calculate coordinate on polygon for a given index and value ratio (0..1)
  const getCoordinates = (index: number, ratio: number) => {
    // Start from top (angle - PI/2)
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * Math.max(0, Math.min(1, ratio));
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Build the path string for the data polygon
  const dataPoints = data.map((item, idx) => {
    const max = item.maxValue || item.fullMark || 100;
    const ratio = max > 0 ? item.value / max : 0;
    return getCoordinates(idx, ratio);
  });

  const polygonPath = dataPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ') + ' Z';

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible select-none"
      >
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
          </radialGradient>
          <filter id="radarShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. Concentric Polygon Grid Webs */}
        {levels.map((lvl) => {
          const ringPoints = Array.from({ length: totalAxes }).map((_, idx) => {
            const pt = getCoordinates(idx, lvl);
            return `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
          }).join(' ') + ' Z';

          return (
            <g key={`ring-${lvl}`}>
              <path
                d={ringPoints}
                fill={lvl === 1.0 ? '#f8fafc' : 'none'}
                stroke={gridColor}
                strokeWidth={lvl === 1.0 ? '1.5' : '1'}
                strokeDasharray={lvl === 1.0 ? 'none' : '3 3'}
              />
              {/* Level Percentage Label on top axis */}
              <text
                x={center + 4}
                y={center - radius * lvl + 10}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="700"
                className="font-mono"
              >
                {Math.round(lvl * 100)}%
              </text>
            </g>
          );
        })}

        {/* 2. Radial Axis Spokes */}
        {data.map((_, idx) => {
          const outerPt = getCoordinates(idx, 1.0);
          return (
            <line
              key={`spoke-${idx}`}
              x1={center}
              y1={center}
              x2={outerPt.x}
              y2={outerPt.y}
              stroke={gridColor}
              strokeWidth="1.2"
            />
          );
        })}

        {/* 3. Filled Data Spider Web Polygon */}
        <path
          d={polygonPath}
          fill={fillColor || 'url(#radarGlow)'}
          stroke={strokeColor}
          strokeWidth="2.5"
          filter="url(#radarShadow)"
          className="transition-all duration-500 ease-out"
        />

        {/* 4. Vertex Marker Dots with Tooltip Highlights */}
        {dataPoints.map((pt, idx) => (
          <g key={`dot-${idx}`}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth="2.5"
              className="transition-all duration-300 hover:r-6 hover:fill-primary cursor-pointer"
            />
          </g>
        ))}

        {/* 5. Axis Labels & Accuracy Badges */}
        {data.map((item, idx) => {
          const labelDistRatio = 1.18;
          const labelPt = getCoordinates(idx, labelDistRatio);
          const val = Math.round(item.value);
          const isHigh = val >= 75;
          const isLow = val < 50;

          // Align text based on quadrant
          let textAnchor: 'middle' | 'end' | 'start' = 'middle';
          if (labelPt.x < center - 15) textAnchor = 'end';
          else if (labelPt.x > center + 15) textAnchor = 'start';

          return (
            <g key={`label-${idx}`}>
              <text
                x={labelPt.x}
                y={labelPt.y - 4}
                textAnchor={textAnchor}
                fill="#1e293b"
                fontSize="10.5"
                fontWeight="700"
                className="font-sans"
              >
                {item.label}
              </text>
              <text
                x={labelPt.x}
                y={labelPt.y + 10}
                textAnchor={textAnchor}
                fill={isHigh ? '#059669' : isLow ? '#e11d48' : '#0284c7'}
                fontSize="11"
                fontWeight="800"
                className="font-mono"
              >
                {val}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
