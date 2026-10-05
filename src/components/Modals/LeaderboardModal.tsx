import React from 'react';
import { LeaderboardEntry } from '../../types/game';
import { Trophy, X, Medal, Sparkles, Trash2 } from 'lucide-react';
import { sound } from '../../utils/audio';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  onClearLeaderboard: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  onClearLeaderboard,
}) => {
  if (!isOpen) return null;

  // Sort as per IMG_9100 rules:
  // 1. Victory first
  // 2. Highest capital
  // 3. Highest joy
  // 4. Fewest years taken
  const sortedEntries = [...entries].sort((a, b) => {
    if (a.isVictorious !== b.isVictorious) {
      return a.isVictorious ? -1 : 1;
    }
    if (b.finalCapital !== a.finalCapital) {
      return b.finalCapital - a.finalCapital;
    }
    if (b.finalJoy !== a.finalJoy) {
      return b.finalJoy - a.finalJoy;
    }
    return a.yearsTaken - b.yearsTaken;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col p-6 sm:p-8 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Зал Славы и Рейтинг
              </h2>
              <p className="text-xs text-slate-500">
                Сортировка: Капитал → Радость → Скорость (лет)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {sortedEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs sm:text-sm">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Пока нет сохраненных рекордов. Завершите игру, чтобы попасть в Зал Славы!
            </div>
          ) : (
            sortedEntries.map((entry, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;

              return (
                <div
                  key={entry.id || idx}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isFirst
                      ? 'bg-amber-50/60 border-amber-200'
                      : isSecond
                      ? 'bg-slate-50 border-slate-200'
                      : isThird
                      ? 'bg-orange-50/40 border-orange-200'
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isFirst
                          ? 'bg-amber-400 text-amber-950'
                          : isSecond
                          ? 'bg-slate-300 text-slate-900'
                          : isThird
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {entry.playerName}
                        </span>
                        {entry.isVictorious ? (
                          <span className="text-[10px] text-emerald-700 font-medium bg-emerald-100/70 px-1.5 py-0.5 rounded-md">
                            Победа
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-600 bg-rose-100/70 px-1.5 py-0.5 rounded-md">
                            Финиш
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <span>{entry.goalTitle}</span>
                        <span className="mx-1">·</span>
                        <span>{entry.yearsTaken} {entry.yearsTaken === 1 ? 'год' : entry.yearsTaken < 5 ? 'года' : 'лет'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                      {entry.finalCapital.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Радость: <span className="font-semibold text-slate-700">{entry.finalJoy}</span> / 100
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {sortedEntries.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Сбросить всю таблицу рекордов?')) {
                  onClearLeaderboard();
                }
              }}
              className="text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Очистить историю</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="ml-auto py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
