import type { EducationTier, TurnReport } from '../types/game';

export const STANDARD_BALANCE_VERSION = 2;

const STANDARD_EDUCATION_BONUSES: Record<string, number> = {
  courses_pro: 0.08,
  second_degree: 0.12,
  mba_program: 0.16,
  abroad_study: 0.20,
};

/** Wage indexation follows inflation only partially and is capped at 7% nominal. */
export function getStandardSalaryIndexationRate(inflationRate: number): number {
  return Math.min(0.07, Math.max(0.03, Math.max(0, inflationRate) * 0.4));
}

export function getStandardEducationBonus(tier: Pick<EducationTier, 'id' | 'salaryBonusMultiplier'>): number {
  return STANDARD_EDUCATION_BONUSES[tier.id] ?? Math.min(0.2, Math.max(0.05, tier.salaryBonusMultiplier));
}

export function getEducationCatalogForEdition(
  tiers: EducationTier[],
  isYandexBuild: boolean
): EducationTier[] {
  return tiers.map((tier) => {
    if (isYandexBuild) return { ...tier };

    const salaryBonusMultiplier = getStandardEducationBonus(tier);
    const percentLabel = `+${Math.round(salaryBonusMultiplier * 100)}%`;
    return {
      ...tier,
      salaryBonusMultiplier,
      description: tier.description.replace(/\+\d+%/g, percentLabel),
    };
  });
}

/** A one-time ceiling used only when migrating old standard-edition saves. */
export function getReasonableSalaryCeiling(params: {
  initialSalary: number;
  year: number;
  educationTiers: EducationTier[];
}): number {
  const educationMultiplier = params.educationTiers.reduce(
    (multiplier, tier) => multiplier * (tier.completed ? 1 + getStandardEducationBonus(tier) : 1),
    1
  );
  const indexedBase = params.initialSalary * Math.pow(1.07, Math.max(0, Math.min(60, params.year - 1)));
  return Math.round(indexedBase * educationMultiplier * 1.1);
}

export type AnnualCashFlowInput = Pick<
  TurnReport,
  | 'salaryIncome'
  | 'businessIncome'
  | 'rentIncomeEarned'
  | 'dividendsEarned'
  | 'couponsEarned'
  | 'depositInterestEarned'
  | 'cashbackEarned'
  | 'taxDeductionsEarned'
  | 'mandatoryExpensesPaid'
  | 'optionalExpensesPaid'
  | 'insurancePaid'
  | 'cardFeesPaid'
  | 'loanPaymentsPaid'
  | 'creditCardInterestPaid'
> & {
  depositPrincipalReturned: number;
  eventCashDelta: number;
};

/** Full-year net flow, including expenses already paid before the year-end settlement. */
export function calculateAnnualNetCashFlow(input: AnnualCashFlowInput): number {
  const income =
    input.salaryIncome +
    input.businessIncome +
    (input.rentIncomeEarned || 0) +
    input.dividendsEarned +
    input.couponsEarned +
    input.depositInterestEarned +
    input.cashbackEarned +
    input.taxDeductionsEarned;
  const expenses =
    input.mandatoryExpensesPaid +
    input.optionalExpensesPaid +
    input.insurancePaid +
    input.cardFeesPaid +
    input.loanPaymentsPaid +
    input.creditCardInterestPaid;

  return income + input.depositPrincipalReturned + input.eventCashDelta - expenses;
}
