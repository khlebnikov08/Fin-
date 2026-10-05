import React from 'react';
import { Frown, Meh, Smile, Laugh, Angry } from 'lucide-react';

interface JoyMeterProps {
  joy: number; // 0 to 100
  targetJoy?: number;
}

export const JoyMeter: React.FC<JoyMeterProps> = ({ joy, targetJoy = 80 }) => {
  const clampedJoy = Math.max(0, Math.min(100, Math.round(joy)));

  // Determine current emotion state
  const getEmotionConfig = () => {
    if (clampedJoy < 25) {
      return {
        label: 'Глубокая депрессия / Выгорание',
        color: 'text-rose-600',
        bgGradient: 'from-rose-500 to-red-600',
        icon: Angry,
        borderColor: 'border-rose-200',
        statusText: 'Штраф к зарплате (-20%)',
      };
    }
    if (clampedJoy < 45) {
      return {
        label: 'Подавленность и апатия',
        color: 'text-amber-600',
        bgGradient: 'from-orange-500 to-amber-500',
        icon: Frown,
        borderColor: 'border-amber-200',
        statusText: 'Сниженная мотивация',
      };
    }
    if (clampedJoy < 70) {
      return {
        label: 'Нейтральное состояние',
        color: 'text-yellow-600',
        bgGradient: 'from-amber-400 to-yellow-500',
        icon: Meh,
        borderColor: 'border-yellow-200',
        statusText: 'Обычная рутина',
      };
    }
    if (clampedJoy < 85) {
      return {
        label: 'Хорошее настроение и баланс',
        color: 'text-emerald-600',
        bgGradient: 'from-emerald-400 to-teal-500',
        icon: Smile,
        borderColor: 'border-emerald-200',
        statusText: 'Достаточно для победы (80+)',
      };
    }
    return {
      label: 'Полная гармония и драйв!',
      color: 'text-purple-600',
      bgGradient: 'from-emerald-500 via-teal-500 to-purple-600',
      icon: Laugh,
      borderColor: 'border-purple-200',
      statusText: 'Бонус к карьере и бизнесу',
    };
  };

  const currentEmotion = getEmotionConfig();
  const IconComponent = currentEmotion.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl bg-slate-50 border ${currentEmotion.borderColor}`}>
            <IconComponent className={`w-6 h-6 ${currentEmotion.color} transition-transform duration-200 hover:scale-110`} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Шкала Радости</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700">{currentEmotion.label}</span>
            </div>
            <div className="text-lg font-bold tracking-tight text-slate-900 tabular-nums">
              {clampedJoy} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">Целевой порог</div>
          <div className="text-xs font-semibold text-emerald-700 tabular-nums">
            ≥ {targetJoy} пунктов
          </div>
        </div>
      </div>

      {/* Progress Bar with icons matching user screenshot IMG_9090 */}
      <div className="relative pt-2 pb-1">
        {/* Track */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${currentEmotion.bgGradient} transition-all duration-300 ease-out`}
            style={{ width: `${clampedJoy}%` }}
          />
        </div>

        {/* Milestone marker for 80 */}
        <div
          className="absolute top-1 bottom-0 flex flex-col items-center pointer-events-none"
          style={{ left: `${targetJoy}%` }}
        >
          <div className="w-0.5 h-5 bg-slate-400/80" />
          <span className="text-[10px] font-bold text-slate-500 mt-0.5 tabular-nums">80</span>
        </div>

        {/* Emoji benchmark row */}
        <div className="flex justify-between items-center px-1 mt-2 text-slate-400 text-xs">
          <span className="text-rose-500 font-medium">0</span>
          <div className="flex items-center gap-3 opacity-80">
            <Angry className="w-3.5 h-3.5 text-rose-500" />
            <Frown className="w-3.5 h-3.5 text-amber-500" />
            <Meh className="w-3.5 h-3.5 text-yellow-500" />
            <Smile className="w-3.5 h-3.5 text-emerald-500" />
            <Laugh className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <span className="text-purple-600 font-medium">100</span>
        </div>
      </div>

      <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
        <span>Эффект: {currentEmotion.statusText}</span>
        {clampedJoy < targetJoy ? (
          <span className="text-rose-600 font-medium">Нужно +{targetJoy - clampedJoy} до цели</span>
        ) : (
          <span className="text-emerald-600 font-medium">Цель по радости выполнена</span>
        )}
      </div>
    </div>
  );
};
