import assert from 'node:assert/strict';
import test from 'node:test';
import type { BankDeposit } from '../types/game';
import { resolveDepositYear } from './depositRules';

const deposit = (overrides: Partial<BankDeposit> = {}): BankDeposit => ({
  id: 'deposit_test',
  bankName: 'Тестовый банк',
  bankType: 'STATE_TOP',
  interestRate: 0.1,
  termYears: 3,
  startYear: 1,
  principal: 1_000_000,
  currentAmount: 1_210_000,
  isInsuredAsv: true,
  ...overrides,
});

test('active standard deposit capitalizes interest without treating it as cash income', () => {
  const result = resolveDepositYear([deposit()], 1, false);
  assert.equal(result.interestEarned, 0);
  assert.equal(result.interestAccrued, 121_000);
  assert.equal(result.maturedPayout, 0);
  assert.equal(result.deposits[0].currentAmount, 1_331_000);
});

test('maturing standard deposit returns principal and recognizes the full compounded interest once', () => {
  const result = resolveDepositYear([deposit({ termYears: 2 })], 2, false);
  assert.equal(result.deposits.length, 0);
  assert.equal(result.maturedPayout, 1_331_000);
  assert.equal(result.principalReturned, 1_000_000);
  assert.equal(result.interestEarned, 331_000);
  assert.equal(result.interestAccrued, 0);
});

test('legacy Yandex deposit settlement keeps its previous annual-interest behavior', () => {
  const result = resolveDepositYear([deposit({ termYears: 5 })], 1, true);
  assert.equal(result.interestEarned, 121_000);
  assert.equal(result.interestAccrued, 0);
  assert.equal(result.deposits[0].currentAmount, 1_331_000);
});
