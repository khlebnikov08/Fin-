import React from 'react';
import { YearHistoryPoint } from '../../types/game';
import { CapitalChart } from '../CapitalChart';
import { PieChart, ShieldCheck, Heart, TrendingUp, Landmark, Award } from 'lucide-react';

interface AnalyticsTabProps {
  history: YearHistoryPoint[];
  netWorth: number;
  cash: number;
  stocksValue: number;
  bondsValue: number;
  depositsValue: number;
  cryptoValue: number;
  businessValue: number;
  debtTotal: number;
  totalDividendsEarned: number;
  totalCouponsEarned: number;
  totalSalaryEarned: number;
  currentJoy: number;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  history,
  netWorth,
  cash,
  stocksValue,
  bondsValue,
  depositsValue,
  cryptoValue,
  businessValue,
  debtTotal,
  totalDividendsEarned,
  totalCouponsEarned,
  totalSalaryEarned,
  currentJoy,
}) => {
  const assetsSum = Math.max(
    1,
    cash + stocksValue + bondsValue + depositsValue + cryptoValue + businessValue
  );

  const assetCategories = [
    { label: 'Свободные деньги', value: cash, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
    { label: 'Акции', value: stocksValue, color: 'bg-blue-500', textColor: 'text-blue-700' },
    { label: 'Облигации', value: bondsValue, color: 'bg-amber-500', textColor: 'text-amber-700' },
    { label: 'Вклады в банках', value: depositsValue, color: 'bg-teal-500', textColor: 'text-teal-700' },
    { label: 'Криптовалюта', value: cryptoValue, color: 'bg-purple-500', textColor: 'text-purple-700' },
    { label: 'Бизнес & Недвижимость', value: businessValue, color: 'bg-indigo-500', textColor: 'text-indigo-700' },
  ].filter((a) => a.value > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Финансовая Аналитика и Портфель
          </h3>
          <p className="text-xs text-slate-500">
            Структура активов, соотношение риска и доходности, динамика развития
          </p>
        </div>
      </div>

      {/* Main Interactive Chart */}
      <CapitalChart history={history} />

      {/* Asset Allocation Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                Структура распределения активов
              </h4>
              <span className="text-[11px] text-slate-500">
                Диверсификация между защитными и доходными инструментами
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Активы брутто:</span>
            <span className="text-base font-extrabold text-slate-900 tabular-nums">
              {assetsSum.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>

        {/* Multi-segmented color progress bar */}
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
          {assetCategories.map((item, idx) => {
            const pct = (item.value / assetsSum) * 100;
            return (
              <div
                key={idx}
                className={`${item.color} h-full transition-all duration-300`}
                style={{ width: `${pct}%` }}
                title={`${item.label}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Grid list of categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {assetCategories.map((item, idx) => {
            const pct = (item.value / assetsSum) * 100;
            return (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                  <span className="font-medium text-slate-700 truncate">{item.label}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-900 tabular-nums">
                    {item.value.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lifetime Stats */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
          Сводная статистика за всю игру
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Заработано зарплатой</span>
            <span className="font-bold text-slate-900 tabular-nums text-sm">
              {totalSalaryEarned.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Получено дивидендами</span>
            <span className="font-bold text-blue-600 tabular-nums text-sm">
              +{totalDividendsEarned.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Получено купонами</span>
            <span className="font-bold text-amber-600 tabular-nums text-sm">
              +{totalCouponsEarned.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px]">Текущие долги</span>
            <span className={`font-bold tabular-nums text-sm ${debtTotal > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {debtTotal > 0 ? `-${debtTotal.toLocaleString('ru-RU')} ₽` : '0 ₽'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
