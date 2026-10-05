import React from 'react';
import { Target, CheckCircle2, AlertCircle } from 'lucide-react';
import { LifeGoal, GameMode } from '../types/game';

interface GoalProgressProps {
  goal: LifeGoal;
  mode: GameMode;
  year: number;
  maxYears?: number; // 10 for 10_YEARS mode
  netWorth: number;
  joy: number;
  hasApartment: boolean;
  hasBusiness: boolean;
  passiveIncome: number;
  onFinishGameEarly?: () => void;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
  goal,
  mode,
  year,
  maxYears = 10,
  netWorth,
  joy,
  hasApartment,
  hasBusiness,
  passiveIncome,
  onFinishGameEarly,
}) => {
  // Check conditions
  const capitalMet = goal.targetCapital <= 0 || netWorth >= goal.targetCapital;
  const joyMet = joy >= goal.minJoy;
  const apartmentMet = !goal.requiredAssets?.hasApartment || hasApartment;
  const businessMet = !goal.requiredAssets?.hasBusiness || hasBusiness;
  const passiveMet = !goal.requiredAssets?.passiveIncomeTarget || passiveIncome >= goal.requiredAssets.passiveIncomeTarget;

  const isGoalFulfilled = capitalMet && joyMet && apartmentMet && businessMet && passiveMet;

  // Calculate percentage completion
  let totalCriteria = 2; // capital + joy
  let criteriaMet = (capitalMet ? 1 : Math.min(1, netWorth / Math.max(1, goal.targetCapital))) + (joyMet ? 1 : Math.min(1, joy / goal.minJoy));

  if (goal.requiredAssets?.hasApartment) {
    totalCriteria += 1;
    if (apartmentMet) criteriaMet += 1;
  }
  if (goal.requiredAssets?.hasBusiness) {
    totalCriteria += 1;
    if (businessMet) criteriaMet += 1;
  }
  if (goal.requiredAssets?.passiveIncomeTarget) {
    totalCriteria += 1;
    criteriaMet += Math.min(1, passiveIncome / goal.requiredAssets.passiveIncomeTarget);
  }

  const progressPercent = Math.min(100, Math.round((criteriaMet / totalCriteria) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{mode === '10_YEARS' ? 'Классический челлендж' : mode === 'SANDBOX' ? 'Свободный режим' : 'Жизненная цель'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-800">{goal.title}</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{goal.description}</p>
          </div>
        </div>

        {/* Time Remaining or Years Taken */}
        <div className="flex items-center gap-3 shrink-0">
          {mode === '10_YEARS' ? (
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Осталось лет</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {Math.max(0, maxYears - year + 1)} / {maxYears}
              </span>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Пройдено лет</span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {year} лет в игре
              </span>
            </div>
          )}

          {isGoalFulfilled && onFinishGameEarly && mode !== '10_YEARS' && (
            <button
              onClick={onFinishGameEarly}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all animate-pulse"
            >
              Зафиксировать триумф!
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-600">Прогресс цели</span>
          <span className="text-slate-900 tabular-nums font-semibold">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isGoalFulfilled ? 'bg-emerald-500' : 'bg-slate-900'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
        {goal.targetCapital > 0 && (
          <div className="flex items-center gap-1.5">
            {capitalMet ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className={capitalMet ? 'text-slate-700 font-medium' : 'text-slate-500'}>
              Капитал: {(goal.targetCapital / 1000000).toLocaleString('ru-RU')} млн ₽
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {joyMet ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          )}
          <span className={joyMet ? 'text-slate-700 font-medium' : 'text-slate-500'}>
            Радость ≥ {goal.minJoy}
          </span>
        </div>

        {goal.requiredAssets?.hasApartment && (
          <div className="flex items-center gap-1.5">
            {apartmentMet ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className={apartmentMet ? 'text-slate-700 font-medium' : 'text-slate-500'}>
              Своя квартира
            </span>
          </div>
        )}

        {goal.requiredAssets?.hasBusiness && (
          <div className="flex items-center gap-1.5">
            {businessMet ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className={businessMet ? 'text-slate-700 font-medium' : 'text-slate-500'}>
              Действующий бизнес
            </span>
          </div>
        )}

        {goal.requiredAssets?.passiveIncomeTarget && (
          <div className="flex items-center gap-1.5">
            {passiveMet ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            <span className={passiveMet ? 'text-slate-700 font-medium' : 'text-slate-500'}>
              Пассив {Math.round(goal.requiredAssets.passiveIncomeTarget / 1000)}k ₽/год
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
