import React from 'react';
import { GameRandomEvent, EventChoice } from '../../types/game';
import { ThumbsUp, ThumbsDown, ShieldCheck, Sparkles, X, ArrowRight } from 'lucide-react';
import { sound } from '../../utils/audio';

interface EventModalProps {
  event: GameRandomEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectChoice?: (choice: EventChoice) => void;
  insuranceSavedLoss?: boolean;
  emergencyFundProtectionAmount?: number;
  cashDeltaAfterProtection?: number;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSelectChoice,
  insuranceSavedLoss,
  emergencyFundProtectionAmount = 0,
  cashDeltaAfterProtection,
}) => {
  if (!isOpen || !event) return null;

  const isGood = event.cashDelta > 0 || event.joyDelta > 0;
  const hasChoices = event.choices && event.choices.length > 0;
  const displayedCashDelta = cashDeltaAfterProtection ?? event.cashDelta;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 text-center relative">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Big Icon Circle */}
        <div className="flex justify-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${
              isGood
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : 'bg-rose-50 text-rose-500 border border-rose-100'
            }`}
          >
            {isGood ? <ThumbsUp className="w-8 h-8" /> : <ThumbsDown className="w-8 h-8" />}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Событие года
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
            {event.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
            {event.description}
          </p>
        </div>

        {/* Insurance protection banner if triggered */}
        {insuranceSavedLoss && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 text-left">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold block">Полис страхования сработал!</span>
              <span className="text-emerald-700 text-xs">
                Расходы в размере {event.insuranceAvoidedLoss?.toLocaleString('ru-RU')} ₽ полностью покрыты страховой компанией.
              </span>
            </div>
          </div>
        )}

        {emergencyFundProtectionAmount > 0 && (
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-sky-800 text-xs sm:text-sm flex items-center gap-2.5 text-left">
            <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0" />
            <div>
              <span className="font-semibold block">Подушка безопасности смягчила удар</span>
              <span className="text-sky-700 text-xs">
                Резерв защитил {emergencyFundProtectionAmount.toLocaleString('ru-RU')} ₽ от потерь.
              </span>
            </div>
          </div>
        )}

        {/* If Interactive Choices exist */}
        {hasChoices ? (
          <div className="space-y-2.5 pt-1 text-left">
            <span className="text-xs font-bold text-slate-500 block text-center">
              Выберите ваше решение:
            </span>
            {event.choices!.map((choice) => (
              <button
                key={choice.id}
                onClick={() => {
                  sound.playClick();
                  if (onSelectChoice) {
                    onSelectChoice(choice);
                  } else {
                    onClose();
                  }
                }}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 bg-slate-50/80 transition-all text-left flex items-center justify-between group"
              >
                <div className="space-y-1 pr-2">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-purple-900">
                    {choice.label}
                  </div>
                  {choice.description && (
                    <div className="text-[11px] text-slate-500">{choice.description}</div>
                  )}
                  <div className="flex items-center gap-3 text-xs font-semibold pt-0.5">
                    {choice.cashDelta !== 0 && (
                      <span className={choice.cashDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {choice.cashDelta > 0 ? '+' : ''}{choice.cashDelta.toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                    {choice.joyDelta !== 0 && (
                      <span className={choice.joyDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {choice.joyDelta > 0 ? '+' : ''}{choice.joyDelta} радости
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Outcome Badges (styled cleanly like IMG_9098) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Joy Delta */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Радость</span>
                <span
                  className={`text-base font-bold tabular-nums ${
                    event.joyDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {event.joyDelta >= 0 ? `+${event.joyDelta}` : event.joyDelta} пунктов
                </span>
              </div>

              {/* Cash Delta */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Деньги</span>
                <span
                  className={`text-base font-bold tabular-nums ${
                    insuranceSavedLoss
                      ? 'text-emerald-600'
                      : displayedCashDelta >= 0
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {insuranceSavedLoss
                    ? '0 ₽ (покрыто)'
                    : `${displayedCashDelta >= 0 ? '+' : ''}${displayedCashDelta.toLocaleString('ru-RU')} ₽`}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-colors mt-2"
            >
              Принять и продолжить
            </button>
          </>
        )}
      </div>
    </div>
  );
};
