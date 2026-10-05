// Types for Financial Life Simulator

export type GameMode = '10_YEARS' | 'GOAL' | 'SANDBOX';

export interface LifeGoal {
  id: string;
  title: string;
  description: string;
  targetCapital: number;
  minJoy: number;
  custom?: boolean;
  requiredAssets?: {
    hasApartment?: boolean;
    hasBusiness?: boolean;
    passiveIncomeTarget?: number;
  };
}

export interface CharacterPreset {
  id: string;
  name: string;
  role: string;
  description: string;
  initialSalary: number; // annual
  initialCash: number;
  initialJoy: number;
  avatarIcon: string;
}

export interface StockAsset {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  description: string;
  price: number;
  prevPrice: number;
  dividendYield: number; // e.g. 0.08 for 8%
  risk: 'low' | 'medium' | 'high';
  isBankrupt?: boolean;
  ownedShares: number;
  heldSharesLastYear?: number; // Shares held at start of year for past-year performance tracking
  history: number[];
  isPlayerCompany?: boolean;
  companyEmpireId?: string;
}

export interface BondAsset {
  id: string;
  name: string;
  type: 'OFZ' | 'CORP' | 'HIGH_YIELD';
  couponRate: number; // annual percentage e.g. 0.12
  faceValue: number; // 1000 ₽ per bond
  riskText: string;
  defaultChance: number; // chance to default
  ownedCount: number;
}

export interface BankDeposit {
  id: string;
  bankName: string;
  bankType: 'STATE_TOP' | 'REGIONAL' | 'NEOBANK';
  interestRate: number;
  termYears: number;
  startYear: number;
  principal: number;
  currentAmount: number;
  isInsuredAsv: boolean; // up to 1.4m
}

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  prevPrice: number;
  volatility: number;
  ownedAmount: number;
  history: number[];
}

export interface BusinessOrRealEstate {
  id: string;
  title: string;
  type: 'REAL_ESTATE' | 'BUSINESS' | 'GOLD';
  cost: number;
  annualIncomeRate: number; // percentage of cost
  owned: boolean;
  description: string;
  maintenanceCost: number; // per year
}

export interface RealEstateProperty {
  id: string;
  name: string;
  category: 'STUDIO' | 'APARTMENT' | 'BUSINESS_CLASS' | 'PREMIUM' | 'COMMERCIAL' | 'WAREHOUSE';
  categoryLabel: string;
  areaSqM: number; // e.g. 26, 45, 75, 140, 220, 1500
  district: string;
  basePrice: number;
  currentPrice: number;
  prevPrice: number;
  annualRentIncome: number;
  annualMaintenance: number;
  ownedCount: number;
  isRenovated: boolean;
  renovationCost: number;
  description: string;
}

export interface BusinessEmpire {
  id: string;
  name: string;
  sector: string;
  description: string;
  baseCost: number;
  currentValuation: number;
  annualProfit: number;
  level: number; // 0 = not owned, 1 = Startup, 2 = Scale, 3 = Franchise, 4 = Federal Holding, 5 = IPO Listed!
  maxLevel: number;
  upgradeCost: number;
  owned: boolean;
  isIpo: boolean;
  ipoCapitalRaised?: number;
  dividendYield: number; // e.g. 0.20
  levelNames: string[];
  stockTicker?: string;
  stockAssetId?: string;
  lastProfitMultiplier?: number;
}

export interface Loan {
  id: string;
  bankName: string;
  totalAmount: number;
  remainingDebt: number;
  annualInterestRate: number;
  annualPayment: number;
  durationYears: number;
  yearsRemaining: number;
}

export interface CreditCard {
  limit: number;
  usedAmount: number;
  gracePeriodYearsRemaining: number; // 1 = inside grace period, 0 = overdue, interest applied
  interestRate: number; // e.g. 0.28
  penaltyRate: number; // e.g. 0.10
  isOverdue: boolean;
}

export interface DebitCard {
  active: boolean;
  name: string;
  cashbackRate: number; // e.g. 0.03 for 3%
  annualFee: number;
  benefitDescription: string;
}

