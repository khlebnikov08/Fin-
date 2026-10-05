import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Target,
  Heart,
  TrendingUp,
  Receipt,
  Landmark,
  GraduationCap,
  CheckCircle2,
  HelpCircle,
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Building2,
  Briefcase,
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
  badge: string;
  targetSelector: string;
  targetTab?: ActiveTab;
  whatItDoes: string;
  whyYouNeedIt: string;
  proTip?: string;
  arrowDirection: 'up' | 'down' | 'left' | 'right';
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: TourStep[] = [
    {
      title: 'Свободные деньги и Общий капитал',
      badge: 'Шаг 1 из 6: Финансы игрока',
      targetSelector: '[data-tour="status-cash"]',
      targetTab: 'overview',
      whatItDoes: 'Показывает свободную наличность на расчетном счете и чистый капитал (все активы: акции, вклады, недвижимость, бизнес минус долги по кредитам).',
      whyYouNeedIt: 'Свободные деньги используются для оплаты годовых расходов, налогов, покупки квартир, акций, крипты и масштабирования бизнеса.',
      proTip: 'Держите подушку безопасности минимум на 3–6 месяцев обязательных расходов!',
      arrowDirection: 'up',
    },
    {
      title: 'Шкала Радости и Эмоциональный баланс',
      badge: 'Шаг 2 из 6: Счастье и выгорание',
      targetSelector: '[data-tour="status-joy"]',
      targetTab: 'overview',
      whatItDoes: 'Отображает уровень вашего счастья (0–100). Каждый год рабочая рутина снижает радость (-8 пунктов), а неожиданные события могут как обрадовать, так и огорчить.',
      whyYouNeedIt: 'Если радость упадет ниже 30, наступит выгорание (-20% к доходу!). Покупайте новый телефон, отпуска, хобби и занимайтесь благотворительностью для поддержания высокой радости.',
      proTip: 'Для победы в игре держите радость выше 80 пунктов!',
      arrowDirection: 'up',
    },
    {
      title: 'Обязательный платеж года и Бюджет',
      badge: 'Шаг 3 из 6: Ежегодные обязательства',
      targetSelector: '[data-tour="mandatory-card"]',
      targetTab: 'overview',
      whatItDoes: 'Ежегодная сумма налога 13% НДФЛ, базового питания, ЖКХ, аренды жилья и содержания автомобиля. Содержит подробный калькулятор-раскладку.',
      whyYouNeedIt: 'Обязательный платеж необходимо погасить до перехода к следующему году. При покупке собственной квартиры расходы на аренду навсегда обнуляются!',
      proTip: 'Оплатить можно наличными или кредитной картой с беспроцентным грейс-периодом 1 год.',
      arrowDirection: 'down',
    },
    {
      title: 'Вкладка «Инвестиции» и 6 Рынков',
      badge: 'Шаг 4 из 6: Приумножение капитала',
      targetSelector: '[data-tour="nav-investments"]',
      targetTab: 'investments',
      whatItDoes: 'Предоставляет доступ к 6 классам активов: 8 дивидендным акциям, облигациям ОФЗ, банковским вкладам с АСВ, криптовалюте (с оптовой покупкой/продажей), рынку недвижимости и бизнес-империи.',
      whyYouNeedIt: 'Позволяет вложить любой крупный капитал на 10–15+ годах игры, сдавать квартиры в аренду, делать ремонт и выводить свой бизнес на IPO Мосбиржи!',
      proTip: 'Дивиденды, купоны и аренда автоматически начисляются на баланс в начале каждого года.',
      arrowDirection: 'up',
    },
    {
      title: 'Вкладка «Банки & Карты» и Кредитный рычаг',
      badge: 'Шаг 5 из 6: Финансовые инструменты',
      targetSelector: '[data-tour="nav-banking"]',
      targetTab: 'banking',
      whatItDoes: 'Содержит кредиты с прозрачным аннуитетом, дебетовую карту с 3% кэшбэком, кредитку и механизм мгновенного онлайн-погашения долга.',
      whyYouNeedIt: 'Кредитный рычаг под ставку ЦБ позволяет быстро запустить высокодоходный бизнес (доходность 25–35%) или оплатить MBA, а затем досрочно закрыть долг без штрафов.',
      proTip: 'Вы можете в любой момент погасить кредит досрочно — полностью или частично.',
      arrowDirection: 'up',
    },
    {
      title: 'Кнопка «Завершить год»',
      badge: 'Шаг 6 из 6: Переход к новому году жизни',
      targetSelector: '[data-tour="btn-advance-year"]',
      targetTab: 'overview',
      whatItDoes: 'Продвигает вашу жизнь на 1 год вперед: зачисляет зарплату, дивиденды от акций, купоны и прибыль от бизнеса, списывает платежи и запускает случайное событие года.',
      whyYouNeedIt: 'События года сбалансированы: среди них есть как приятные возможности, так и непредвиденные жизненные ситуации или моральные дилеммы с выбором.',
      proTip: 'Страхуйте здоровье и имущество — полис защитит от крупных случайных расходов!',
      arrowDirection: 'down',
    },
  ];

  const current = steps[currentStep];

  // Update target rect
  const updateRect = useCallback(() => {
    if (!isOpen) return;
    const el = document.querySelector(current.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, current.targetSelector]);

  useEffect(() => {
    if (!isOpen) return;
    if (current.targetTab && onNavigateTab) {
      onNavigateTab(current.targetTab);
    }
    const timer = setTimeout(updateRect, 100);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isOpen, currentStep, current.targetTab, onNavigateTab, updateRect]);

  if (!isOpen) return null;

  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    sound.playClick();
    if (isLast) {
      localStorage.setItem('finlife_tour_completed', 'true');
      if (onNavigateTab) onNavigateTab('overview');
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    sound.playClick();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    sound.playClick();
    localStorage.setItem('finlife_tour_completed', 'true');
    if (onNavigateTab) onNavigateTab('overview');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Target Element Spotlight Highlight Box */}
      {targetRect && (
        <div
          className="fixed rounded-2xl border-2 border-emerald-400 pointer-events-none transition-all duration-300 z-50 shadow-[0_0_0_9999px_rgba(15,23,42,0.65),0_0_25px_rgba(52,211,153,0.6)] ring-4 ring-emerald-400/40"
          style={{
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        >
          {/* Animated Glowing Spotlight Badge */}
          <div className="absolute -top-3 left-3 bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 animate-bounce">
            <Sparkles className="w-3 h-3" />
            <span>В фокусе</span>
          </div>
        </div>
      )}

      {/* Floating Guided Tour Card with Interactive Pointer Arrow */}
      <div className="fixed inset-x-4 bottom-6 sm:bottom-10 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 max-w-xl w-full">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header Row: Badge & Close */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                {current.badge}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Шаг {currentStep + 1} из {steps.length}
              </span>
            </div>

            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              title="Пропустить обучение"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title & Animated Pointer Indicator */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                {current.title}
              </h3>
            </div>
          </div>

          {/* What it does / Why you need it Cards */}
          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-slate-800">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Что это делает:
              </span>
              <p className="text-slate-600 leading-relaxed pl-3.5">
                {current.whatItDoes}
              </p>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/80 space-y-1">
              <span className="font-bold text-emerald-950 block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                Для чего это нужно:
              </span>
              <p className="text-emerald-900/90 leading-relaxed pl-3.5">
                {current.whyYouNeedIt}
              </p>
            </div>

            {current.proTip && (
              <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-[11px] sm:text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Совет:</strong> {current.proTip}
                </span>
              </div>
            )}
          </div>

          {/* Controls Footer */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={handleSkip}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Пропустить
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Назад</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1.5"
              >
                <span>{isLast ? 'Завершить обучение 🎉' : 'Далее'}</span>
                {!isLast && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
