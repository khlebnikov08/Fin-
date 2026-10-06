import {
  BankDeposit,
  BondAsset,
  BusinessEmpire,
  BusinessOrRealEstate,
  CryptoAsset,
  EventChoice,
  GameMode,
  LifeGoal,
  RealEstateProperty,
  StockAsset,
} from '../types/game';

export const UNPAID_CREDIT_CARD_GAME_OVER_LIMIT = 5_000_000;
export const UNPAID_CREDIT_CARD_GAME_OVER_REASON =
  'Долг по кредитной карте достиг 5 000 000 ₽. Нагрянула налоговая: счета арестованы, а вас отправили в тюрьму. Игра окончена.';

export interface GoalStatusInput {
  mode: GameMode;
  goal: LifeGoal;
  netWorth: number;
  cash: number;
  joy: number;
  hasApartment: boolean;
  primaryResidenceValue: number;
  hasBusiness: boolean;
  passiveIncome: number;
  creditCardDebt: number;
}

export interface GoalStatus {
  capitalMet: boolean;
  joyMet: boolean;
  apartmentMet: boolean;
  residenceValueMet: boolean;
  cashReserveMet: boolean;
  businessMet: boolean;
  passiveIncomeMet: boolean;
  creditCardClear: boolean;
  allRequirementsMet: boolean;
  canClaimVictory: boolean;
}

/**
 * A single source of truth for goal completion. The sandbox has no win condition;
 * players may record a run whenever they choose instead.
 */
export function evaluateGoalStatus(input: GoalStatusInput): GoalStatus {
  const { goal } = input;
  const requirements = goal.requiredAssets;
  const status = {
    capitalMet: goal.targetCapital <= 0 || input.netWorth >= goal.targetCapital,
    joyMet: input.joy >= goal.minJoy,
    apartmentMet: !requirements?.hasApartment || input.hasApartment,
    residenceValueMet:
      !requirements?.primaryResidenceValueTarget ||
      input.primaryResidenceValue >= requirements.primaryResidenceValueTarget,
    cashReserveMet:
      !requirements?.cashReserveTarget || input.cash >= requirements.cashReserveTarget,
    businessMet: !requirements?.hasBusiness || input.hasBusiness,
    passiveIncomeMet:
      !requirements?.passiveIncomeTarget ||
      input.passiveIncome >= requirements.passiveIncomeTarget,
    creditCardClear: input.creditCardDebt <= 0,
  };

  const allRequirementsMet = Object.values(status).every(Boolean);

  return {
    ...status,
    allRequirementsMet,
    canClaimVictory: input.mode !== 'SANDBOX' && allRequirementsMet,
  };
}

export interface YearEndOutcomeInput extends GoalStatusInput {
  yearsCompleted: number;
}

export interface YearEndOutcome {
  shouldEndGame: boolean;
  isVictorious: boolean;
  failureReason?: string;
  goalStatus: GoalStatus;
}

/** Classic mode resolves after year 10; extreme unpaid card debt ends any mode. */
export function evaluateYearEndOutcome(input: YearEndOutcomeInput): YearEndOutcome {
  const goalStatus = evaluateGoalStatus(input);
  const creditCardDefaulted = input.creditCardDebt >= UNPAID_CREDIT_CARD_GAME_OVER_LIMIT;
  const classicModeComplete = input.mode === '10_YEARS' && input.yearsCompleted >= 10;
  const shouldEndGame = creditCardDefaulted || classicModeComplete;

  return {
    shouldEndGame,
    isVictorious: shouldEndGame && !creditCardDefaulted && goalStatus.canClaimVictory,
    failureReason: creditCardDefaulted ? UNPAID_CREDIT_CARD_GAME_OVER_REASON : undefined,
    goalStatus,
  };
}

/** Net worth is allowed to go below zero so insolvency is visible rather than hidden. */
export function calculateNetWorth(cash: number, investedAssets: number, debt: number): number {
  return cash + investedAssets - debt;
}

/** Clamp an applied cash movement and report the balance change that actually occurred. */
export function applyCashMovement(cash: number, requestedDelta: number): {
  balance: number;
  actualDelta: number;
} {
  const balance = Math.max(0, cash + requestedDelta);
  return { balance, actualDelta: balance - cash };
}

export function combineEventChoiceImpact(
  eventImpact: { cashDelta: number; joyDelta: number },
  choice?: Pick<EventChoice, 'cashDelta' | 'joyDelta'>
): { cashDelta: number; joyDelta: number } {
  return {
    cashDelta: eventImpact.cashDelta + (choice?.cashDelta || 0),
    joyDelta: eventImpact.joyDelta + (choice?.joyDelta || 0),
  };
}

export function emergencyFundCoverageRate(months: number): number {
  if (months >= 6) return 0.5;
  if (months >= 3) return 0.25;
  return 0;
}

export function protectEventLossWithEmergencyFund(
  cashDelta: number,
  reserveMonths: number,
  alreadyInsured = false
): { cashDelta: number; protectedAmount: number; coverageRate: number } {
  if (cashDelta >= 0 || alreadyInsured) {
    return { cashDelta, protectedAmount: 0, coverageRate: 0 };
  }

  const coverageRate = emergencyFundCoverageRate(reserveMonths);
  const protectedAmount = Math.round(Math.abs(cashDelta) * coverageRate);
  return {
    cashDelta: cashDelta + protectedAmount,
    protectedAmount,
    coverageRate,
  };
}

