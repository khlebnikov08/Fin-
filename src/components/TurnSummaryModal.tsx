import React from 'react';
import { TurnReport, MacroNews } from '../types/game';
import { ArrowUpRight, ArrowDownRight, Sparkles, TrendingUp, Briefcase, Landmark, ShieldCheck, ChevronRight, Flame, Rocket } from 'lucide-react';
import { sound } from '../utils/audio';

interface TurnSummaryModalProps {
  report: TurnReport | null;
  isOpen: boolean;
  onClose: () => void;
  inflationRate: number;
  currentNews?: MacroNews | null;
  isBalancedEconomy: boolean;
}

export const TurnSummaryModal: React.FC<TurnSummaryModalProps> = ({
  report,
  isOpen,
  onClose,
  inflationRate,
  currentNews,
  isBalancedEconomy,
}) => {
  if (!isOpen || !report) return null;

  const totalIncome =
    report.salaryIncome +
    report.businessIncome +
    (report.rentIncomeEarned || 0) +
    report.dividendsEarned +
    report.couponsEarned +
    report.depositInterestEarned +
    report.cashbackEarned +
    report.taxDeductionsEarned;

  const totalExpenses =
    report.mandatoryExpensesPaid +
    report.optionalExpensesPaid +
    report.insurancePaid +
    report.cardFeesPaid +
    report.loanPaymentsPaid +
    report.creditCardInterestPaid;
  const depositPrincipalReturned = isBalancedEconomy
    ? report.depositPrincipalReturned ?? Math.max(0, (report.depositMaturedReturned || 0) - report.depositInterestEarned)
    : report.depositMaturedReturned || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Годовой финансовый отчет</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-800">Итоги года {report.year}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading mt-0.5">
              Сводка изменений за год
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Инфляция за год</span>
            <span className="text-sm font-bold text-amber-600 tabular-nums">
              +{(inflationRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-xs text-emerald-800 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              Всего доходов
            </span>
            <div className="text-lg font-bold text-emerald-900 mt-1 tabular-nums">
              +{totalIncome.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
              Всего расходов
            </span>
            <div className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
              -{totalExpenses.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-100">
            <span className="text-xs text-teal-800 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
              Чистый денежный поток
            </span>
            <div
              className={`text-lg font-bold mt-1 tabular-nums ${
                report.netCashDelta >= 0 ? 'text-teal-900' : 'text-rose-700'
              }`}
            >
              {report.netCashDelta >= 0 ? '+' : ''}
              {report.netCashDelta.toLocaleString('ru-RU')} ₽
            </div>
          </div>
        </div>

        {isBalancedEconomy && (
          <p className="-mt-3 rounded-xl border border-teal-100 bg-teal-50/60 px-3 py-2 text-[11px] leading-relaxed text-teal-950">
            Чистый поток за полный год = доходы − расходы + возврат тела вклада + денежные события. Тело вклада — возврат собственного капитала, а проценты по ещё действующим вкладам остаются внутри вклада; они не считаются наличным доходом. Платежи по кредитам уже учтены в расходах.
          </p>
        )}

        {/* Detailed Incomes Breakdown */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Доходы и инвестиционная отдача
          </h3>
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <Briefcase className="w-4 h-4 text-slate-400" />
                Заработная плата
              </span>
              <span className="font-semibold text-slate-900 tabular-nums">
                +{report.salaryIncome.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            {report.businessIncome > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Прибыль бизнеса
                </span>
                <span className="font-semibold text-emerald-600 tabular-nums">
                  +{report.businessIncome.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {(report.rentIncomeEarned || 0) > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <Landmark className="w-4 h-4 text-cyan-500" />
                  Арендный доход недвижимости
                </span>
                <span className="font-semibold text-cyan-600 tabular-nums">
                  +{(report.rentIncomeEarned || 0).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {report.dividendsEarned > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Дивиденды по акциям
                </span>
                <span className="font-semibold text-blue-600 tabular-nums">
                  +{report.dividendsEarned.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {report.couponsEarned > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <Landmark className="w-4 h-4 text-amber-500" />
                  Купоны по облигациям
                </span>
                <span className="font-semibold text-amber-600 tabular-nums">
                  +{report.couponsEarned.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {report.depositInterestEarned > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <Landmark className="w-4 h-4 text-teal-500" />
                  {isBalancedEconomy ? 'Проценты по погашенным вкладам' : 'Проценты по вкладам'}
                </span>
                <span className="font-semibold text-teal-600 tabular-nums">
                  +{report.depositInterestEarned.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {isBalancedEconomy && (report.depositInterestAccrued || 0) > 0 && (
              <div className="flex items-center justify-between rounded-xl border border-teal-100 bg-teal-50/50 px-2.5 py-2 text-teal-900">
                <span className="flex items-center gap-2 text-xs sm:text-sm">
                  <Landmark className="w-4 h-4 text-teal-600 shrink-0" />
                  Начислено во вклады (остаётся в активе)
                </span>
                <span className="font-semibold tabular-nums">
                  +{(report.depositInterestAccrued || 0).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {Boolean(report.depositMaturedReturned && report.depositMaturedReturned > 0) && (
              <div className="flex items-center justify-between bg-teal-50/80 p-2.5 rounded-xl border border-teal-200 text-teal-950">
                <span className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <Landmark className="w-4 h-4 text-teal-600 shrink-0" />
                  {isBalancedEconomy ? 'Возврат тела вклада (не доход)' : 'Возврат закрытого вклада (тело + проценты)'}
                </span>
                <span className="font-extrabold text-teal-800 tabular-nums text-sm">
                  +{depositPrincipalReturned.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {report.cashbackEarned > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Кэшбэк по дебетовой карте
                </span>
                <span className="font-semibold text-purple-600 tabular-nums">
                  +{report.cashbackEarned.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {report.taxDeductionsEarned > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Налоговый вычет 13%
                </span>
                <span className="font-semibold text-emerald-600 tabular-nums">
                  +{report.taxDeductionsEarned.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Expenses & Deductions Breakdown */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Расходы и обязательства
          </h3>
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Обязательные расходы (жизнь, аренда, еда)</span>
              <span className="font-medium text-slate-900 tabular-nums">
                -{report.mandatoryExpensesPaid.toLocaleString('ru-RU')} ₽
              </span>
            </div>

            {report.optionalExpensesPaid > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Необязательные радости (отпуск, покупки)</span>
                <span className="font-medium text-slate-700 tabular-nums">
                  -{report.optionalExpensesPaid.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {report.insurancePaid > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Полисы страхования (ДМС, имущество)</span>
                <span className="font-medium text-slate-700 tabular-nums">
                  -{report.insurancePaid.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {isBalancedEconomy && report.cardFeesPaid > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Годовое обслуживание дебетовой карты</span>
                <span className="font-medium text-slate-700 tabular-nums">
                  -{report.cardFeesPaid.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {report.loanPaymentsPaid > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Платежи по кредитам в банке</span>
                <span className="font-medium text-rose-600 tabular-nums">
                  -{report.loanPaymentsPaid.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}

            {report.creditCardInterestPaid > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Проценты и штрафы по кредитной карте</span>
                <span className="font-semibold text-rose-600 tabular-nums">
                  -{report.creditCardInterestPaid.toLocaleString('ru-RU')} ₽
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Next Year Mandatory Expenses Change Highlight */}
        {report.nextYearMandatoryExpenses !== undefined && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-bold text-slate-900">
                Обязательный платеж на следующий год {report.year + 1}:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 line-through tabular-nums text-xs">
                  {report.mandatoryExpensesPaid.toLocaleString('ru-RU')} ₽
                </span>
                <span className="font-black text-slate-900 tabular-nums text-sm sm:text-base">
                  {report.nextYearMandatoryExpenses.toLocaleString('ru-RU')} ₽
                </span>
                {report.mandatoryExpensesDelta !== undefined && report.mandatoryExpensesDelta !== 0 && (
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                      report.mandatoryExpensesDelta > 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {report.mandatoryExpensesDelta > 0 ? '+' : ''}
                    {report.mandatoryExpensesDelta.toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>
            </div>
            {report.mandatoryExpensesReason && (
              <p className="text-xs text-slate-600 pt-1 border-t border-slate-200/70">
                {report.mandatoryExpensesReason}
              </p>
            )}
          </div>
        )}

        {/* Current Macro News of the Year */}
        {currentNews && (
          <div className="space-y-3">
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2.5 ${
                currentNews.cycleType === 'CRISIS' || currentNews.cycleType === 'STAGFLATION'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                  : currentNews.cycleType === 'BOOM' || currentNews.cycleType === 'TECH_RALLY'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 opacity-85">
                  {currentNews.cycleType === 'CRISIS' || currentNews.cycleType === 'STAGFLATION' ? (
                    <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
                  ) : currentNews.cycleType === 'BOOM' || currentNews.cycleType === 'TECH_RALLY' ? (
                    <Rocket className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-slate-600" />
                  )}
                  <span>
                    {currentNews.cycleType === 'CRISIS' || currentNews.cycleType === 'STAGFLATION'
                      ? 'Экономический спад на рынках'
                      : currentNews.cycleType === 'BOOM' || currentNews.cycleType === 'TECH_RALLY'
                      ? 'Экономический подъем на рынках'
                      : 'Экономическая повестка года'}
                  </span>
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 font-heading">
                  {currentNews.headline}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  {currentNews.summary}
                </p>
              </div>
            </div>

            {/* Central Bank Statement Card */}
            {currentNews.centralBank && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/90 text-xs sm:text-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-white border border-indigo-200 text-indigo-700 shadow-2xs font-bold text-[10px]">
                      ЦБ РФ
                    </span>
                    <strong className="text-xs text-indigo-950">
                      Решение Банка России по ключевой ставке
                    </strong>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      currentNews.centralBank.action === 'RAISE'
                        ? 'bg-rose-100 text-rose-800'
                        : currentNews.centralBank.action === 'CUT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {currentNews.centralBank.action === 'RAISE'
                      ? 'Повышение ставки ↑'
                      : currentNews.centralBank.action === 'CUT'
                      ? 'Снижение ставки ↓'
                      : 'Ставка сохранена ='}
                  </span>
                </div>
                <p className="text-xs text-indigo-900 leading-relaxed italic">
                  «{currentNews.centralBank.statement}»
                </p>
              </div>
            )}
          </div>
        )}

        {/* Events that took place */}
        {report.eventsSummary && report.eventsSummary.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              События и инциденты года
            </h3>
            <div className="space-y-1.5">
              {report.eventsSummary.map((eventText, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>{eventText}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Net Joy Change */}
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center justify-between text-xs sm:text-sm">
          <span className="text-amber-900 font-medium">Изменение уровня радости за год:</span>
          <span
            className={`font-bold tabular-nums ${
              report.joyDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {report.joyDelta >= 0 ? `+${report.joyDelta}` : report.joyDelta} пунктов
          </span>
        </div>

        {/* Action button */}
        <div className="pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-2xl shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>Продолжить игру (Год {report.year + 1})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
