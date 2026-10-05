import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { LifeGoal, GameMode } from '../../types/game';
import { Trophy, Award, AlertTriangle, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
import { sound } from '../../utils/audio';

interface GameOverModalProps {
  isOpen: boolean;
  isVictorious: boolean;
  failReason?: string;
  totalCapital: number;
  cashAmount: number;
  investedAmount: number;
  finalJoy: number;
  yearsTaken: number;
  goal: LifeGoal;
  mode: GameMode;
  hasUnpaidCreditCard: boolean;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isVictorious,
  failReason,
  totalCapital,
  cashAmount,
  investedAmount,
  finalJoy,
  yearsTaken,
  goal,
  mode,
  hasUnpaidCreditCard,
  onPlayAgain,
  onViewLeaderboard,
}) => {
  useEffect(() => {
    if (isOpen && isVictorious) {
      sound.playFanfare();
      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    } else if (isOpen && !isVictorious) {
      sound.playWarning();
    }
  }, [isOpen, isVictorious]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-center">
        {/* Status Icon */}
        <div className="flex justify-center">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg ${
              isVictorious
                ? 'bg-gradient-to-tr from-amber-400 to-yellow-500 text-white'
                : 'bg-gradient-to-tr from-slate-700 to-slate-900 text-rose-400'
            }`}
          >
            {isVictorious ? <Trophy className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {mode === '10_YEARS' ? 'Итоги 10 лет' : 'Результат прохождения'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            {isVictorious ? 'Цель достигнута! Победа!' : 'Игра завершена'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {isVictorious
              ? `Поздравляем! Вы успешно завершили финансовый путь и сохранили гармонию жизни!`
              : failReason || 'К сожалению, условия победы не были выполнены.'}
          </p>
        </div>

        {/* Unpaid credit card rule indicator from IMG_9115 */}
        {hasUnpaidCreditCard && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 text-left">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Нельзя засчитать победу с непогашенным долгом по кредитной карте!</span>
          </div>
        )}

        {/* Result Formula (Replicating IMG_9099) */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Формула результата
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-4 text-sm font-semibold">
            <div className="text-center">
              <span className="text-[11px] text-slate-500 block font-normal">Вложено</span>
              <span className="text-slate-800 tabular-nums">
                {investedAmount.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <span className="text-slate-400 font-bold">+</span>
            <div className="text-center">
              <span className="text-[11px] text-slate-500 block font-normal">Свободные деньги</span>
              <span className="text-slate-800 tabular-nums">
                {cashAmount.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80">
            <span className="text-xs text-slate-500 block">Итоговый совокупный капитал:</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">
              {totalCapital.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>

        {/* Vital stats row */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white border border-slate-200">
            <span className="text-slate-500 block">Уровень Радости</span>
            <span
              className={`text-lg font-bold tabular-nums ${
                finalJoy >= goal.minJoy ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {finalJoy} / 100
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              (Порог: {goal.minJoy}+)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white border border-slate-200">
            <span className="text-slate-500 block">Потребовалось времени</span>
            <span className="text-lg font-bold text-slate-900 tabular-nums">
              {yearsTaken} {yearsTaken === 1 ? 'год' : yearsTaken < 5 ? 'года' : 'лет'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {mode === '10_YEARS' ? 'Фиксированный срок' : 'Режим достижения цели'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onViewLeaderboard();
            }}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Посмотреть Таблицу Рекордов</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Играть снова с новой целью</span>
          </button>
        </div>
      </div>
    </div>
  );
};
