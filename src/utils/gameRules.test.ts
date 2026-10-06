import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyCashMovement,
  calculateAnnualStockDividends,
  combineEventChoiceImpact,
  calculateInvestedAssetsValue,
  calculateNetWorth,
  evaluateGoalStatus,
  evaluateYearEndOutcome,
  processAnnualBondDefaults,
  protectEventLossWithEmergencyFund,
  salaryJoyMultiplier,
  UNPAID_CREDIT_CARD_GAME_OVER_LIMIT,
  UNPAID_CREDIT_CARD_GAME_OVER_REASON,
} from './gameRules';
import { BondAsset, LifeGoal, StockAsset } from '../types/game';

const apartmentGoal: LifeGoal = {
  id: 'goal_apartment',
  title: 'Own home',
  description: '',
  targetCapital: 10_000_000,
  minJoy: 80,
  requiredAssets: {
    hasApartment: true,
    primaryResidenceValueTarget: 7_000_000,
    cashReserveTarget: 3_000_000,
  },
};

const completedApartmentInput = {
  mode: 'GOAL' as const,
  goal: apartmentGoal,
  netWorth: 10_500_000,
  cash: 3_100_000,
  joy: 85,
  hasApartment: true,
  primaryResidenceValue: 7_400_000,
  hasBusiness: false,
  passiveIncome: 0,
  creditCardDebt: 0,
};

const stock = (overrides: Partial<StockAsset> = {}): StockAsset => ({
  id: 'stock_test',
  name: 'Test stock',
  ticker: 'TEST',
  sector: 'Test',
  description: '',
  price: 1_000,
  prevPrice: 1_000,
  dividendYield: 0.1,
  risk: 'low',
  ownedShares: 0,
  history: [1_000],
  ...overrides,
});

const bond = (overrides: Partial<BondAsset> = {}): BondAsset => ({
  id: 'bond_test',
  name: 'Test bond',
  type: 'CORP',
  couponRate: 0.1,
  faceValue: 1_000,
  riskText: '',
  defaultChance: 0,
  ownedCount: 0,
  ...overrides,
});

test('home goal requires residence, minimum residence value, cash reserve, joy, capital, and no card debt', () => {
  assert.equal(evaluateGoalStatus(completedApartmentInput).canClaimVictory, true);
  assert.equal(
    evaluateGoalStatus({ ...completedApartmentInput, cash: 2_999_999 }).canClaimVictory,
    false
  );
  assert.equal(
    evaluateGoalStatus({ ...completedApartmentInput, primaryResidenceValue: 6_999_999 }).canClaimVictory,
    false
  );
  assert.equal(
    evaluateGoalStatus({ ...completedApartmentInput, hasApartment: false }).canClaimVictory,
    false
  );
  assert.equal(
    evaluateGoalStatus({ ...completedApartmentInput, creditCardDebt: 1 }).canClaimVictory,
    false
  );
});

test('sandbox has no automatic victory even when its placeholder goal is fulfilled', () => {
  const status = evaluateGoalStatus({
    ...completedApartmentInput,
    mode: 'SANDBOX',
    goal: { ...apartmentGoal, targetCapital: 0, minJoy: 60, requiredAssets: undefined },
  });
  assert.equal(status.allRequirementsMet, true);
  assert.equal(status.canClaimVictory, false);
});

test('credit-card debt at the fixed threshold ends every mode with the arrest reason', () => {
  const result = evaluateYearEndOutcome({
    ...completedApartmentInput,
    mode: 'SANDBOX',
    yearsCompleted: 3,
    creditCardDebt: UNPAID_CREDIT_CARD_GAME_OVER_LIMIT,
  });

  assert.equal(result.shouldEndGame, true);
  assert.equal(result.isVictorious, false);
  assert.equal(result.failureReason, UNPAID_CREDIT_CARD_GAME_OVER_REASON);
  assert.equal(
    evaluateYearEndOutcome({
      ...completedApartmentInput,
      mode: 'SANDBOX',
      yearsCompleted: 3,
      creditCardDebt: UNPAID_CREDIT_CARD_GAME_OVER_LIMIT - 1,
    }).shouldEndGame,
    false
  );
});

test('10-year outcome resolves on the tenth completed year using final net worth', () => {
  const finalCapital = calculateNetWorth(4_000_000, 7_198_503, 200_000);
  assert.equal(finalCapital, 10_998_503);
  const result = evaluateYearEndOutcome({
    ...completedApartmentInput,
    mode: '10_YEARS',
    yearsCompleted: 10,
    goal: { ...apartmentGoal, requiredAssets: undefined, targetCapital: 10_000_000, minJoy: 80 },
    netWorth: finalCapital,
  });

  assert.equal(result.shouldEndGame, true);
  assert.equal(result.isVictorious, true);
  assert.equal(
    evaluateYearEndOutcome({ ...completedApartmentInput, mode: '10_YEARS', yearsCompleted: 9 })
      .shouldEndGame,
    false
  );
});