export function salaryJoyMultiplier(joy: number): number {
  if (joy < 30) return 0.8;
  if (joy >= 85) return 1.1;
  return 1;
}

/** Dividends are paid on shares held at the beginning of the year. */
export function calculateAnnualStockDividends(stocks: StockAsset[]): number {
  return stocks.reduce((sum, stock) => {
    const openingShares = stock.heldSharesLastYear ?? stock.ownedShares;
    return sum + Math.round(openingShares * stock.price * stock.dividendYield);
  }, 0);
}

export function calculateAnnualPassiveIncome(assets: {
  stocks: StockAsset[];
  bonds: BondAsset[];
  deposits: BankDeposit[];
  businessAssets: BusinessOrRealEstate[];
  realEstate: RealEstateProperty[];
  businessEmpires: BusinessEmpire[];
}): number {
  const stockDividends = assets.stocks.reduce(
    (sum, stock) => sum + stock.ownedShares * stock.price * stock.dividendYield,
    0
  );
  const bondCoupons = assets.bonds.reduce(
    (sum, bond) => sum + bond.ownedCount * bond.faceValue * bond.couponRate,
    0
  );
  const depositInterest = assets.deposits.reduce(
    (sum, deposit) => sum + deposit.currentAmount * deposit.interestRate,
    0
  );
  const legacyBusinessIncome = assets.businessAssets
    .filter((asset) => asset.owned)
    .reduce((sum, asset) => sum + asset.cost * asset.annualIncomeRate, 0);
  const rentIncome = assets.realEstate.reduce(
    (sum, property) =>
      sum + Math.max(0, (property.annualRentIncome - property.annualMaintenance) * property.ownedCount),
    0
  );
  const privateBusinessIncome = assets.businessEmpires
    .filter((business) => business.owned && !business.isIpo)
    .reduce((sum, business) => sum + business.annualProfit, 0);

  return Math.round(
    stockDividends + bondCoupons + depositInterest + legacyBusinessIncome + rentIncome + privateBusinessIncome
  );
}

export interface BondDefaultResult {
  bonds: BondAsset[];
  couponsEarned: number;
  defaults: { bondName: string; principalLost: number }[];
}

/**
 * Each bond issue gets one independent default roll per year, not one roll per
 * individual unit. A defaulted issue stops paying coupons and cannot be rebought.
 */
export function processAnnualBondDefaults(
  bonds: BondAsset[],
  random: () => number = Math.random
): BondDefaultResult {
  let couponsEarned = 0;
  const defaults: BondDefaultResult['defaults'] = [];
  const updatedBonds = bonds.map((bond) => {
    if (bond.ownedCount <= 0 || bond.isDefaulted) return bond;

    const defaultChance = Math.max(0, Math.min(1, bond.defaultChance || 0));
    if (defaultChance > 0 && random() < defaultChance) {
      defaults.push({
        bondName: bond.name,
        principalLost: bond.ownedCount * bond.faceValue,
      });
      return { ...bond, ownedCount: 0, isDefaulted: true };
    }

    couponsEarned += Math.round(bond.ownedCount * bond.faceValue * bond.couponRate);
    return bond;
  });

  return { bonds: updatedBonds, couponsEarned, defaults };
}

export function calculateInvestedAssetsValue(assets: {
  stocks: StockAsset[];
  bonds: BondAsset[];
  deposits: BankDeposit[];
  crypto: CryptoAsset[];
  businessAssets: BusinessOrRealEstate[];
  realEstate: RealEstateProperty[];
  businessEmpires: BusinessEmpire[];
  primaryResidenceValue: number;
}): number {
  const stocksValue = assets.stocks.reduce((sum, stock) => sum + stock.ownedShares * stock.price, 0);
  const bondsValue = assets.bonds.reduce((sum, bond) => sum + bond.ownedCount * bond.faceValue, 0);
  const depositsValue = assets.deposits.reduce((sum, deposit) => sum + deposit.currentAmount, 0);
  const cryptoValue = assets.crypto.reduce(
    (sum, coin) => sum + Math.round(coin.ownedAmount * coin.price),
    0
  );
  const legacyAssetsValue = assets.businessAssets
    .filter((asset) => asset.owned)
    .reduce((sum, asset) => sum + asset.cost, 0);
  const realEstateValue = assets.realEstate.reduce(
    (sum, property) => sum + property.ownedCount * property.currentPrice,
    0
  );
  // Once a business goes public, the player's retained shares are already valued
  // in the stock portfolio. Counting the full company valuation again double-counts it.
  const privateBusinessValue = assets.businessEmpires
    .filter((business) => business.owned && !business.isIpo)
    .reduce((sum, business) => sum + business.currentValuation, 0);

  return (
    stocksValue +
    bondsValue +
    depositsValue +
    cryptoValue +
    legacyAssetsValue +
    realEstateValue +
    privateBusinessValue +
    assets.primaryResidenceValue
  );
}
