import React, { useState } from 'react';
import { Target, Heart, Sparkles, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, HelpCircle, Flame, Rocket, Clock } from 'lucide-react';
import { LifeGoal, GameMode, CharacterPreset, MacroNews } from '../types/game';

interface StatusBarProps {
  character: CharacterPreset;
  year: number;
  maxYears?: number;
  mode: GameMode;
  goal: LifeGoal;
  cash: number;
  netWorth: number;
  joy: number;
  hasApartment: boolean;
  hasBusiness: boolean;
  passiveIncome: number;
  activeCrisis?: MacroNews | null;
  onFinishGameEarly?: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  character,
  year,
  maxYears = 10,
  mode,
  goal,
  cash,
  netWorth,
  joy,
  hasApartment,
  hasBusiness,
  passiveIncome,
  activeCrisis,
  onFinishGameEarly,
}) => {
  const [showGoalDetails, setShowGoalDetails] = useState(false);

  // Capital progress calculation
  const capitalProgress = goal.targetCapital > 0 ? Math.min(100, (netWorth / goal.targetCapital) * 100) : 100;
  const joyMet = joy >= goal.minJoy;
  const capitalMet = netWorth >= goal.targetCapital;

  const apartmentMet = !goal.requiredAssets?.hasApartment || hasApartment;
  const businessMet = !goal.requiredAssets?.hasBusiness || hasBusiness;
  const passiveMet = !goal.requiredAssets?.passiveIncomeTarget || passiveIncome >= goal.requiredAssets.passiveIncomeTarget;

  const allRequirementsMet = capitalMet && joyMet && apartmentMet && businessMet && passiveMet;

  // Emotional status label
  const getJoyStatus = (val: number) => {
    if (val >= 85) return { label: 'Эйфория (+бонусы)', emoji: '🤩', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (val >= 70) return { label: 'Отлично', emoji: '😊', color: 'text-emerald-600 bg-emerald-50/70 border-emerald-100' };
    if (val >= 50) return { label: 'Нормально', emoji: '🙂', color: 'text-slate-600 bg-slate-100 border-slate-200' };
    if (val >= 30) return { label: 'Усталость', emoji: '😐', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Выгорание (-20% доход)', emoji: '😫', color: 'text-rose-700 bg-rose-50 border-rose-200 animate-pulse' };
  };

  const joyStatus = getJoyStatus(joy);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5 transition-all">
      {/* Top summary row: Identity + Balances */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        {/* Left: Player identity & Year */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {character.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-900 font-heading">
                {character.name}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                {mode === '10_YEARS' ? `Год ${year} из 10` : mode === 'SANDBOX' ? `Год ${year} (Песочница)` : `Год ${year}`}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {character.role}
            </p>
          </div>
        </div>

        {/* Right: Key Financials */}
        <div data-tour="status-cash" className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-800 block">
              Свободные деньги
            </span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-950 tabular-nums">
              {cash.toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 block">
              Общий капитал
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
              {netWorth.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>
      </div>

      {/* Active Multi-Year Crisis or Boom Indicator */}
      {activeCrisis && activeCrisis.yearsRemaining && activeCrisis.yearsRemaining > 0 && (
        <div
          className={`p-2.5 px-3.5 rounded-xl border text-xs flex items-center justify-between gap-2.5 animate-in fade-in duration-200 ${
            activeCrisis.cycleType === 'CRISIS' || activeCrisis.cycleType === 'STAGFLATION'
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {activeCrisis.cycleType === 'CRISIS' || activeCrisis.cycleType === 'STAGFLATION' ? (
              <Flame className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
            ) : (
              <Rocket className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="font-bold shrink-0">
              {activeCrisis.cycleType === 'CRISIS' || activeCrisis.cycleType === 'STAGFLATION' ? 'Экономический спад' : 'Экономический подъем'}:
            </span>
            <span className="truncate font-semibold">{activeCrisis.headline}</span>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white/90 border border-slate-200/80 shadow-2xs">
              Активная фаза
            </span>
          </div>
        </div>
      )}

      {/* Bottom row: Compact Goal Progress + Joy Indicator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-center">
        {/* Goal bar */}
        <div data-tour="status-goal" className="bg-slate-50/70 rounded-xl p-2.5 sm:p-3 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 truncate">
              <Target className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{goal.title}</span>
            </div>
            <button
              onClick={() => setShowGoalDetails(!showGoalDetails)}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 ml-2 shrink-0"
            >
              <span>{Math.round(capitalProgress)}%</span>
              {showGoalDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(2, capitalProgress))}%` }}
            />
          </div>

          {/* Expandable details if user clicks */}
          {showGoalDetails && (
            <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-600 space-y-1.5 animate-in fade-in duration-150">
              <div className="flex justify-between">
                <span>Целевой капитал:</span>
                <span className="font-semibold text-slate-800">{goal.targetCapital.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Минимальная радость:</span>
                <span className="font-semibold text-slate-800">≥ {goal.minJoy} пунктов</span>
              </div>
              {goal.requiredAssets?.hasApartment && (
                <div className="flex justify-between">
                  <span>Своя квартира:</span>
                  <span className={apartmentMet ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                    {apartmentMet ? '✓ Куплена' : 'Не куплена'}
                  </span>
                </div>
              )}
              {goal.requiredAssets?.hasBusiness && (
                <div className="flex justify-between">
                  <span>Свой бизнес:</span>
                  <span className={businessMet ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                    {businessMet ? '✓ Открыт' : 'Не открыт'}
                  </span>
                </div>
              )}

              {allRequirementsMet && onFinishGameEarly && (
                <button
                  onClick={onFinishGameEarly}
                  className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  🎉 Цель достигнута! Зафиксировать победу
                </button>
              )}
            </div>
          )}
        </div>

        {/* Joy bar */}
        <div data-tour="status-joy" className="bg-slate-50/70 rounded-xl p-2.5 sm:p-3 border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
              <span>Шкала Радости:</span>
              <span className="text-slate-900 font-bold">{joy} / 100</span>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${joyStatus.color}`}>
              {joyStatus.emoji} {joyStatus.label}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                joy >= 70 ? 'bg-emerald-500' : joy >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, joy))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