export interface InsurancePolicy {
  type: 'HEALTH_DMS' | 'HOME' | 'CAR_CASCO';
  name: string;
  annualCost: number;
  active: boolean;
  description: string;
}

export interface EducationTier {
  id: string;
  name: string;
  cost: number;
  salaryBonusMultiplier: number; // e.g. 0.20 (+20%)
  joyBonus: number;
  description: string;
  durationYears: number; // 1 or 2 years in 10_YEARS mode
  progressYears: number; // 0..durationYears
  inProgress: boolean;
  completed: boolean;
}

export interface OptionalExpense {
  id: string;
  title: string;
  cost: number;
  joyDeltaIfAccepted: number;
  joyDeltaIfDeclined: number;
  permanentAnnualCostDelta?: number; // e.g. car maintenance
  description: string;
  category: 'LEISURE' | 'PURCHASE' | 'LUXURY' | 'FAMILY';
  isOneTimeAssetPurchase?: 'CAR' | 'APARTMENT';
}

export interface EventChoice {
  id: string;
  label: string;
  cashDelta: number;
  joyDelta: number;
  description?: string;
}

export interface GameRandomEvent {
  id: string;
  title: string;
  description: string;
  cashDelta: number;
  joyDelta: number;
  coveredByInsurance?: 'HEALTH_DMS' | 'HOME' | 'CAR_CASCO';
  insuranceAvoidedLoss?: number;
  requiresCar?: boolean;
  requiresApartment?: boolean;
  iconType: 'good' | 'bad' | 'neutral';
  choices?: EventChoice[];
}

export interface NewsArticle {
  id: string;
  category: 'MACRO' | 'STOCKS' | 'BONDS' | 'BANKING' | 'BUSINESS' | 'REAL_ESTATE';
  categoryLabel: string;
  title: string;
  content: string;
}

export interface CentralBankDecision {
  action: 'RAISE' | 'CUT' | 'HOLD';
  rateChange: number; // e.g. +0.015, -0.010, 0
  newKeyRate: number;
  statement: string;
  guidance: 'HAWKISH' | 'DOVISH' | 'NEUTRAL';
  inflationTarget: number; // 0.04 (4%)
  reasoning: string;
}

export interface MacroNews {
  id: string;
  headline: string;
  summary: string;
  articles?: NewsArticle[];
  inflationDelta: number;
  keyRateDelta: number;
  durationYears?: number; // 1, 2, or 3 years
  yearsRemaining?: number;
  cycleType?: 'CRISIS' | 'BOOM' | 'STAGFLATION' | 'TECH_RALLY' | 'STANDARD';
  centralBank?: CentralBankDecision;
  marketImpact: {
    stockMarketMultiplier: number;
    cryptoMultiplier: number;
    favoredSector?: string;
    hitSector?: string;
    salaryMultiplier?: number;
    businessMultiplier?: number;
  };
}

export interface TurnReport {
  year: number;
  salaryIncome: number;
  businessIncome: number;
  rentIncomeEarned?: number;
  dividendsEarned: number;
  couponsEarned: number;
  depositInterestEarned: number;
  depositMaturedReturned?: number;
  cashbackEarned: number;
  taxDeductionsEarned: number;
  mandatoryExpensesPaid: number;
  nextYearMandatoryExpenses?: number;
  mandatoryExpensesDelta?: number;
  mandatoryExpensesReason?: string;
  optionalExpensesPaid: number;
  insurancePaid: number;
  cardFeesPaid: number;
  loanPaymentsPaid: number;
  creditCardInterestPaid: number;
  incomeTaxPaid?: number;
  businessTaxPaid?: number;
  propertyTaxPaid?: number;
  transportTaxPaid?: number;
  eventsSummary: string[];
  netCashDelta: number;
  netWorthDelta: number;
  joyDelta: number;
}

export interface YearHistoryPoint {
  year: number;
  netWorth: number;
  cash: number;
  invested: number;
  joy: number;
  passiveIncome: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  mode: GameMode;
  goalTitle: string;
  finalCapital: number;
  finalJoy: number;
  yearsTaken: number;
  isVictorious: boolean;
  timestamp: number;
}
