import React, { useState } from 'react';
import {
  Wallet,
  Receipt,
  Heart,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Car,
  Home,
  ArrowRight,
  Sparkles,
  CreditCard as CreditCardIcon,
  ChevronDown,
  ChevronUp,
  Building,
} from 'lucide-react';
import {
  OptionalExpense,
  InsurancePolicy,
  DebitCard,
  CreditCard,
} from '../../types/game';
import { MandatoryExpensesBreakdown } from '../../utils/expenses';
import { sound } from '../../utils/audio';

interface OverviewTabProps {
  cash: number;
  netWorth: number;
  annualSalary: number;
  mandatoryExpensesCost: number;
  isMandatoryExpensesPaid: boolean;
  onPayMandatoryExpenses: (useCreditCard?: boolean) => void;
  optionalExpenses: OptionalExpense[];
  acceptedOptionalIds: string[];
  declinedOptionalIds: string[];
  onAcceptOptional: (expense: OptionalExpense) => void;
  onDeclineOptional: (expense: OptionalExpense) => void;
  insurances: InsurancePolicy[];
  onToggleInsurance: (type: 'HEALTH_DMS' | 'HOME' | 'CAR_CASCO') => void;
  hasCar: boolean;
  hasApartment: boolean;
  debitCard: DebitCard;
  creditCard: CreditCard;
  inflationRate: number;
  onAdvanceYear: () => void;
  year: number;
  emergencyFundMonths: number;
  breakdown?: MandatoryExpensesBreakdown;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  cash,
  netWorth,
  annualSalary,
  mandatoryExpensesCost,
  isMandatoryExpensesPaid,
  onPayMandatoryExpenses,
  optionalExpenses,
  acceptedOptionalIds,
  declinedOptionalIds,
  onAcceptOptional,
  onDeclineOptional,
  insurances,
  onToggleInsurance,
  hasCar,
  hasApartment,
  debitCard,
  creditCard,
  inflationRate,
  onAdvanceYear,
  year,
  emergencyFundMonths,
  breakdown,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const availableCredit = creditCard.limit - creditCard.usedAmount;
  const canPayCash = cash >= mandatoryExpensesCost;
  const canPayCredit = availableCredit >= mandatoryExpensesCost;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Annual Budget Summary & Mandatory Payment Block */}
      <div data-tour="mandatory-card" className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left: Financial Health Overview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <Receipt className="w-5 h-5" />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Бюджет Года {year}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Доход (зарплата):</span>
                <span className="font-bold text-emerald-700">+{annualSalary.toLocaleString('ru-RU')} ₽</span>
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Обязательные расходы:</span>
                <span className="font-bold text-slate-900">{mandatoryExpensesCost.toLocaleString('ru-RU')} ₽</span>
              </div>
              <span className="text-slate-300">·</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Подушка безопасности:</span>
                <span className={`font-semibold ${emergencyFundMonths >= 3 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {emergencyFundMonths.toFixed(1)} мес.
                </span>
              </div>
            </div>
          </div>

          {/* Right: Payment Action */}
          <div className="shrink-0 flex items-center gap-3">
            {isMandatoryExpensesPaid ? (
              <div className="py-2.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Обязательные расходы за год оплачены</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    sound.playCoin();
                    onPayMandatoryExpenses(false);
                  }}
                  disabled={!canPayCash}
                  className={`py-2.5 px-4 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
                    canPayCash
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>Оплатить {mandatoryExpensesCost.toLocaleString('ru-RU')} ₽</span>
                </button>

                {!canPayCash && canPayCredit && (
                  <button
                    onClick={() => {
                      sound.playCoin();
                      onPayMandatoryExpenses(true);
                    }}
                    className="py-2.5 px-3 rounded-xl font-medium text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors flex items-center gap-1.5"
                    title="Оплатить с кредитной карты без процентов на 1 год"
                  >
                    <CreditCardIcon className="w-4 h-4 text-amber-700" />
                    <span>В кредит (грейс 1 год)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Breakdown sub-row with interactive expander */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{hasApartment ? 'Своё жильё (экономия на аренде)' : 'Базовая аренда жилья включена'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{hasCar ? 'Автомобиль (+бензин и обслуживание)' : 'Общественный транспорт'}</span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Инфляция: +{(inflationRate * 100).toFixed(1)}%</span>
            </span>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer ml-2"
            >
              <span>{showBreakdown ? 'Скрыть детали' : 'Детализация'}</span>
              {showBreakdown ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Detailed Breakdown Drawer */}
        {showBreakdown && breakdown && (
          <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2.5 animate-in fade-in duration-150">
            <span className="font-bold text-slate-900 block text-xs">
              Из чего состоит обязательный платеж ({breakdown.total.toLocaleString('ru-RU')} ₽):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Подоходный налог (НДФЛ 13%)</span>
                <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                  {breakdown.incomeTax.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">13% с заработной платы</span>
              </div>

              {(breakdown.businessTax > 0 || breakdown.propertyTax > 0 || breakdown.transportTax > 0) && (
                <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Налоги (бизнес, авто, жилье)</span>
                  <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                    {(breakdown.businessTax + breakdown.propertyTax + breakdown.transportTax).toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {breakdown.propertyTax > 0 && `Недвижимость: ${breakdown.propertyTax.toLocaleString('ru-RU')} ₽. `}
                    {breakdown.transportTax > 0 && `Транспорт: ${breakdown.transportTax.toLocaleString('ru-RU')} ₽. `}
                    {breakdown.businessTax > 0 && `Бизнес 6%: ${breakdown.businessTax.toLocaleString('ru-RU')} ₽.`}
                  </span>
                </div>
              )}

              <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Питание, одежда и быт</span>
                <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                  {breakdown.livingCosts.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Базовые жизненные расходы</span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {hasApartment ? 'Своё жильё' : 'Аренда квартиры'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                  {breakdown.housingCosts.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  {hasApartment ? 'Коммуналка и обслуживание (аренда 0 ₽)' : 'Аренда квартиры в городе'}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {hasCar ? 'Автомобиль' : 'Транспорт'}
                </span>
                <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                  {breakdown.transportCosts.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {hasCar ? 'Бензин, ТО и расходники' : 'Общественный транспорт'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
              <strong>Финансовая дисциплина:</strong> Обязательный платеж включает все налоги физлица, арендные или коммунальные обязательства, транспорт и питание.
            </p>
          </div>
        )}
      </div>

      {/* 2. Side-by-Side: Optional Joys & Risk Protection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Optional Expenses (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <span>События и желания года</span>
            </h3>
            <span className="text-[11px] text-slate-500">Покупки для душевной радости</span>
          </div>

          <div className="space-y-2.5">
            {optionalExpenses.map((expense) => {
              const isAccepted = acceptedOptionalIds.includes(expense.id);
              const isDeclined = declinedOptionalIds.includes(expense.id);

              return (
                <div
                  key={expense.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isAccepted
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isDeclined
                      ? 'border-slate-100 bg-slate-50/50 opacity-60'
                      : 'border-slate-200/90 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">{expense.title}</span>
                      <span className="font-bold text-xs text-slate-700 tabular-nums">
                        {expense.cost.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {expense.description}
                    </p>
                    <div className="text-[10px] flex items-center gap-2 text-emerald-600 font-medium">
                      <span>+{expense.joyDeltaIfAccepted} радости</span>
                      {expense.joyDeltaIfDeclined < 0 && (
                        <span className="text-slate-400">({expense.joyDeltaIfDeclined} при отказе)</span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {isAccepted ? (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Куплено
                      </span>
                    ) : isDeclined ? (
                      <span className="text-[11px] text-slate-400 px-2 py-1">
                        Пропущено
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            sound.playJoy();
                            onAcceptOptional(expense);
                          }}
                          disabled={cash < expense.cost}
                          className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                            cash >= expense.cost
                              ? 'bg-slate-900 hover:bg-slate-800 text-white'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Купить
                        </button>
                        <button
                          onClick={() => {
                            sound.playClick();
                            onDeclineOptional(expense);
                          }}
                          className="py-1.5 px-2.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          Пропустить
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Insurances (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Страхование (на 1 год)</span>
            </h3>
            <span className="text-[11px] text-slate-500">Защита от ЧП</span>
          </div>

          <div className="space-y-2.5">
            {insurances.map((ins) => {
              const isCar = ins.type === 'CAR_CASCO';
              const isHome = ins.type === 'HOME';
              const isDisabled = (isCar && !hasCar) || (isHome && !hasApartment);

              return (
                <div
                  key={ins.type}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    ins.active
                      ? 'border-teal-200 bg-teal-50/20'
                      : isDisabled
                      ? 'border-slate-100 bg-slate-50/50 opacity-40'
                      : 'border-slate-200/90 bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">{ins.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {ins.annualCost.toLocaleString('ru-RU')} ₽ / год
                    </p>
                  </div>

                  <button
                    disabled={isDisabled || (!ins.active && cash < ins.annualCost)}
                    onClick={() => {
                      sound.playCoin();
                      onToggleInsurance(ins.type);
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                      ins.active
                        ? 'bg-teal-600 text-white'
                        : isDisabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {ins.active ? '✓ Активен' : 'Оформить'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Turn Advancement Action Button */}
      <div className="pt-2">
        <button
          data-tour="btn-advance-year"
          onClick={() => {
            sound.playCoin();
            onAdvanceYear();
          }}
          disabled={!isMandatoryExpensesPaid}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-xs ${
            isMandatoryExpensesPaid
              ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer hover:shadow-md'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Завершить Год {year} и перейти к следующему</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {!isMandatoryExpensesPaid && (
          <p className="text-center text-xs text-rose-600 font-medium mt-2 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Для перехода к следующему году сначала оплатите обязательные расходы выше</span>
          </p>
        )}
      </div>
    </div>
  );
};
