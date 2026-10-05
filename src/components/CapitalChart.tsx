import React from 'react';
import { YearHistoryPoint } from '../types/game';

interface CapitalChartProps {
  history: YearHistoryPoint[];
}

export const CapitalChart: React.FC<CapitalChartProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 text-center text-slate-500 text-sm">
        История пока пуста. Завершите первый игровой год, чтобы увидеть динамику!
      </div>
    );
  }

  const padding = 40;
  const width = 640;
  const height = 260;

  const maxCapital = Math.max(...history.map((p) => p.netWorth), 1000000);
  const minCapital = 0;

  // Scale functions
  const getX = (index: number) => {
    if (history.length === 1) return width / 2;
    return padding + (index / (history.length - 1)) * (width - 2 * padding);
  };

  const getY = (val: number) => {
    const range = maxCapital - minCapital;
    if (range === 0) return height / 2;
    return height - padding - ((val - minCapital) / range) * (height - 2 * padding);
  };

  // Generate SVG path for Net Worth
  const netWorthPoints = history.map((p, idx) => `${getX(idx)},${getY(p.netWorth)}`).join(' ');
  const cashPoints = history.map((p, idx) => `${getX(idx)},${getY(p.cash)}`).join(' ');

  // Area under net worth
  const areaPath = history.length > 1
    ? `M ${getX(0)},${getY(history[0].netWorth)} ` +
      history.slice(1).map((p, idx) => `L ${getX(idx + 1)},${getY(p.netWorth)}`).join(' ') +
      ` L ${getX(history.length - 1)},${height - padding} L ${getX(0)},${height - padding} Z`
    : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-heading">Динамика капитала</h3>
          <p className="text-xs text-slate-500">Рост совокупного капитала и свободных денег по годам</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span className="text-slate-600 font-medium">Общий капитал</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span className="text-slate-600 font-medium">Наличные</span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[320px] overflow-visible">
          <defs>
            <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = height - padding - pct * (height - 2 * padding);
            const val = minCapital + pct * (maxCapital - minCapital);
            return (
              <g key={idx}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={padding - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  className="font-mono tabular-nums"
                >
                  {(val / 1000000).toFixed(1)}M ₽
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaPath && <path d={areaPath} fill="url(#capitalGradient)" />}

          {/* Cash line */}
          {history.length > 1 ? (
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 4"
              points={cashPoints}
            />
          ) : null}

          {/* Net Worth line */}
          {history.length > 1 ? (
            <polyline
              fill="none"
              stroke="#059669"
              strokeWidth="3"
              points={netWorthPoints}
            />
          ) : null}

          {/* Dots */}
          {history.map((point, idx) => {
            const cx = getX(idx);
            const cy = getY(point.netWorth);
            return (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#ffffff"
                  stroke="#059669"
                  strokeWidth="2"
                  className="transition-all hover:r-6"
                />
                {/* Year Label */}
                <text
                  x={cx}
                  y={height - padding + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                  className="font-mono"
                >
                  Г.{point.year}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
        <div>
          <span className="text-slate-500 block">Стартовый капитал</span>
          <span className="font-semibold text-slate-800 tabular-nums">
            {history[0].netWorth.toLocaleString('ru-RU')} ₽
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Текущий капитал</span>
          <span className="font-semibold text-emerald-600 tabular-nums">
            {history[history.length - 1].netWorth.toLocaleString('ru-RU')} ₽
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Общий прирост</span>
          <span className="font-semibold text-slate-800 tabular-nums">
            +{(history[history.length - 1].netWorth - history[0].netWorth).toLocaleString('ru-RU')} ₽
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Пассивный доход</span>
          <span className="font-semibold text-teal-600 tabular-nums">
            {history[history.length - 1].passiveIncome.toLocaleString('ru-RU')} ₽/год
          </span>
        </div>
      </div>
    </div>
  );
};
