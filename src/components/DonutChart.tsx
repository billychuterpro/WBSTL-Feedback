import React from 'react';

export interface DonutSegment {
  label: string;
  count: number;
  hex: string;
  colorClass?: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  totalLabel?: string;
  size?: number;
  strokeWidth?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  totalLabel = 'Total',
  size = 176,
  strokeWidth = 18,
}) => {
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.count), 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 block overflow-visible"
      >
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
        />

        {/* Dynamic proportional slices */}
        {total > 0 &&
          segments.map((seg, idx) => {
            if (seg.count <= 0) return null;
            const percent = seg.count / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -(accumulatedPercent * circumference);
            accumulatedPercent += percent;

            return (
              <circle
                key={`${seg.label}-${idx}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.hex}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-500 ease-out"
              />
            );
          })}
      </svg>

      {/* Center total badge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10">
        <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
          {totalLabel}
        </span>
        <span className="text-2xl font-black text-white tracking-tight">
          {total}
        </span>
      </div>
    </div>
  );
};