test('a final-year event choice is included before capital and joy are evaluated', () => {
  const impact = combineEventChoiceImpact(
    { cashDelta: 0, joyDelta: -5 },
    { cashDelta: 503, joyDelta: 10 }
  );
  const finalCapital = calculateNetWorth(4_000_000 + impact.cashDelta, 7_000_000, 1_000_000);
  const result = evaluateYearEndOutcome({
    ...completedApartmentInput,
    mode: '10_YEARS',
    yearsCompleted: 10,
    goal: { ...apartmentGoal, requiredAssets: undefined, targetCapital: 10_000_000, minJoy: 80 },
    netWorth: finalCapital,
    joy: 80 + impact.joyDelta,
  });

  assert.equal(finalCapital, 10_000_503);
  assert.equal(result.isVictorious, true);
});

test('a credit-card balance disqualifies victory even when net worth clears the target', () => {
  const result = evaluateYearEndOutcome({
    ...completedApartmentInput,
    mode: '10_YEARS',
    yearsCompleted: 10,
    netWorth: 11_000_000,
    creditCardDebt: 200_000,
  });
  assert.equal(result.shouldEndGame, true);
  assert.equal(result.isVictorious, false);
});

test('net worth preserves negative equity instead of clamping it to zero', () => {
  assert.equal(calculateNetWorth(100, 50, 200), -50);
  assert.equal(calculateNetWorth(1_000, 2_000, 500), 2_500);
});

test('cash movement reports the actual change after the zero-balance floor', () => {
  assert.deepEqual(applyCashMovement(50, -100), { balance: 0, actualDelta: -50 });
  assert.deepEqual(applyCashMovement(50, 100), { balance: 150, actualDelta: 100 });
});

test('emergency reserves protect 25% or 50% of uncovered negative event losses', () => {
  assert.deepEqual(protectEventLossWithEmergencyFund(-100_000, 2.99), {
    cashDelta: -100_000,
    protectedAmount: 0,
    coverageRate: 0,
  });
  assert.deepEqual(protectEventLossWithEmergencyFund(-100_000, 3), {
    cashDelta: -75_000,
    protectedAmount: 25_000,
    coverageRate: 0.25,
  });
  assert.deepEqual(protectEventLossWithEmergencyFund(-100_000, 5.99), {
    cashDelta: -75_000,
    protectedAmount: 25_000,
    coverageRate: 0.25,
  });
  assert.deepEqual(protectEventLossWithEmergencyFund(-100_000, 6), {
    cashDelta: -50_000,
    protectedAmount: 50_000,
    coverageRate: 0.5,
  });
  assert.deepEqual(protectEventLossWithEmergencyFund(-100_000, 6, true), {
    cashDelta: -100_000,
    protectedAmount: 0,
    coverageRate: 0,
  });
  assert.deepEqual(protectEventLossWithEmergencyFund(100_000, 6), {
    cashDelta: 100_000,
    protectedAmount: 0,
    coverageRate: 0,
  });
});

test('annual dividends use start-of-year holdings and fall back for old saves', () => {
  const justPurchased = stock({ ownedShares: 10, heldSharesLastYear: 0 });
  const legacySave = stock({ id: 'legacy', ownedShares: 3, heldSharesLastYear: undefined });
  assert.equal(calculateAnnualStockDividends([justPurchased, legacySave]), 300);
});

test('bond defaults are rolled once per held issue per year, remove principal, and stop coupons', () => {
  const risky = bond({ ownedCount: 10, defaultChance: 0.05 });
  const safe = bond({ id: 'safe', ownedCount: 2, defaultChance: 0 });
  const result = processAnnualBondDefaults([risky, safe], () => 0.01);

  assert.equal(result.defaults.length, 1);
  assert.equal(result.defaults[0].principalLost, 10_000);
  assert.equal(result.couponsEarned, 200);
  assert.equal(result.bonds[0].ownedCount, 0);
  assert.equal(result.bonds[0].isDefaulted, true);
  assert.equal(result.bonds[1].ownedCount, 2);
});

test('joy bonuses and burnout penalties affect earned salary consistently', () => {
  assert.equal(salaryJoyMultiplier(29), 0.8);
  assert.equal(salaryJoyMultiplier(30), 1);
  assert.equal(salaryJoyMultiplier(84), 1);
  assert.equal(salaryJoyMultiplier(85), 1.1);
});

test('invested assets include an owner-occupied home and count public companies only through owned shares', () => {
  const value = calculateInvestedAssetsValue({
    stocks: [stock({ ownedShares: 50_000, price: 100 })],
    bonds: [],
    deposits: [],
    crypto: [],
    businessAssets: [],
    realEstate: [],
    businessEmpires: [
      {
        id: 'ipo',
        name: 'Public business',
        sector: 'Test',
        description: '',
        baseCost: 0,
        currentValuation: 10_000_000,
        annualProfit: 0,
        level: 5,
        maxLevel: 5,
        upgradeCost: 0,
        owned: true,
        isIpo: true,
        dividendYield: 0.1,
        levelNames: [],
      },
    ],
    primaryResidenceValue: 7_200_000,
  });

  assert.equal(value, 12_200_000);
});
