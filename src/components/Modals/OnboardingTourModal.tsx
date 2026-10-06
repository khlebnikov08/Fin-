import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
} from 'lucide-react';
import { ActiveTab } from '../Header';
import { sound } from '../../utils/audio';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

interface TourStep {
  title: string;
  targetSelector: string;
  targetTab: ActiveTab;
  meaning: string;
  purpose: string;
}

type CalloutPlacement = 'top' | 'bottom';

interface CalloutPosition {
  top: number;
  left: number;
  arrowLeft: number;
  placement: CalloutPlacement;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Деньги и капитал',
    targetSelector: '[data-tour="status-cash"]',
    targetTab: 'overview',
    meaning: 'Свободные деньги — наличность. Капитал — стоимость активов минус долги.',
    purpose: 'Проверяй, хватает ли денег на расходы и растёт ли твоё состояние.',
  },
  {
    title: 'Радость',
    targetSelector: '[data-tour="status-joy"]',
    targetTab: 'overview',
    meaning: 'Показывает настроение персонажа по шкале от 0 до 100.',
    purpose: 'Низкая радость снижает доход. Балансируй работу, покупки и отдых.',
  },
  {
    title: 'Обязательные расходы',
    targetSelector: '[data-tour="mandatory-card"]',
    targetTab: 'overview',
    meaning: 'Годовой счёт за налоги, жильё, быт и транспорт.',
    purpose: 'Оплати его, чтобы разблокировать переход к следующему году.',
  },
  {
    title: 'Инвестиции',
    targetSelector: '[data-tour="nav-investments"]',
    targetTab: 'investments',
    meaning: 'Здесь находятся акции, облигации, вклады, криптовалюта и недвижимость.',
    purpose: 'Вкладывай свободные деньги и следи за риском, доходностью и диверсификацией.',
  },
  {
    title: 'Банки и кредиты',
    targetSelector: '[data-tour="nav-banking"]',
    targetTab: 'banking',
    meaning: 'Раздел с банковскими картами, кредитами, вкладами и погашением долга.',
    purpose: 'Сравнивай стоимость заёмных денег и не допускай, чтобы долг рос бесконтрольно.',
  },
  {
    title: 'Завершение года',
    targetSelector: '[data-tour="btn-advance-year"]',
    targetTab: 'overview',
    meaning: 'Начисляет доходы, списывает платежи и запускает событие года.',
    purpose: 'Перед нажатием проверь бюджет и решения: годовые изменения уже нельзя отменить.',
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [calloutPosition, setCalloutPosition] = useState<CalloutPosition>({
    top: 16,
    left: 16,
    arrowLeft: 24,
    placement: 'bottom',
  });
  const calloutRef = useRef<HTMLDivElement>(null);
  const current = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const findVisibleTarget = useCallback(() => {
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(current.targetSelector)
    );
    return candidates.find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }) ?? null;
  }, [current.targetSelector]);

  const updateTargetRect = useCallback(() => {
    if (!isOpen) return;
    const target = findVisibleTarget();
    setTargetRect(target ? target.getBoundingClientRect() : null);
  }, [findVisibleTarget, isOpen]);

  // Clear the previous step when the tour closes so it always restarts at step one.
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setTargetRect(null);
    }
  }, [isOpen]);

  // Navigate first, then bring the selected control into view and measure it.
  useEffect(() => {
    if (!isOpen) return;
    onNavigateTab?.(current.targetTab);

    const timer = window.setTimeout(() => {
      const target = findVisibleTarget();
      if (target) {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }
      updateTargetRect();
    }, 160);

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [
    current.targetTab,
    currentStep,
    findVisibleTarget,
    isOpen,
    onNavigateTab,
    updateTargetRect,
  ]);

  // Keep the compact explanation next to the highlighted control on any screen size.
  useLayoutEffect(() => {
    if (!isOpen) return;
    const callout = calloutRef.current;
    if (!callout) return;

    const margin = 16;
    const gap = 14;
    const width = callout.offsetWidth;
    const height = callout.offsetHeight;

    if (!targetRect) {
      setCalloutPosition({
        top: Math.max(margin, (window.innerHeight - height) / 2),
        left: Math.max(margin, (window.innerWidth - width) / 2),
        arrowLeft: Math.min(24, width - 24),
        placement: 'bottom',
      });
      return;
    }

    const roomAbove = targetRect.top - margin - gap;
    const roomBelow = window.innerHeight - targetRect.bottom - margin - gap;
    const placement: CalloutPlacement =
      roomBelow >= height || roomBelow >= roomAbove ? 'bottom' : 'top';
    const desiredTop =
      placement === 'bottom'
        ? targetRect.bottom + gap
        : targetRect.top - height - gap;
    const maxTop = Math.max(margin, window.innerHeight - height - margin);
    const top = clamp(desiredTop, margin, maxTop);
    const maxLeft = Math.max(margin, window.innerWidth - width - margin);
    const desiredLeft = targetRect.left + targetRect.width / 2 - width / 2;
    const left = clamp(desiredLeft, margin, maxLeft);
    const arrowLeft = clamp(
      targetRect.left + targetRect.width / 2 - left - 7,
      18,
      Math.max(18, width - 32)
    );

    setCalloutPosition({ top, left, arrowLeft, placement });
  }, [currentStep, isOpen, targetRect]);

  if (!isOpen) return null;

  const finishTour = () => {
    sound.playClick();
    localStorage.setItem('finlife_tour_completed', 'true');
    onNavigateTab?.('overview');
    onClose();
  };

  const handleNext = () => {
    sound.playClick();
    if (isLast) {
      localStorage.setItem('finlife_tour_completed', 'true');
      onNavigateTab?.('overview');
      onClose();
    } else {
      setCurrentStep((step) => step + 1);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    setCurrentStep((step) => Math.max(0, step - 1));
  };

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      {/* Keep the app readable; the focus ring, not a dark screen, shows where to look. */}
      <div aria-hidden="true" className="fixed inset-0 bg-slate-950/5 pointer-events-auto" />

      {targetRect && (
        <div
          aria-hidden="true"
          className="fixed z-[71] rounded-2xl border-2 border-emerald-500 bg-emerald-300/10 pointer-events-none ring-4 ring-emerald-400/25 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all duration-300"
          style={{
            top: `${Math.max(0, targetRect.top - 5)}px`,
            left: `${Math.max(0, targetRect.left - 5)}px`,
            width: `${targetRect.width + 10}px`,
            height: `${targetRect.height + 10}px`,
          }}
        />
      )}

      <div
        ref={calloutRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-step-title"
        className="fixed z-[72] w-[min(360px,calc(100vw-32px))] max-h-[calc(100dvh-32px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
        style={{ top: `${calloutPosition.top}px`, left: `${calloutPosition.left}px` }}
      >
        <div
          aria-hidden="true"
          className={`absolute h-3 w-3 rotate-45 bg-white border-slate-200 ${
            calloutPosition.placement === 'bottom'
              ? 'top-[-7px] border-l border-t'
              : 'bottom-[-7px] border-r border-b'
          }`}
          style={{ left: `${calloutPosition.arrowLeft}px` }}
        />

        <div className="relative space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="mt-0.5 rounded-xl bg-emerald-50 p-2 text-emerald-700">
                <GraduationCap className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Подсказка</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentStep + 1} из {TOUR_STEPS.length}</span>
                </div>
                <h3 id="tour-step-title" className="mt-0.5 text-base font-bold leading-snug text-slate-900">
                  {current.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={finishTour}
              aria-label="Закрыть обучение"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 text-xs leading-relaxed text-slate-600">
            <p>
              <strong className="text-slate-900">Что это:</strong> {current.meaning}
            </p>
            <p>
              <strong className="text-emerald-800">Зачем:</strong> {current.purpose}
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="h-4 w-4" />
              Назад
            </button>

            <div className="flex items-center gap-1" aria-hidden="true">
              {TOUR_STEPS.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep ? 'w-4 bg-emerald-500' : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-700"
            >
              {calloutPosition.placement === 'bottom' ? (
                <ArrowUp className="h-3.5 w-3.5 text-emerald-300" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5 text-emerald-300" />
              )}
              {isLast ? 'Готово' : 'Дальше'}
              {!isLast && <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
