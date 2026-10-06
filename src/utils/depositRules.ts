import type { BankDeposit } from '../types/game';

export interface DepositYearResult {
  deposits: BankDeposit[];
  interestEarned: number;
  interestAccrued: number;
  maturedPayout: number;
  principalReturned: number;
}

/**
 * Compounds interest inside active deposits and returns principal plus all accrued
 * interest at maturity. The Yandex flag preserves its pre-balance settlement rules.
 */
export function resolveDepositYear(
  deposits: BankDeposit[],
  year: number,
  isYandexBuild: boolean
): DepositYearResult {
  let interestEarned = 0;
  let interestAccrued = 0;
  let maturedPayout = 0;
  let principalReturned = 0;
  const nextDeposits: BankDeposit[] = [];

  deposits.forEach((deposit) => {
    const yearsPassed = year + 1 - deposit.startYear;
    const interestForYear = Math.round(deposit.currentAmount * deposit.interestRate);
    const nextAmount = deposit.currentAmount + interestForYear;

    if (yearsPassed >= deposit.termYears) {
      maturedPayout += nextAmount;
      principalReturned += deposit.principal;
      interestEarned += isYandexBuild
        ? interestForYear
        : Math.max(0, nextAmount - deposit.principal);
    } else {
      if (isYandexBuild) interestEarned += interestForYear;
      else interestAccrued += interestForYear;
      nextDeposits.push({ ...deposit, currentAmount: nextAmount });
    }
  });

  return {
    deposits: nextDeposits,
    interestEarned,
    interestAccrued,
    maturedPayout,
    principalReturned,
  };
}
