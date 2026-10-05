import React, { useState } from 'react';
import { Loan, CreditCard, DebitCard } from '../../types/game';
import {
  CreditCard as CreditCardIcon,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface BankingTabProps {
  cash: number;
  annualSalary: number;
  loans: Loan[];
  onTakeLoan: (amount: number, termYears: number, interestRate: number) => void;
  onRepayLoanEarly: (loanId: string, amount: number) => void;
  creditCard: CreditCard;
  onUseCreditCard: (amount: number) => void;
  onRepayCreditCard: (amount: number) => void;
  debitCard: DebitCard;
  onToggleDebitCard: () => void;
  keyRate: number;
}

export const BankingTab: React.FC<BankingTabProps> = ({
  cash,
  annualSalary,
  loans,
  onTakeLoan,
  onRepayLoanEarly,
  creditCard,
  onUseCreditCard,
  onRepayCreditCard,
  debitCard,
  onToggleDebitCard,
  keyRate,
}) => {
  // Loan Form State
  const [loanTermYears, setLoanTermYears] = useState<number>(5);
  const existingAnnualPayments = loans.reduce((acc, l) => acc + l.annualPayment, 0);
  const maxAnnualPaymentLimit = annualSalary * 0.5 - existingAnnualPayments;

  // Loan interest rate derived from key rate (e.g., keyRate + 2.5%)
  const loanInterestRate = Math.max(0.085, keyRate + 0.025);

  // Calculate max loan amount based on max annual payment and term
  // P = A * [1 - (1+r)^-n] / r
  const r = loanInterestRate;
  const n = loanTermYears;
  const annuityFactor = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const maxPossiblePrincipal = Math.max(0, Math.floor(maxAnnualPaymentLimit / annuityFactor));

  const [chosenLoanAmount, setChosenLoanAmount] = useState<number>(
    Math.min(1000000, Math.max(100000, Math.floor(maxPossiblePrincipal * 0.5)))
  );

  const calculatedAnnualPayment = Math.round(chosenLoanAmount * annuityFactor);
  const totalLoanPayout = calculatedAnnualPayment * loanTermYears;
  const totalOverpayment = Math.max(0, totalLoanPayout - chosenLoanAmount);
  const approxInterestPart = Math.round(chosenLoanAmount * loanInterestRate);
  const approxPrincipalPart = Math.max(0, calculatedAnnualPayment - approxInterestPart);

  // Credit card repay / use state
  const [repayAmount, setRepayAmount] = useState<number>(creditCard.usedAmount);
  const [borrowAmount, setBorrowAmount] = useState<number>(100000);

  const handleTakeLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chosenLoanAmount <= 0 || chosenLoanAmount > maxPossiblePrincipal) return;
    sound.playCoin();
    onTakeLoan(chosenLoanAmount, loanTermYears, loanInterestRate);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Банковские услуги, Карты и Кредиты
          </h3>
          <p className="text-xs text-slate-500">
            Управляйте заемным капиталом, кэшбэком и кредитными лимитами
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Свободно наличных: <span className="font-bold text-slate-900 tabular-nums">{cash.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      {/* 2-Column Cards Section (Debit Card & Credit Card) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DEBIT CARD (IMG_9114) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900">
                    Дебетовая карта с кэшбэком
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Возврат 3% от всех покупок и расходов
                  </span>
                </div>
              </div>

              {debitCard.active ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                  Активна
                </span>
              ) : (
                <span className="text-xs text-slate-400">Не подключена</span>
              )}
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Карта возвращает 3% кэшбэка со всех обязательных и необязательных покупок за год.
              Обслуживание — {debitCard.annualFee.toLocaleString('ru-RU')} ₽ в год (включается в обязательные расходы).
            </p>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs mb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Ставка кэшбэка:</span>
                <span className="font-bold text-purple-600 tabular-nums">+{(debitCard.cashbackRate * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Стоимость обслуживания:</span>
                <span className="font-medium text-slate-800 tabular-nums">{debitCard.annualFee.toLocaleString('ru-RU')} ₽ / год</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playCoin();
              onToggleDebitCard();
            }}
            disabled={!debitCard.active && cash < debitCard.annualFee}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors ${
              debitCard.active
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                : cash >= debitCard.annualFee
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {debitCard.active
              ? 'Отключить дебетовую карту'
              : `Оформить карту (${debitCard.annualFee.toLocaleString('ru-RU')} ₽ первый год)`}
          </button>
        </div>

        {/* CREDIT CARD (IMG_9115) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <CreditCardIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900">
                    Кредитная карта
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Льготный период 1 год · До 50% от годовой зарплаты
                  </span>
                </div>
              </div>

              {creditCard.usedAmount > 0 && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg tabular-nums">
                  Долг: {creditCard.usedAmount.toLocaleString('ru-RU')} ₽
                </span>
              )}
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs mb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Кредитный лимит:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {creditCard.limit.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Доступно к займу:</span>
                <span className="font-semibold text-emerald-600 tabular-nums">
                  {(creditCard.limit - creditCard.usedAmount).toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Льготный период (Grace):</span>
                <span
                  className={`font-semibold ${
                    creditCard.isOverdue ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {creditCard.isOverdue
                    ? 'Истек! Штраф +28% годовых'
                    : creditCard.usedAmount > 0
                    ? '1 год без процентов'
                    : '1 год при открытии'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-rose-600 font-medium mb-3">
              * Важно: Игру нельзя завершить, если не погашена задолженность по кредитной карте!
            </p>
          </div>

          {/* Repay or Borrow actions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {creditCard.usedAmount > 0 ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    sound.playCoin();
                    onRepayCreditCard(creditCard.usedAmount);
                  }}
                  disabled={cash < creditCard.usedAmount}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                    cash >= creditCard.usedAmount
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Погасить весь долг ({creditCard.usedAmount.toLocaleString('ru-RU')} ₽)
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    sound.playCoin();
                    onUseCreditCard(Math.min(100000, creditCard.limit));
                  }}
                  disabled={creditCard.limit <= 0}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Взять 100 000 ₽ с карты в грейс-период
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BANK LOANS (Replicating IMG_9102) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 font-heading">
                Банковский кредит (Сбербанк / Топ банк)
              </h4>
              <p className="text-xs text-slate-500">
                Ставка: {(loanInterestRate * 100).toFixed(1)}% годовых · Срок: от 1 до 5 лет
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-right">
            <span>Макс. годовой платеж: </span>
            <span className="font-bold text-slate-900 tabular-nums">
              {Math.max(0, Math.round(maxAnnualPaymentLimit)).toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>

        <form onSubmit={handleTakeLoanSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Term Slider 1-5 years (as in IMG_9102) */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Срок кредита:</span>
                <span className="text-slate-900 tabular-nums font-bold">
                  {loanTermYears} {loanTermYears === 1 ? 'год' : loanTermYears < 5 ? 'года' : 'лет'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 год</span>
                <span>2 года</span>
                <span>3 года</span>
                <span>4 года</span>
                <span>5 лет</span>
              </div>
            </div>

            {/* Amount Slider */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Сумма кредита:</span>
                <span className="text-slate-900 tabular-nums font-bold">
                  {chosenLoanAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <input
                type="range"
                min={50000}
                max={Math.max(50000, maxPossiblePrincipal)}
                step={50000}
                value={Math.min(chosenLoanAmount, maxPossiblePrincipal)}
                onChange={(e) => setChosenLoanAmount(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>50k ₽</span>
                <span>Лимит: {maxPossiblePrincipal.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>

          {/* Payment breakdown card with full interest and principal transparency */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-emerald-950 font-bold block text-sm">
                  Ежегодный платеж по кредиту (аннуитет):
                </span>
                <span className="text-xs text-emerald-800">
                  Включает выплату части долга и начисленные проценты ({loanTermYears} {loanTermYears === 1 ? 'год' : loanTermYears < 5 ? 'года' : 'лет'})
                </span>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-950 tabular-nums">
                  {calculatedAnnualPayment.toLocaleString('ru-RU')} ₽ / год
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 text-[11px]">
              <div>
                <span className="text-slate-500 block">Ставка банка:</span>
                <span className="font-bold text-slate-800">{(loanInterestRate * 100).toFixed(1)}% годовых</span>
              </div>
              <div>
                <span className="text-slate-500 block">Тело долга в год:</span>
                <span className="font-bold text-slate-800">~{approxPrincipalPart.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div>
                <span className="text-slate-500 block">Проценты в год:</span>
                <span className="font-bold text-amber-700">~{approxInterestPart.toLocaleString('ru-RU')} ₽</span>
              </div>
              <div>
                <span className="text-slate-500 block">Переплата за {loanTermYears} лет:</span>
                <span className="font-bold text-slate-800">{totalOverpayment.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>

          {/* Educational Financial Leverage Tip */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Зачем брать кредит: Механика финансового рычага (Leverage)</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Кредит под {(loanInterestRate * 100).toFixed(1)}% годовых — мощный инструмент, если вложить деньги в проекты с доходностью выше банковской ставки:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
              <li><strong>Открытие бизнеса:</strong> Кофейня или IT-агентство приносят +25–30% годовых (чистый плюс после выплаты процентов!).</li>
              <li><strong>Инвестиции в образование:</strong> MBA удваивает зарплату (+60–100%) на всю оставшуюся игру.</li>
              <li><strong>Дивидендные акции:</strong> Дивиденды (10–13%) плюс рост цены акций дают средний доход 18–25% в год.</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={maxPossiblePrincipal <= 0 || chosenLoanAmount <= 0}
              className={`py-3 px-6 rounded-xl font-bold text-xs sm:text-sm transition-colors ${
                maxPossiblePrincipal > 0 && chosenLoanAmount > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Взять кредит на {chosenLoanAmount.toLocaleString('ru-RU')} ₽ (на {loanTermYears} {loanTermYears === 1 ? 'год' : loanTermYears < 5 ? 'года' : 'лет'})
            </button>
          </div>
        </form>

        {/* Existing Active Loans Table */}
        <div data-tour="banking-loans" className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Действующие кредитные договоры
            </h5>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              ✓ Доступно досрочное/заочное погашение без комиссий
            </span>
          </div>
          {loans.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
              У вас нет активных кредитов. Отличная финансовая независимость!
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => {
                const maxRepay = Math.min(cash, loan.remainingDebt);
                return (
                  <div
                    key={loan.id}
                    className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-slate-900">{loan.bankName}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">
                            Осталось {loan.yearsRemaining} {loan.yearsRemaining === 1 ? 'год' : 'года/лет'}
                          </span>
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          Ставка договора: <span className="font-semibold text-slate-800">{(loan.annualInterestRate * 100).toFixed(1)}% годовых</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-slate-400 block">Остаток основного долга</span>
                        <span className="text-base font-extrabold text-slate-900 tabular-nums">
                          {loan.remainingDebt.toLocaleString('ru-RU')} ₽
                        </span>
                        <span className="text-[11px] text-rose-600 block font-semibold">
                          Обязательный платеж: -{loan.annualPayment.toLocaleString('ru-RU')} ₽/год
                        </span>
                      </div>
                    </div>

                    {/* Early Repayment Quick Controls */}
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 text-[11px]">
                          Заочное / досрочное погашение онлайн:
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Доступно свободных: <strong className="text-emerald-700">{cash.toLocaleString('ru-RU')} ₽</strong>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Quick Action: Full Payoff */}
                        <button
                          onClick={() => {
                            sound.playCoin();
                            onRepayLoanEarly(loan.id, loan.remainingDebt);
                          }}
                          disabled={cash < loan.remainingDebt}
                          className={`py-2 px-3.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                            cash >= loan.remainingDebt
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                          title="Погасить кредит полностью и навсегда обнулить ежегодный платеж"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Погасить весь долг ({loan.remainingDebt.toLocaleString('ru-RU')} ₽)</span>
                        </button>

                        {/* Partial Payoff Presets */}
                        {[100000, 250000, 500000, 1000000].map((amt) => {
                          if (amt >= loan.remainingDebt) return null;
                          const canAfford = cash >= amt;
                          return (
                            <button
                              key={amt}
                              onClick={() => {
                                sound.playCoin();
                                onRepayLoanEarly(loan.id, amt);
                              }}
                              disabled={!canAfford}
                              className={`py-2 px-3 rounded-xl font-semibold text-xs transition-colors ${
                                canAfford
                                  ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              Внести {amt.toLocaleString('ru-RU')} ₽
                            </button>
                          );
                        })}

                        {/* Half Debt preset */}
                        {loan.remainingDebt > 100000 && (
                          <button
                            onClick={() => {
                              const half = Math.floor(loan.remainingDebt * 0.5);
                              sound.playCoin();
                              onRepayLoanEarly(loan.id, half);
                            }}
                            disabled={cash < Math.floor(loan.remainingDebt * 0.5)}
                            className={`py-2 px-3 rounded-xl font-semibold text-xs transition-colors ${
                              cash >= Math.floor(loan.remainingDebt * 0.5)
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            Внести 50% ({Math.floor(loan.remainingDebt * 0.5).toLocaleString('ru-RU')} ₽)
                          </button>
                        )}
                      </div>

                      {cash < loan.remainingDebt && (
                        <p className="text-[11px] text-slate-500">
                          💡 Каждая внесенная сумма сразу уменьшает тело кредита и снижает ежегодный платеж по аннуитету на следующий ход!
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
