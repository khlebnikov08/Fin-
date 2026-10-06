import assert from 'node:assert/strict';
import test from 'node:test';
import type { EducationTier } from '../types/game';
import {
  calculateAnnualNetCashFlow,
  getEducationCatalogForEdition,
  getReasonableSalaryCeiling,
  getStandardSalaryIndexationRate,
} from './balanceRules';

const educationTier = (overrides: Partial<EducationTier> = {}): EducationTier => ({
  id: 'courses_pro',
  name: 'Курсы',
  cost: 100_000,
  salaryBonusMultiplier: 0.18,
  joyBonus: 5,
  description: 'Срок: 1 год (+18% к окладу).',
  durationYears: 1,
  progressYears: 0,
  inProgress: false,
  completed: false,
  ...overrides,
});

test('standard salary indexation is partial, has a 3% floor, and is capped at 7%', () => {
  assert.equal(getStandardSalaryIndexationRate(0.04), 0.03);
  assert.equal(getStandardSalaryIndexationRate(0.08), 0.032);
  assert.equal(getStandardSalaryIndexationRate(0.165), 0.066);
  assert.equal(getStandardSalaryIndexationRate(0.5), 0.07);
});

test('education bonuses are lower only in the standard edition and descriptions stay in sync', () => {
  const tier = educationTier();
  const standard = getEducationCatalogForEdition([tier], false)[0];
  const yandex = getEducationCatalogForEdition([tier], true)[0];

  assert.equal(standard.salaryBonusMultiplier, 0.08);
  assert.match(standard.description, /\+8%/);
  assert.equal(yandex.salaryBonusMultiplier, 0.18);
  assert.match(yandex.description, /\+18%/);
});

test('legacy salary ceiling compounds only the new capped indexation and completed courses', () => {
  const ceiling = getReasonableSalaryCeiling({
    initialSalary: 1_200_000,
    year: 42,
    educationTiers: [educationTier({ completed: true })],
  });
  assert.ok(ceiling > 1_200_000);
  assert.ok(ceiling < 50_000_000);
});

test('annual net cash flow subtracts all expenses and includes cash events and returned principal', () => {
  const result = calculateAnnualNetCashFlow({
    salaryIncome: 531_338_902,
    businessIncome: 0,
    rentIncomeEarned: 8_617_448_294,
    dividendsEarned: 2_640_708_953,
    couponsEarned: 0,
    depositInterestEarned: 0,
    cashbackEarned: 41_751_598,
    taxDeductionsEarned: 0,
    mandatoryExpensesPaid: 1_391_719_928,
    optionalExpensesPaid: 0,
    insurancePaid: 0,
    cardFeesPaid: 1_500,
    loanPaymentsPaid: 0,
    creditCardInterestPaid: 0,
    depositPrincipalReturned: 0,
    eventCashDelta: 240_000,
  });

  assert.equal(result, 10_439_766_319);
});
