import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  GameMode,
  LifeGoal,
  CharacterPreset,
  StockAsset,
  BondAsset,
  BankDeposit,
  CryptoAsset,
  BusinessOrRealEstate,
  Loan,
  CreditCard,
  DebitCard,
  InsurancePolicy,
  EducationTier,
  OptionalExpense,
  GameRandomEvent,
  EventChoice,
  MacroNews,
  TurnReport,
  YearHistoryPoint,
  LeaderboardEntry,
  RealEstateProperty,
  BusinessEmpire,
} from './types/game';
import {
  INITIAL_CHARACTERS,
  INITIAL_LIFE_GOALS,
  INITIAL_STOCKS,
  INITIAL_BONDS,
  INITIAL_CRYPTO,
  INITIAL_BUSINESS_AND_REAL_ESTATE,
  INITIAL_REAL_ESTATE,
  INITIAL_BUSINESS_EMPIRES,
  INITIAL_INSURANCES,
  INITIAL_EDUCATION_TIERS,
  OPTIONAL_EXPENSES_POOL,
  RANDOM_EVENTS_POOL,
  MACRO_NEWS_POOL,
} from './data/initialData';
import { EXPANDED_EVENTS_POOL, pickRichMacroNews } from './data/richEventsPool';
import { Header, ActiveTab } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { OverviewTab } from './components/Tabs/OverviewTab';
import { InvestmentsTab } from './components/Tabs/InvestmentsTab';
import { BankingTab } from './components/Tabs/BankingTab';
import { CareerTab } from './components/Tabs/CareerTab';
import { NewsTab } from './components/Tabs/NewsTab';
import { AnalyticsTab } from './components/Tabs/AnalyticsTab';
import { TurnSummaryModal } from './components/TurnSummaryModal';
import { EventModal } from './components/Modals/EventModal';
import { RulesGuideModal } from './components/Modals/RulesGuideModal';
import { LeaderboardModal } from './components/Modals/LeaderboardModal';
import { GameOverModal } from './components/Modals/GameOverModal';
import { GameSetupModal } from './components/Modals/GameSetupModal';
import { DownloadModal } from './components/Modals/DownloadModal';
import { OnboardingTourModal } from './components/Modals/OnboardingTourModal';
import { calculateMandatoryExpensesBreakdown } from './utils/expenses';
import { requestAiMacroNews, requestAiGameplayEvent } from './services/aiNewsService';
import { sound } from './utils/audio';

const STORAGE_KEY = 'finlife_save_v1';
const LEADERBOARD_KEY = 'finlife_leaderboard_v1';

export default function App() {
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [isTurnSummaryOpen, setIsTurnSummaryOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Player & Game Configuration
  const [playerName, setPlayerName] = useState('Инвестор');
  const [gameMode, setGameMode] = useState<GameMode>('GOAL');
  const [goal, setGoal] = useState<LifeGoal>(INITIAL_LIFE_GOALS[1]);
  const [character, setCharacter] = useState<CharacterPreset>(INITIAL_CHARACTERS[0]);

  // Core Game State
  const [year, setYear] = useState(1);
  const [cash, setCash] = useState(1600000);
  const [joy, setJoy] = useState(75);
  const [annualSalary, setAnnualSalary] = useState(1200000);

  // Mandatory Expenses
  const [mandatoryExpensesCost, setMandatoryExpensesCost] = useState(420000);
  const [isMandatoryExpensesPaid, setIsMandatoryExpensesPaid] = useState(false);
  const [hasCar, setHasCar] = useState(false);
  const [hasApartment, setHasApartment] = useState(false);

  // Background Prefetch & Anti-Repetition
  const [recentEventIds, setRecentEventIds] = useState<string[]>([]);
  const [prefetchedEvent, setPrefetchedEvent] = useState<GameRandomEvent | null>(null);
  const [prefetchedNews, setPrefetchedNews] = useState<MacroNews | null>(null);

  // Economy & Rates
  const [inflationRate, setInflationRate] = useState(0.08); // 8%
  const [keyRate, setKeyRate] = useState(0.12); // 12%
  const [currentNews, setCurrentNews] = useState<MacroNews>(MACRO_NEWS_POOL[0]);
  const [activeCrisis, setActiveCrisis] = useState<MacroNews | null>(null);
  const [newsHistory, setNewsHistory] = useState<
    { year: number; news: MacroNews; inflation: number; keyRate: number }[]
  >([]);

  // Assets
  const [stocks, setStocks] = useState<StockAsset[]>(INITIAL_STOCKS);
  const [bonds, setBonds] = useState<BondAsset[]>(INITIAL_BONDS);
  const [deposits, setDeposits] = useState<BankDeposit[]>([]);
  const [crypto, setCrypto] = useState<CryptoAsset[]>(INITIAL_CRYPTO);
  const [businessAssets, setBusinessAssets] = useState<BusinessOrRealEstate[]>(INITIAL_BUSINESS_AND_REAL_ESTATE);
  const [realEstate, setRealEstate] = useState<RealEstateProperty[]>(INITIAL_REAL_ESTATE);
  const [businessEmpires, setBusinessEmpires] = useState<BusinessEmpire[]>(INITIAL_BUSINESS_EMPIRES);
  const [insurances, setInsurances] = useState<InsurancePolicy[]>(INITIAL_INSURANCES);
  const [educationTiers, setEducationTiers] = useState<EducationTier[]>(INITIAL_EDUCATION_TIERS);

  // Banking & Debt
  const [loans, setLoans] = useState<Loan[]>([]);
  const [creditCard, setCreditCard] = useState<CreditCard>({
    limit: 600000,
    usedAmount: 0,
    gracePeriodYearsRemaining: 1,
    interestRate: 0.28,
    penaltyRate: 0.1,
    isOverdue: false,
  });
  const [debitCard, setDebitCard] = useState<DebitCard>({
    active: false,
    name: 'Кэшбэк Карта 3%',
    cashbackRate: 0.03,
    annualFee: 1500,
    benefitDescription: '3% возврат со всех покупок',
  });

  // Turn Expenses Selection
  const [optionalExpenses, setOptionalExpenses] = useState<OptionalExpense[]>([
    OPTIONAL_EXPENSES_POOL[0],
    OPTIONAL_EXPENSES_POOL[1],
    OPTIONAL_EXPENSES_POOL[2],
  ]);
  const [acceptedOptionalIds, setAcceptedOptionalIds] = useState<string[]>([]);
  const [declinedOptionalIds, setDeclinedOptionalIds] = useState<string[]>([]);

  // State Tracking for Reports & Leaderboard
  const [lastTurnReport, setLastTurnReport] = useState<TurnReport | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameRandomEvent | null>(null);
  const [eventInsuranceSaved, setEventInsuranceSaved] = useState(false);
  const [pendingTaxRefund, setPendingTaxRefund] = useState(0);

  // Lifetime Stats
  const [totalDividendsEarned, setTotalDividendsEarned] = useState(0);
  const [totalCouponsEarned, setTotalCouponsEarned] = useState(0);
  const [totalSalaryEarned, setTotalSalaryEarned] = useState(1200000);
  const [history, setHistory] = useState<YearHistoryPoint[]>([
    {
      year: 1,
      netWorth: 350000,
      cash: 350000,
      invested: 0,
      joy: 75,
      passiveIncome: 0,
    },
  ]);

  // Game End State
  const [isVictorious, setIsVictorious] = useState(false);
  const [failReason, setFailReason] = useState<string | undefined>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Computed Values
  const stocksValue = useMemo(
    () => stocks.reduce((acc, s) => acc + s.ownedShares * s.price, 0),
    [stocks]
  );
  const bondsValue = useMemo(
    () => bonds.reduce((acc, b) => acc + b.ownedCount * b.faceValue, 0),
    [bonds]
  );
  const depositsValue = useMemo(
    () => deposits.reduce((acc, d) => acc + d.currentAmount, 0),
    [deposits]
  );
  const cryptoValue = useMemo(
    () => crypto.reduce((acc, c) => acc + Math.round(c.ownedAmount * c.price), 0),
    [crypto]
  );
  const businessValue = useMemo(
    () => businessAssets.filter((a) => a.owned).reduce((acc, a) => acc + a.cost, 0),
    [businessAssets]
  );
  const realEstateValue = useMemo(
    () => realEstate.reduce((acc, r) => acc + r.ownedCount * r.currentPrice, 0),
    [realEstate]
  );
  const businessEmpiresValue = useMemo(
    () => businessEmpires.filter((b) => b.owned).reduce((acc, b) => acc + b.currentValuation, 0),
    [businessEmpires]
  );

  const totalInvested = useMemo(
    () =>
      stocksValue +
      bondsValue +
      depositsValue +
      cryptoValue +
      businessValue +
      realEstateValue +
      businessEmpiresValue,
    [
      stocksValue,
      bondsValue,
      depositsValue,
      cryptoValue,
      businessValue,
      realEstateValue,
      businessEmpiresValue,
    ]
  );

  const debtTotal = useMemo(
    () => loans.reduce((acc, l) => acc + l.remainingDebt, 0) + creditCard.usedAmount,
    [loans, creditCard]
  );

  const netWorth = useMemo(
    () => Math.max(0, cash + totalInvested - debtTotal),
    [cash, totalInvested, debtTotal]
  );

  const hasBusiness = useMemo(
    () =>
      businessAssets.some((a) => a.type === 'BUSINESS' && a.owned) ||
      businessEmpires.some((b) => b.owned),
    [businessAssets, businessEmpires]
  );

  const passiveIncomeAnnual = useMemo(() => {
    const stockDivs = stocks.reduce(
      (acc, s) => acc + s.ownedShares * s.price * s.dividendYield,
      0
    );
    const bondCoupons = bonds.reduce(
      (acc, b) => acc + b.ownedCount * b.faceValue * b.couponRate,
      0
    );
    const legacyBusinessIncome = businessAssets
      .filter((a) => a.owned)
      .reduce((acc, a) => acc + a.cost * a.annualIncomeRate, 0);

    const rentIncome = realEstate.reduce((acc, r) => {
      const rent = r.isRenovated ? Math.round(r.annualRentIncome * 1.3) : r.annualRentIncome;
      return acc + Math.max(0, (rent - r.annualMaintenance) * r.ownedCount);
    }, 0);

    const empireIncome = businessEmpires
      .filter((b) => b.owned)
      .reduce((acc, b) => {
        const divFlow = b.isIpo ? Math.round(b.currentValuation * (b.dividendYield || 0.25)) : 0;
        return acc + b.annualProfit + divFlow;
      }, 0);

    return Math.round(stockDivs + bondCoupons + legacyBusinessIncome + rentIncome + empireIncome);
  }, [stocks, bonds, businessAssets, realEstate, businessEmpires]);

  const emergencyFundMonths = useMemo(() => {
    const monthlyExpenses = mandatoryExpensesCost / 12;
    return monthlyExpenses > 0 ? cash / monthlyExpenses : 0;
  }, [cash, mandatoryExpensesCost]);

  // Dynamic calculation of mandatory expenses breakdown with taxes & lifestyle inflation
  const mandatoryBreakdown = useMemo(() => {
    const currentLegacyBusinessIncome = businessAssets
      .filter((a) => a.owned)
      .reduce((acc, a) => acc + a.cost * a.annualIncomeRate, 0);

    const currentEmpireIncome = businessEmpires
      .filter((b) => b.owned)
      .reduce((acc, b) => acc + b.annualProfit, 0);

    const currentRentIncome = realEstate.reduce((acc, r) => {
      const rent = r.isRenovated ? Math.round(r.annualRentIncome * 1.3) : r.annualRentIncome;
      return acc + Math.max(0, (rent - r.annualMaintenance) * r.ownedCount);
    }, 0);

    const totalRealEstateValuation = realEstate.reduce(
      (acc, r) => acc + r.ownedCount * r.currentPrice,
      0
    );

    return calculateMandatoryExpensesBreakdown({
      annualSalary,
      businessIncome: currentLegacyBusinessIncome + currentEmpireIncome,
      rentIncome: currentRentIncome,
      baseLivingFloor: 160000,
      hasApartment,
      hasCar,
      debitCardActive: debitCard.active,
      inflationMultiplier: Math.pow(1 + inflationRate, Math.min(12, year - 1)),
      investmentPropertiesCount: realEstate.reduce((acc, r) => acc + r.ownedCount, 0),
      propertyTotalValuation: totalRealEstateValuation,
    });
  }, [
    annualSalary,
    businessAssets,
    businessEmpires,
    realEstate,
    hasApartment,
    hasCar,
    debitCard.active,
    inflationRate,
    year,
  ]);

  useEffect(() => {
    setMandatoryExpensesCost(mandatoryBreakdown.total);
  }, [mandatoryBreakdown.total]);

  // Load Saved Game & Leaderboard
  useEffect(() => {
    try {
      const savedLb = localStorage.getItem(LEADERBOARD_KEY);
      if (savedLb) {
        setLeaderboard(JSON.parse(savedLb));
      }

      const savedGame = localStorage.getItem(STORAGE_KEY);
      if (savedGame) {
        const data = JSON.parse(savedGame);
        setPlayerName(data.playerName || 'Инвестор');
        setGameMode(data.gameMode || 'GOAL');
        setGoal(data.goal || INITIAL_LIFE_GOALS[1]);
        setCharacter(data.character || INITIAL_CHARACTERS[0]);
        setYear(data.year || 1);
        let loadedCash = data.cash ?? 1600000;
        const loadedMandatory = data.mandatoryExpensesCost || 420000;
        if (data.year === 1 && !data.isMandatoryExpensesPaid && loadedCash < loadedMandatory) {
          loadedCash += data.annualSalary || 1200000;
        }
        setCash(loadedCash);
        setJoy(data.joy ?? 75);
        setAnnualSalary(data.annualSalary || 1200000);
        setMandatoryExpensesCost(loadedMandatory);
        setIsMandatoryExpensesPaid(data.isMandatoryExpensesPaid || false);
        setHasCar(Boolean(data.hasCar));
        setHasApartment(Boolean(data.hasApartment));
        setRecentEventIds(data.recentEventIds || []);
        setInflationRate(data.inflationRate || 0.08);
        setKeyRate(data.keyRate || 0.12);
        setCurrentNews(data.currentNews || MACRO_NEWS_POOL[0]);
        setNewsHistory(data.newsHistory || []);

        const savedStocks = data.stocks || [];
        const mergedStocks = INITIAL_STOCKS.map((initS) => {
          const found = savedStocks.find((s: StockAsset) => s.id === initS.id);
          return found || initS;
        });
        setStocks(mergedStocks);
        setBonds(data.bonds || INITIAL_BONDS);
        setDeposits(data.deposits || []);
        setCrypto(data.crypto || INITIAL_CRYPTO);
        setBusinessAssets(data.businessAssets || INITIAL_BUSINESS_AND_REAL_ESTATE);
        setRealEstate(data.realEstate || INITIAL_REAL_ESTATE);
        setBusinessEmpires(data.businessEmpires || INITIAL_BUSINESS_EMPIRES);
        setInsurances(data.insurances || INITIAL_INSURANCES);
        setEducationTiers(data.educationTiers || INITIAL_EDUCATION_TIERS);
        setLoans(data.loans || []);
        setCreditCard(
          data.creditCard || {
            limit: 600000,
            usedAmount: 0,
            gracePeriodYearsRemaining: 1,
            interestRate: 0.28,
            penaltyRate: 0.1,
            isOverdue: false,
          }
        );
        setDebitCard(
          data.debitCard || {
            active: false,
            name: 'Кэшбэк Карта 3%',
            cashbackRate: 0.03,
            annualFee: 1500,
            benefitDescription: '',
          }
        );
        setOptionalExpenses(data.optionalExpenses || [OPTIONAL_EXPENSES_POOL[0], OPTIONAL_EXPENSES_POOL[1]]);
        setAcceptedOptionalIds(data.acceptedOptionalIds || []);
        setDeclinedOptionalIds(data.declinedOptionalIds || []);
        setTotalDividendsEarned(data.totalDividendsEarned || 0);
        setTotalCouponsEarned(data.totalCouponsEarned || 0);
        setTotalSalaryEarned(data.totalSalaryEarned || 1200000);
        setHistory(data.history || [{ year: 1, netWorth: 350000, cash: 350000, invested: 0, joy: 75, passiveIncome: 0 }]);
      } else {
        setIsSetupOpen(true);
      }

      const tourDone = localStorage.getItem('finlife_tour_completed');
      if (!tourDone) {
        setIsTourOpen(true);
      }
    } catch {
      setIsSetupOpen(true);
    }
  }, []);

  // Save Game on State Change
  const saveCurrentGame = useCallback(() => {
    try {
      const data = {
        playerName,
        gameMode,
        goal,
        character,
        year,
        cash,
        joy,
        annualSalary,
        mandatoryExpensesCost,
        isMandatoryExpensesPaid,
        hasCar,
        hasApartment,
        recentEventIds,
        inflationRate,
        keyRate,
        currentNews,
        newsHistory,
        stocks,
        bonds,
        deposits,
        crypto,
        businessAssets,
        realEstate,
        businessEmpires,
        insurances,
        educationTiers,
        loans,
        creditCard,
        debitCard,
        optionalExpenses,
        acceptedOptionalIds,
        declinedOptionalIds,
        totalDividendsEarned,
        totalCouponsEarned,
        totalSalaryEarned,
        history,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [
    playerName,
    gameMode,
    goal,
    character,
    year,
    cash,
    joy,
    annualSalary,
    mandatoryExpensesCost,
    isMandatoryExpensesPaid,
    hasCar,
    hasApartment,
    recentEventIds,
    inflationRate,
    keyRate,
    currentNews,
    newsHistory,
    stocks,
    bonds,
    deposits,
    crypto,
    businessAssets,
    realEstate,
    businessEmpires,
    insurances,
    educationTiers,
    loans,
    creditCard,
    debitCard,
    optionalExpenses,
    acceptedOptionalIds,
    declinedOptionalIds,
    totalDividendsEarned,
    totalCouponsEarned,
    totalSalaryEarned,
    history,
  ]);

  useEffect(() => {
    saveCurrentGame();
  }, [saveCurrentGame]);

  // Background Prefetch for Next Turn
  useEffect(() => {
    let cancelled = false;
    const prefetch = async () => {
      try {
        const nextYear = year + 1;
        const [eventRes, newsRes] = await Promise.allSettled([
          requestAiGameplayEvent({
            characterName: character.name,
            role: character.role,
            year: nextYear,
            cash,
            netWorth,
            annualSalary,
            joy,
            hasCar,
            hasApartment,
            hasBusiness,
            activeCrisisTitle: activeCrisis?.headline,
            recentEventIds,
          }),
          requestAiMacroNews({
            year: nextYear,
            inflationRate,
            keyRate,
            requestedType: 'RANDOM',
          }),
        ]);

        if (!cancelled) {
          if (eventRes.status === 'fulfilled' && eventRes.value) {
            setPrefetchedEvent(eventRes.value);
          }
          if (newsRes.status === 'fulfilled' && newsRes.value) {
            setPrefetchedNews(newsRes.value);
          }
        }
      } catch {
        // Handled synchronously
      }
    };

    prefetch();
    return () => {
      cancelled = true;
    };
  }, [year, hasCar, hasApartment, hasBusiness, character.name, character.role, activeCrisis?.headline]);

  // Start New Game Handler
  const handleStartGame = (params: {
    playerName: string;
    character: CharacterPreset;
    mode: GameMode;
    goal: LifeGoal;
  }) => {
    setPlayerName(params.playerName);
    setCharacter(params.character);
    setGameMode(params.mode);
    setGoal(params.goal);
    setYear(1);

    const initialSalary = params.character.initialSalary;
    setAnnualSalary(initialSalary);
    setCash(params.character.initialCash);
    setJoy(params.character.initialJoy);

    const initialBreakdown = calculateMandatoryExpensesBreakdown({
      annualSalary: initialSalary,
      businessIncome: 0,
      baseLivingFloor: 160000,
      hasApartment: false,
      hasCar: false,
      debitCardActive: false,
      inflationMultiplier: 1.0,
    });
    setMandatoryExpensesCost(initialBreakdown.total);
    setIsMandatoryExpensesPaid(false);
    setHasCar(false);
    setHasApartment(false);
    setRecentEventIds([]);
    setPrefetchedEvent(null);
    setPrefetchedNews(null);

    setStocks(INITIAL_STOCKS.map((s) => ({ ...s, ownedShares: 0, heldSharesLastYear: 0 })));
    setBonds(INITIAL_BONDS.map((b) => ({ ...b, ownedCount: 0 })));
    setDeposits([]);
    setCrypto(INITIAL_CRYPTO.map((c) => ({ ...c, ownedAmount: 0 })));
    setBusinessAssets(INITIAL_BUSINESS_AND_REAL_ESTATE.map((b) => ({ ...b, owned: false })));
    setRealEstate(INITIAL_REAL_ESTATE.map((r) => ({ ...r, ownedCount: 0, isRenovated: false })));
    setBusinessEmpires(INITIAL_BUSINESS_EMPIRES.map((b) => ({ ...b, owned: false, level: 0, isIpo: false })));
    setInsurances(INITIAL_INSURANCES.map((i) => ({ ...i, active: false })));
    setEducationTiers(INITIAL_EDUCATION_TIERS.map((e) => ({ ...e, completed: false, inProgress: false, progressYears: 0 })));
    setLoans([]);
    setCreditCard({
      limit: Math.round(initialSalary * 0.5),
      usedAmount: 0,
      gracePeriodYearsRemaining: 1,
      interestRate: 0.28,
      penaltyRate: 0.1,
      isOverdue: false,
    });
    setDebitCard({
      active: false,
      name: 'Кэшбэк Карта 3%',
      cashbackRate: 0.03,
      annualFee: 1500,
      benefitDescription: '3% возврат со всех покупок',
    });

    setOptionalExpenses([
      OPTIONAL_EXPENSES_POOL[0],
      OPTIONAL_EXPENSES_POOL[1],
      OPTIONAL_EXPENSES_POOL[2],
    ]);
    setAcceptedOptionalIds([]);
    setDeclinedOptionalIds([]);

    setInflationRate(0.08);
    setKeyRate(0.12);
    setCurrentNews(MACRO_NEWS_POOL[0]);
    setNewsHistory([]);
    setTotalDividendsEarned(0);
    setTotalCouponsEarned(0);
    setTotalSalaryEarned(initialSalary);

    setHistory([
      {
        year: 1,
        netWorth: params.character.initialCash,
        cash: params.character.initialCash,
        invested: 0,
        joy: params.character.initialJoy,
        passiveIncome: 0,
      },
    ]);

    setIsSetupOpen(false);
    setIsGameOverOpen(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Pay Mandatory Expenses
  const handlePayMandatoryExpenses = (useCreditCard: boolean = false) => {
    if (useCreditCard) {
      const availableCredit = creditCard.limit - creditCard.usedAmount;
      if (availableCredit >= mandatoryExpensesCost) {
        setCreditCard((prev) => ({
          ...prev,
          usedAmount: prev.usedAmount + mandatoryExpensesCost,
        }));
        setIsMandatoryExpensesPaid(true);
        sound.playCoin();
      }
    } else {
      if (cash >= mandatoryExpensesCost) {
        setCash((prev) => prev - mandatoryExpensesCost);
        setIsMandatoryExpensesPaid(true);
        sound.playCoin();
      }
    }
  };

  // Accept Optional Expense (New phone, vacation, charity)
  const handleAcceptOptional = (expense: OptionalExpense) => {
    if (cash < expense.cost) return;
    setCash((prev) => prev - expense.cost);
    setJoy((prev) => Math.min(100, Math.max(0, prev + expense.joyDeltaIfAccepted)));

    if (expense.isOneTimeAssetPurchase === 'CAR' || expense.id === 'opt_car_purchase') {
      setHasCar(true);
    }
    if (expense.isOneTimeAssetPurchase === 'APARTMENT' || expense.id === 'opt_own_apartment') {
      setHasApartment(true);
    }

    if (expense.permanentAnnualCostDelta) {
      setMandatoryExpensesCost((prev) => Math.max(100000, prev + expense.permanentAnnualCostDelta!));
    }

    setAcceptedOptionalIds((prev) => [...prev, expense.id]);
    sound.playJoy();
  };

  // Decline Optional Expense
  const handleDeclineOptional = (expense: OptionalExpense) => {
    setJoy((prev) => Math.min(100, Math.max(0, prev + expense.joyDeltaIfDeclined)));
    setDeclinedOptionalIds((prev) => [...prev, expense.id]);
    sound.playWarning();
  };

  // Toggle Insurance Policy
  const handleToggleInsurance = (type: 'HEALTH_DMS' | 'HOME' | 'CAR_CASCO') => {
    setInsurances((prev) =>
      prev.map((i) => {
        if (i.type === type) {
          const nextActive = !i.active;
          if (nextActive && cash >= i.annualCost) {
            setCash((c) => c - i.annualCost);
            return { ...i, active: true };
          } else if (!nextActive) {
            return { ...i, active: false };
          }
        }
        return i;
      })
    );
  };

  // Buy / Sell Stocks
  const handleBuyStock = (stockId: string, count: number) => {
    const stock = stocks.find((s) => s.id === stockId);
    if (!stock) return;
    const cost = stock.price * count;
    if (cash < cost) return;

    setCash((prev) => prev - cost);
    setStocks((prev) =>
      prev.map((s) => (s.id === stockId ? { ...s, ownedShares: s.ownedShares + count } : s))
    );
  };

  const handleSellStock = (stockId: string, count: number) => {
    const stock = stocks.find((s) => s.id === stockId);
    if (!stock || stock.ownedShares < count) return;
    const revenue = stock.price * count;

    setCash((prev) => prev + revenue);
    setStocks((prev) =>
      prev.map((s) => (s.id === stockId ? { ...s, ownedShares: s.ownedShares - count } : s))
    );
  };

  // Buy / Sell Bonds
  const handleBuyBond = (bondId: string, count: number) => {
    const bond = bonds.find((b) => b.id === bondId);
    if (!bond) return;
    const cost = bond.faceValue * count;
    if (cash < cost) return;

    setCash((prev) => prev - cost);
    setBonds((prev) =>
      prev.map((b) => (b.id === bondId ? { ...b, ownedCount: b.ownedCount + count } : b))
    );
  };

  const handleSellBond = (bondId: string, count: number) => {
    const bond = bonds.find((b) => b.id === bondId);
    if (!bond || bond.ownedCount < count) return;
    const revenue = bond.faceValue * count;

    setCash((prev) => prev + revenue);
    setBonds((prev) =>
      prev.map((b) => (b.id === bondId ? { ...b, ownedCount: b.ownedCount - count } : b))
    );
  };

  // Bank Deposits
  const handleOpenDeposit = (params: {
    bankName: string;
    bankType: 'STATE_TOP' | 'REGIONAL' | 'NEOBANK';
    interestRate: number;
    termYears: number;
    amount: number;
  }) => {
    if (cash < params.amount) return;
    setCash((prev) => prev - params.amount);
    const newDep: BankDeposit = {
      id: `dep_${Date.now()}`,
      bankName: params.bankName,
      bankType: params.bankType,
      interestRate: params.interestRate,
      termYears: params.termYears,
      startYear: year,
      principal: params.amount,
      currentAmount: params.amount,
      isInsuredAsv: true,
    };
    setDeposits((prev) => [...prev, newDep]);
  };

  const handleCloseDepositEarly = (depositId: string) => {
    const dep = deposits.find((d) => d.id === depositId);
    if (!dep) return;
    setCash((prev) => prev + dep.principal);
    setDeposits((prev) => prev.filter((d) => d.id !== depositId));
  };

  // Crypto Trading
  const handleBuyCrypto = (cryptoId: string, rubleAmount: number) => {
    const coin = crypto.find((c) => c.id === cryptoId);
    if (!coin || cash < rubleAmount || rubleAmount <= 0) return;
    const coinsPurchased = rubleAmount / coin.price;

    setCash((prev) => prev - rubleAmount);
    setCrypto((prev) =>
      prev.map((c) =>
        c.id === cryptoId ? { ...c, ownedAmount: c.ownedAmount + coinsPurchased } : c
      )
    );
  };

  const handleSellCrypto = (cryptoId: string, rubleAmount: number) => {
    const coin = crypto.find((c) => c.id === cryptoId);
    if (!coin || rubleAmount <= 0) return;
    const coinsToSell = rubleAmount / coin.price;
    if (coin.ownedAmount < coinsToSell) return;

    setCash((prev) => prev + rubleAmount);
    setCrypto((prev) =>
      prev.map((c) =>
        c.id === cryptoId ? { ...c, ownedAmount: Math.max(0, c.ownedAmount - coinsToSell) } : c
      )
    );
  };

  // Legacy Business / Gold Assets
  const handleBuyBusinessAsset = (assetId: string) => {
    const asset = businessAssets.find((a) => a.id === assetId);
    if (!asset || cash < asset.cost || asset.owned) return;

    setCash((prev) => prev - asset.cost);
    setBusinessAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, owned: true } : a))
    );
    if (asset.type === 'REAL_ESTATE') {
      setHasApartment(true);
    }
    setJoy((prev) => Math.min(100, prev + 15));
  };

  // Real Estate Handlers
  const handleBuyRealEstate = (propertyId: string) => {
    const prop = realEstate.find((p) => p.id === propertyId);
    if (!prop || cash < prop.currentPrice) return;

    setCash((prev) => prev - prop.currentPrice);
    setRealEstate((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, ownedCount: p.ownedCount + 1 } : p))
    );

    if (['STUDIO', 'APARTMENT', 'BUSINESS_CLASS', 'PREMIUM'].includes(prop.category)) {
      setHasApartment(true);
    }
    setJoy((prev) => Math.min(100, prev + 12));
  };

  const handleSellRealEstate = (propertyId: string) => {
    const prop = realEstate.find((p) => p.id === propertyId);
    if (!prop || prop.ownedCount <= 0) return;

    setCash((prev) => prev + prop.currentPrice);
    setRealEstate((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, ownedCount: p.ownedCount - 1 } : p))
    );
  };

  const handleRenovateRealEstate = (propertyId: string) => {
    const prop = realEstate.find((p) => p.id === propertyId);
    if (!prop || prop.ownedCount <= 0 || prop.isRenovated || cash < prop.renovationCost) return;

    setCash((prev) => prev - prop.renovationCost);
    setRealEstate((prev) =>
      prev.map((p) =>
        p.id === propertyId
          ? {
              ...p,
              isRenovated: true,
              annualRentIncome: Math.round(p.annualRentIncome * 1.3),
              currentPrice: Math.round(p.currentPrice * 1.15),
            }
          : p
      )
    );
    setJoy((prev) => Math.min(100, prev + 8));
  };

  // Business Empire Handlers
  const handleStartBusinessEmpire = (bizId: string) => {
    const biz = businessEmpires.find((b) => b.id === bizId);
    if (!biz || biz.owned || cash < biz.baseCost) return;

    setCash((prev) => prev - biz.baseCost);
    setBusinessEmpires((prev) =>
      prev.map((b) =>
        b.id === bizId
          ? {
              ...b,
              owned: true,
              level: 1,
            }
          : b
      )
    );
    setJoy((prev) => Math.min(100, prev + 15));
  };

  const handleUpgradeBusinessEmpire = (bizId: string) => {
    const biz = businessEmpires.find((b) => b.id === bizId);
    if (!biz || !biz.owned || biz.level >= biz.maxLevel || cash < biz.upgradeCost) return;

    const nextLevel = biz.level + 1;
    const isNowIpo = nextLevel >= biz.maxLevel;

    setCash((prev) => prev - biz.upgradeCost);

    const nextValuation = Math.round(biz.currentValuation * 2.2);
    const nextProfit = Math.round(biz.annualProfit * 2.1);
    const nextUpgradeCost = isNowIpo ? 0 : Math.round(biz.upgradeCost * 2.3);

    let ipoWindfall = 0;
    if (isNowIpo) {
      ipoWindfall = Math.round(nextValuation * 0.45); // Public offering windfall!
      setCash((prev) => prev + ipoWindfall);
      setJoy((prev) => Math.min(100, prev + 25));

      // Automatically list the company on the Moscow Exchange (MOEX) alongside blue chips!
      const sharePrice = Math.max(10, Math.round(nextValuation / 100000));
      const founderShares = 50000; // 50% founder shares held by player
      const playerStock: StockAsset = {
        id: `stock_${biz.id}`,
        name: `${biz.name} (Ваш бизнес)`,
        ticker: biz.stockTicker || 'MYBIZ',
        sector: biz.sector,
        description: `Публичный холдинг, основанный вами. Капитализация: ${nextValuation.toLocaleString('ru-RU')} ₽. Дивидендная политика: распределение прибыли среди акционеров.`,
        price: sharePrice,
        prevPrice: sharePrice,
        dividendYield: biz.dividendYield || 0.25,
        risk: 'medium',
        ownedShares: founderShares,
        heldSharesLastYear: founderShares,
        history: [sharePrice],
        isPlayerCompany: true,
        companyEmpireId: biz.id,
      };

      setStocks((prev) => {
        const existingIdx = prev.findIndex((s) => s.id === playerStock.id || s.companyEmpireId === biz.id);
        if (existingIdx >= 0) {
          return prev.map((s, idx) =>
            idx === existingIdx
              ? {
                  ...playerStock,
                  ownedShares: Math.max(s.ownedShares, founderShares),
                  heldSharesLastYear: s.heldSharesLastYear,
                  history: s.history,
                }
              : s
          );
        }
        return [playerStock, ...prev];
      });
    } else {
      setJoy((prev) => Math.min(100, prev + 10));
    }

    setBusinessEmpires((prev) =>
      prev.map((b) =>
        b.id === bizId
          ? {
              ...b,
              level: nextLevel,
              currentValuation: nextValuation,
              annualProfit: nextProfit,
              upgradeCost: nextUpgradeCost,
              isIpo: isNowIpo || b.isIpo,
              ipoCapitalRaised: (b.ipoCapitalRaised || 0) + ipoWindfall,
              stockAssetId: `stock_${biz.id}`,
            }
          : b
      )
    );
  };

  // Education
  const handleCompleteEducation = (tierId: string) => {
    const tier = educationTiers.find((t) => t.id === tierId);
    if (!tier || cash < tier.cost || tier.completed || tier.inProgress) return;

    const duration = tier.durationYears || (gameMode === '10_YEARS' ? 2 : 1);
    setCash((prev) => prev - tier.cost);

    if (duration <= 1) {
      setJoy((prev) => Math.min(100, prev + tier.joyBonus));
      setAnnualSalary((prev) => Math.round(prev * (1 + tier.salaryBonusMultiplier)));
      setEducationTiers((prev) =>
        prev.map((t) => (t.id === tierId ? { ...t, completed: true, inProgress: false, progressYears: 1 } : t))
      );
    } else {
      setJoy((prev) => Math.min(100, prev + Math.round(tier.joyBonus / 2)));
      setEducationTiers((prev) =>
        prev.map((t) => (t.id === tierId ? { ...t, inProgress: true, progressYears: 1, completed: false } : t))
      );
    }

    setPendingTaxRefund((prev) => prev + Math.round(tier.cost * 0.13));
  };

  // Loans
  const handleTakeLoan = (amount: number, termYears: number, interestRate: number) => {
    const r = interestRate;
    const n = termYears;
    const annuityFactor = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const annualPayment = Math.round(amount * annuityFactor);

    const newLoan: Loan = {
      id: `loan_${Date.now()}`,
      bankName: 'Сбербанк',
      totalAmount: amount,
      remainingDebt: amount,
      annualInterestRate: interestRate,
      annualPayment,
      durationYears: termYears,
      yearsRemaining: termYears,
    };

    setCash((prev) => prev + amount);
    setLoans((prev) => [...prev, newLoan]);
  };

  // Early Loan Repayment (Досрочное / заочное погашение кредита)
  const handleRepayLoanEarly = (loanId: string, amount: number) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan || amount <= 0) return;
    const actualRepay = Math.min(cash, Math.min(amount, loan.remainingDebt));
    if (actualRepay <= 0) return;

    setCash((prev) => prev - actualRepay);

    if (actualRepay >= loan.remainingDebt) {
      // Loan fully closed!
      setLoans((prev) => prev.filter((l) => l.id !== loanId));
    } else {
      // Partial early repayment: reduces principal and recalculates annuity payment
      const newDebt = loan.remainingDebt - actualRepay;
      const r = loan.annualInterestRate;
      const n = Math.max(1, loan.yearsRemaining);
      const annuityFactor = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const newAnnualPayment = Math.round(newDebt * annuityFactor);

      setLoans((prev) =>
        prev.map((l) =>
          l.id === loanId
            ? {
                ...l,
                remainingDebt: newDebt,
                annualPayment: newAnnualPayment,
              }
            : l
        )
      );
    }
    setJoy((prev) => Math.min(100, prev + 5));
  };

  // Credit Card Operations
  const handleUseCreditCard = (amount: number) => {
    const available = creditCard.limit - creditCard.usedAmount;
    if (amount > available) return;
    setCreditCard((prev) => ({
      ...prev,
      usedAmount: prev.usedAmount + amount,
    }));
    setCash((prev) => prev + amount);
  };

  const handleRepayCreditCard = (amount: number) => {
    const actualRepay = Math.min(cash, Math.min(amount, creditCard.usedAmount));
    if (actualRepay <= 0) return;
    setCash((prev) => prev - actualRepay);
    setCreditCard((prev) => ({
      ...prev,
      usedAmount: prev.usedAmount - actualRepay,
      isOverdue: prev.usedAmount - actualRepay > 0 ? prev.isOverdue : false,
    }));
  };

  // Toggle Debit Card
  const handleToggleDebitCard = () => {
    if (!debitCard.active && cash >= debitCard.annualFee) {
      setCash((prev) => prev - debitCard.annualFee);
      setDebitCard((prev) => ({ ...prev, active: true }));
    } else if (debitCard.active) {
      setDebitCard((prev) => ({ ...prev, active: false }));
    }
  };

  // Advance Year Core Engine
  const handleAdvanceYear = async () => {
    if (!isMandatoryExpensesPaid) return;

    // 1. Dividends & Coupons & Real Estate Rent & Business Empire Profits
    let earnedDividends = 0;
    stocks.forEach((s) => {
      earnedDividends += Math.round(s.ownedShares * s.price * s.dividendYield);
    });

    let earnedCoupons = 0;
    bonds.forEach((b) => {
      earnedCoupons += Math.round(b.ownedCount * b.faceValue * b.couponRate);
    });

    let earnedLegacyBusiness = 0;
    businessAssets.forEach((b) => {
      if (b.owned) {
        earnedLegacyBusiness += Math.round(b.cost * b.annualIncomeRate);
      }
    });

    // 2. Bank Deposits
    let earnedDepositInterest = 0;
    let maturedDepositsPayout = 0; // Principal + interest returned upon deposit maturity
    const updatedDeposits: BankDeposit[] = [];
    deposits.forEach((dep) => {
      const yearsPassed = year + 1 - dep.startYear;
      const interestForYear = Math.round(dep.currentAmount * dep.interestRate);
      earnedDepositInterest += interestForYear;
      const nextAmount = dep.currentAmount + interestForYear;

      if (yearsPassed >= dep.termYears) {
        maturedDepositsPayout += nextAmount; // Returned safely to cash!
      } else {
        updatedDeposits.push({
          ...dep,
          currentAmount: nextAmount,
        });
      }
    });
    setDeposits(updatedDeposits);

    // 3. Bank Loans & Debt Payments
    let totalLoanPayments = 0;
    const updatedLoans: Loan[] = [];
    loans.forEach((loan) => {
      totalLoanPayments += loan.annualPayment;
      const nextDebt = Math.max(0, loan.remainingDebt - (loan.annualPayment - loan.remainingDebt * loan.annualInterestRate));
      if (loan.yearsRemaining > 1) {
        updatedLoans.push({
          ...loan,
          remainingDebt: Math.round(nextDebt),
          yearsRemaining: loan.yearsRemaining - 1,
        });
      }
    });
    setLoans(updatedLoans);

    // 4. Credit Card Interest
    let creditCardInterestPaid = 0;
    let nextCreditCard = { ...creditCard };
    if (nextCreditCard.usedAmount > 0) {
      if (nextCreditCard.gracePeriodYearsRemaining > 0) {
        nextCreditCard.gracePeriodYearsRemaining = 0;
      } else {
        const interest = Math.round(nextCreditCard.usedAmount * nextCreditCard.interestRate);
        const penalty = Math.round(nextCreditCard.usedAmount * nextCreditCard.penaltyRate);
        creditCardInterestPaid = interest + penalty;
        nextCreditCard.usedAmount += interest + penalty;
        nextCreditCard.isOverdue = true;
      }
    }
    setCreditCard(nextCreditCard);

    // 5. Debit card cashback
    const totalSpentThisYear =
      mandatoryExpensesCost +
      optionalExpenses
        .filter((e) => acceptedOptionalIds.includes(e.id))
        .reduce((acc, e) => acc + e.cost, 0);

    const cashbackEarned = debitCard.active
      ? Math.round(totalSpentThisYear * debitCard.cashbackRate)
      : 0;

    // 6. Tax Deductions
    const taxDeductionEarned = pendingTaxRefund;
    setPendingTaxRefund(0);

    // 7. Random Event Generator
    let chosenEvent: GameRandomEvent;
    if (prefetchedEvent) {
      chosenEvent = prefetchedEvent;
      setPrefetchedEvent(null);
    } else {
      const recent = recentEventIds || [];
      let eligible = EXPANDED_EVENTS_POOL.filter((ev) => {
        if (ev.requiresCar && !hasCar) return false;
        if (ev.requiresApartment && !hasApartment) return false;
        return !recent.includes(ev.id);
      });

      if (eligible.length === 0) {
        eligible = EXPANDED_EVENTS_POOL.filter((ev) => {
          if (ev.requiresCar && !hasCar) return false;
          if (ev.requiresApartment && !hasApartment) return false;
          return true;
        });
      }

      chosenEvent = eligible[Math.floor(Math.random() * eligible.length)] || EXPANDED_EVENTS_POOL[0];
    }

    setRecentEventIds((prev) => [chosenEvent.id, ...prev.filter((id) => id !== chosenEvent.id)].slice(0, 30));
    setCurrentEvent(chosenEvent);

    let eventLossAfterInsurance = chosenEvent.choices && chosenEvent.choices.length > 0 ? 0 : chosenEvent.cashDelta;
    let insuranceSaved = false;
    if (chosenEvent.coveredByInsurance) {
      const activePolicy = insurances.find(
        (i) => i.type === chosenEvent.coveredByInsurance && i.active
      );
      if (activePolicy) {
        insuranceSaved = true;
        eventLossAfterInsurance = 0;
      }
    }
    setEventInsuranceSaved(insuranceSaved);
    setIsEventModalOpen(true);

    // 8. Update Macro Economy & News
    let nextNews: MacroNews;
    if (activeCrisis && activeCrisis.yearsRemaining && activeCrisis.yearsRemaining > 1) {
      const rem = activeCrisis.yearsRemaining - 1;
      nextNews = {
        ...activeCrisis,
        yearsRemaining: rem,
      };
      setActiveCrisis(nextNews);
    } else if (activeCrisis && activeCrisis.yearsRemaining === 1) {
      nextNews = pickRichMacroNews('BOOM');
      setActiveCrisis(null);
    } else {
      if (prefetchedNews) {
        nextNews = prefetchedNews;
        setPrefetchedNews(null);
        if (nextNews.durationYears && nextNews.durationYears > 1) {
          setActiveCrisis(nextNews);
        }
      } else {
        nextNews = pickRichMacroNews();
        if (nextNews.durationYears && nextNews.durationYears > 1) {
          setActiveCrisis(nextNews);
        }
      }
    }

    setNewsHistory((prev) => [
      { year, news: currentNews, inflation: inflationRate, keyRate },
      ...prev,
    ]);
    setCurrentNews(nextNews);

    // 8. Update Macro Economy, Central Bank & News
    let deltaInf = nextNews.inflationDelta || 0;
    let deltaKey = nextNews.keyRateDelta || 0;
    if (nextNews.cycleType === 'CRISIS' || nextNews.cycleType === 'STAGFLATION') {
      deltaInf = Math.max(0.02, deltaInf);
      deltaKey = Math.max(0.025, deltaKey);
    } else if (nextNews.cycleType === 'BOOM' || nextNews.cycleType === 'TECH_RALLY') {
      deltaInf = Math.min(-0.01, deltaInf);
      deltaKey = Math.min(-0.015, deltaKey);
    }

    const nextInflation = Math.max(0.04, Math.min(0.20, +(inflationRate + deltaInf).toFixed(3)));

    // Living Central Bank Decision Engine
    let cbDecision = nextNews.centralBank;
    if (!cbDecision) {
      let action: 'RAISE' | 'CUT' | 'HOLD' = 'HOLD';
      let rChange = 0;
      if (nextInflation > 0.085) {
        action = 'RAISE';
        rChange = +(Math.min(0.025, (nextInflation - 0.04) * 0.35)).toFixed(3);
      } else if (nextInflation < 0.06 && keyRate > 0.09) {
        action = 'CUT';
        rChange = -0.015;
      }

      const calculatedKeyRate = Math.max(0.065, Math.min(0.23, +(keyRate + rChange).toFixed(3)));
      const stmt =
        action === 'RAISE'
          ? `Совет директоров Банка России повысил ключевую ставку до ${(calculatedKeyRate * 100).toFixed(1)}% годовых для сдерживания ценового давления.`
          : action === 'CUT'
          ? `Банк России снизил ключевую ставку до ${(calculatedKeyRate * 100).toFixed(1)}% годовых на фоне замедления инфляции для поддержки деловой активности.`
          : `Банк России сохранил ставку на уровне ${(calculatedKeyRate * 100).toFixed(1)}% годовых: баланс рисков остается сбалансированным.`;

      cbDecision = {
        action,
        rateChange: rChange,
        newKeyRate: calculatedKeyRate,
        statement: stmt,
        guidance: action === 'RAISE' ? 'HAWKISH' : action === 'CUT' ? 'DOVISH' : 'NEUTRAL',
        inflationTarget: 0.04,
        reasoning:
          action === 'RAISE'
            ? 'Перегрев кредитования и рост производственных издержек требуют жестких условий ДКП.'
            : action === 'CUT'
            ? 'Замедление темпов роста цен открыло окно возможностей для стимулирования инвестиций.'
            : 'Текущие денежно-кредитные условия адекватны прогнозу инфляции 4%.',
      };
      nextNews = {
        ...nextNews,
        centralBank: cbDecision,
      };
    }

    const nextKeyRate = cbDecision ? cbDecision.newKeyRate : Math.max(0.07, Math.min(0.23, +(keyRate + deltaKey).toFixed(3)));
    setInflationRate(nextInflation);
    setKeyRate(nextKeyRate);
    setCurrentNews(nextNews);

    // Dynamic Business Empire Profits & Valuation
    let earnedEmpireProfit = 0;
    const updatedBusinessEmpires = businessEmpires.map((biz) => {
      if (!biz.owned) return biz;

      const bizMult = nextNews.marketImpact?.businessMultiplier || 1.0;
      const isTechFavored = nextNews.marketImpact?.favoredSector?.includes('IT') && biz.sector.includes('Технологии');
      const isRetailFavored = nextNews.marketImpact?.favoredSector?.includes('Потребительский') && biz.sector.includes('ритейл');
      const sectorBonus = isTechFavored || isRetailFavored ? 0.18 : 0;
      const rateEffect = nextKeyRate > 0.15 ? -0.06 : nextKeyRate < 0.10 ? +0.06 : 0;

      const dynamicProfitMultiplier = Math.max(0.70, Math.min(1.50, bizMult + sectorBonus + rateEffect));
      const yearProfit = Math.round(biz.annualProfit * dynamicProfitMultiplier);

      const divFlow = biz.isIpo ? Math.round(biz.currentValuation * (biz.dividendYield || 0.25)) : 0;
      earnedEmpireProfit += yearProfit + divFlow;

      const newBizValuation = Math.round(biz.currentValuation * (1 + (dynamicProfitMultiplier - 1.0) * 0.35));

      return {
        ...biz,
        currentValuation: newBizValuation,
        lastProfitMultiplier: dynamicProfitMultiplier,
      };
    });
    setBusinessEmpires(updatedBusinessEmpires);

    // 9. Update Stock, Crypto & Real Estate Prices
    setStocks((prev) =>
      prev.map((stock) => {
        // If this is a player's IPO company, link its price directly to business valuation & profits!
        if (stock.isPlayerCompany && stock.companyEmpireId) {
          const linkedBiz = updatedBusinessEmpires.find((b) => b.id === stock.companyEmpireId);
          if (linkedBiz) {
            const calculatedSharePrice = Math.max(10, Math.round(linkedBiz.currentValuation / 100000));
            return {
              ...stock,
              prevPrice: stock.price,
              price: calculatedSharePrice,
              dividendYield: linkedBiz.dividendYield || stock.dividendYield,
              heldSharesLastYear: stock.ownedShares,
              history: [...stock.history, calculatedSharePrice].slice(-6),
            };
          }
        }

        const sectorFavored = nextNews.marketImpact?.favoredSector === stock.sector;
        const sectorHit = nextNews.marketImpact?.hitSector === stock.sector;
        const sectorBonus = sectorFavored ? 0.15 : sectorHit ? -0.20 : 0;
        const randomFactor = Math.random() * 0.2 - 0.1;
        const multiplier = Math.max(
          0.5,
          (nextNews.marketImpact?.stockMarketMultiplier || 1.0) + sectorBonus + randomFactor
        );
        const newPrice = Math.max(10, Math.round(stock.price * multiplier));
        return {
          ...stock,
          prevPrice: stock.price,
          price: newPrice,
          heldSharesLastYear: stock.ownedShares,
          history: [...stock.history, newPrice].slice(-6),
        };
      })
    );

    // Crypto Market: Authentic 4-Year Halving Cycle + bounded corridor
    // year % 4 == 1: Post-halving Bull Run (+40% to +85%)
    // year % 4 == 2: Bear Market Crash (-35% to -50%)
    // year % 4 == 3: Accumulation Bottom (-10% to +15%)
    // year % 4 == 0: Pre-halving Rally (+20% to +45%)
    const halvingPhase = year % 4;
    setCrypto((prev) =>
      prev.map((coin) => {
        let phaseMultiplier = 1.0;
        if (halvingPhase === 1) {
          phaseMultiplier = 1.35 + Math.random() * 0.35;
        } else if (halvingPhase === 2) {
          phaseMultiplier = 0.55 + Math.random() * 0.12;
        } else if (halvingPhase === 3) {
          phaseMultiplier = 0.95 + Math.random() * 0.18;
        } else {
          phaseMultiplier = 1.22 + Math.random() * 0.22;
        }

        const newsCryptoMult = nextNews.marketImpact?.cryptoMultiplier || 1.0;
        const totalMult = phaseMultiplier * (1 + (newsCryptoMult - 1.0) * 0.35);

        const initialCoin = INITIAL_CRYPTO.find((c) => c.id === coin.id) || coin;
        const secularTrend = initialCoin.price * Math.pow(1.06, Math.min(50, year));
        let newPrice = Math.round(coin.price * totalMult);

        if (newPrice > secularTrend * 6) {
          newPrice = Math.round(newPrice * 0.85); // Gravitational pull down from bubble top
        } else if (newPrice < secularTrend * 0.3) {
          newPrice = Math.round(newPrice * 1.25); // Support rebound from panic trough
        }
        newPrice = Math.max(10, newPrice);

        return {
          ...coin,
          prevPrice: coin.price,
          price: newPrice,
          history: [...coin.history, newPrice].slice(-6),
        };
      })
    );

    // Real Estate Market Update & Rent Calculation
    // Mortgages cool down when key rate is high (>14%); subsidized boom when low (<10%)
    // Prices follow rational economic corridor (NEVER explode into hundreds of billions!)
    let earnedRentIncome = 0;
    const rateCooling = nextKeyRate > 0.14 ? -0.04 : nextKeyRate < 0.10 ? +0.03 : 0;
    const cycleBonus = nextNews.cycleType === 'BOOM' ? 0.05 : nextNews.cycleType === 'CRISIS' ? -0.04 : 0.01;
    const netPropertyMultiplier = 1 + Math.max(-0.05, Math.min(0.08, nextInflation * 0.55 + cycleBonus + rateCooling));

    const updatedRealEstate = realEstate.map((prop) => {
      const rent = prop.isRenovated ? Math.round(prop.annualRentIncome * 1.3) : prop.annualRentIncome;
      const netPropIncome = (rent - prop.annualMaintenance) * prop.ownedCount;
      earnedRentIncome += Math.max(0, netPropIncome);

      const initialProp = INITIAL_REAL_ESTATE.find((p) => p.id === prop.id) || prop;
      const maxReasonablePrice = Math.round(initialProp.basePrice * Math.pow(1.05, Math.min(50, year)) * 2.2);
      let calculatedPrice = Math.round(prop.currentPrice * netPropertyMultiplier);
      if (calculatedPrice > maxReasonablePrice) {
        calculatedPrice = Math.round(maxReasonablePrice + (calculatedPrice - maxReasonablePrice) * 0.2);
      }

      const newRent = Math.round(prop.annualRentIncome * (1 + nextInflation * 0.65));

      return {
        ...prop,
        prevPrice: prop.currentPrice,
        currentPrice: calculatedPrice,
        annualRentIncome: newRent,
      };
    });
    setRealEstate(updatedRealEstate);

    // 10. Education Progression & Career Indexation
    let newAnnualSalary = annualSalary;
    let educationGraduationSummary = '';
    const updatedEducationTiers = educationTiers.map((tier) => {
      if (tier.inProgress && !tier.completed) {
        const nextProgress = (tier.progressYears || 1) + 1;
        const targetDuration = tier.durationYears || (gameMode === '10_YEARS' ? 2 : 1);
        if (nextProgress >= targetDuration) {
          newAnnualSalary = Math.round(newAnnualSalary * (1 + tier.salaryBonusMultiplier));
          educationGraduationSummary = `Диплом «${tier.name}» получен (+${Math.round(tier.salaryBonusMultiplier * 100)}% к окладу)!`;
          return {
            ...tier,
            progressYears: nextProgress,
            inProgress: false,
            completed: true,
          };
        }
        return {
          ...tier,
          progressYears: nextProgress,
        };
      }
      return tier;
    });
    setEducationTiers(updatedEducationTiers);

    // Natural salary indexation with inflation (+3% to +6% per year)
    const indexedSalary = Math.round(newAnnualSalary * (1 + Math.max(0.03, nextInflation * 0.70)));
    setAnnualSalary(indexedSalary);

    // 11. Net Cash Delta and Net Worth
    const netCashChange =
      annualSalary +
      earnedLegacyBusiness +
      earnedRentIncome +
      earnedEmpireProfit +
      earnedDividends +
      earnedCoupons +
      earnedDepositInterest +
      maturedDepositsPayout +
      cashbackEarned +
      taxDeductionEarned -
      totalLoanPayments +
      eventLossAfterInsurance;

    const nextCash = Math.max(0, cash + netCashChange);
    setCash(nextCash);

    // Joy Delta with Realistic Life Routine Fatigue (-8 joy per year)
    const passiveCoversAll = passiveIncomeAnnual >= mandatoryExpensesCost;
    let routineFatigue = passiveCoversAll ? -4 : -8; // Financial independence softens work fatigue!
    let joyChange = routineFatigue + chosenEvent.joyDelta;
    if (cash > annualSalary * 2) joyChange += 2;
    if (joy < 30) joyChange -= 3; // Burnout downward spiral if neglected

    const nextJoy = Math.max(0, Math.min(100, joy + joyChange));
    setJoy(nextJoy);

    // Reset Insurances for next year
    setInsurances((prev) => prev.map((i) => ({ ...i, active: false })));

    // 12. Single Source of Truth for Mandatory Expenses of Next Year
    const totalCommercialIncome = earnedLegacyBusiness + earnedEmpireProfit;
    const totalPropertiesValue = updatedRealEstate.reduce(
      (acc, r) => acc + r.ownedCount * r.currentPrice,
      0
    );

    const nextBreakdown = calculateMandatoryExpensesBreakdown({
      annualSalary: indexedSalary,
      businessIncome: totalCommercialIncome,
      rentIncome: earnedRentIncome,
      baseLivingFloor: 160000,
      hasApartment,
      hasCar,
      debitCardActive: debitCard.active,
      inflationMultiplier: Math.pow(1 + nextInflation, Math.min(12, year)),
      investmentPropertiesCount: updatedRealEstate.reduce((acc, r) => acc + r.ownedCount, 0),
      propertyTotalValuation: totalPropertiesValue,
    });

    const nextMandatory = nextBreakdown.total;
    setMandatoryExpensesCost(nextMandatory);
    setIsMandatoryExpensesPaid(false);

    // Update Lifetime Earnings
    setTotalDividendsEarned((prev) => prev + earnedDividends);
    setTotalCouponsEarned((prev) => prev + earnedCoupons);
    setTotalSalaryEarned((prev) => prev + annualSalary);

    // Refresh Optional Expenses
    const shuffled = [...OPTIONAL_EXPENSES_POOL]
      .filter((e) => {
        if (e.isOneTimeAssetPurchase === 'CAR' && hasCar) return false;
        if (e.isOneTimeAssetPurchase === 'APARTMENT' && hasApartment) return false;
        if (acceptedOptionalIds.includes(e.id)) return false;
        return true;
      })
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    setOptionalExpenses(shuffled);
    setAcceptedOptionalIds([]);
    setDeclinedOptionalIds([]);

    // Turn Report
    const eventsReportList = [
      `${chosenEvent.title}: ${
        insuranceSaved
          ? 'расход покрыт страховкой!'
          : `${chosenEvent.cashDelta >= 0 ? '+' : ''}${chosenEvent.cashDelta.toLocaleString('ru-RU')} ₽`
      }`,
    ];
    if (cbDecision) {
      eventsReportList.push(`Решение ЦБ РФ: ${cbDecision.statement}`);
    }
    if (maturedDepositsPayout > 0) {
      eventsReportList.push(
        `Вклад закрыт по окончании срока: на счет выплачено ${maturedDepositsPayout.toLocaleString('ru-RU')} ₽ (тело вклада + проценты)!`
      );
    }
    if (educationGraduationSummary) {
      eventsReportList.push(educationGraduationSummary);
    }
    if (earnedRentIncome > 0) {
      eventsReportList.push(`Арендный доход от недвижимости: +${earnedRentIncome.toLocaleString('ru-RU')} ₽`);
    }
    if (earnedEmpireProfit > 0) {
      eventsReportList.push(`Прибыль от бизнес-империи: +${earnedEmpireProfit.toLocaleString('ru-RU')} ₽`);
    }

    const report: TurnReport = {
      year,
      salaryIncome: indexedSalary,
      businessIncome: earnedLegacyBusiness + earnedEmpireProfit,
      rentIncomeEarned: earnedRentIncome,
      dividendsEarned: earnedDividends,
      couponsEarned: earnedCoupons,
      depositInterestEarned: earnedDepositInterest,
      depositMaturedReturned: maturedDepositsPayout,
      cashbackEarned,
      taxDeductionsEarned: taxDeductionEarned,
      mandatoryExpensesPaid: mandatoryExpensesCost,
      nextYearMandatoryExpenses: nextMandatory,
      mandatoryExpensesDelta: nextMandatory - mandatoryExpensesCost,
      mandatoryExpensesReason: `Обязательный платеж изменился: инфляция ${(nextInflation * 100).toFixed(1)}%${hasCar ? ', автоналог и ТО' : ''}${hasApartment ? ', собственное жилье' : ''}${newAnnualSalary > annualSalary ? ', рост оклада и НДФЛ' : ''}${totalCommercialIncome > 0 ? ', налог на бизнес УСН/ОСНО' : ''}.`,
      optionalExpensesPaid: totalSpentThisYear - mandatoryExpensesCost,
      insurancePaid: insurances.filter((i) => i.active).reduce((acc, i) => acc + i.annualCost, 0),
      cardFeesPaid: debitCard.active ? debitCard.annualFee : 0,
      loanPaymentsPaid: totalLoanPayments,
      creditCardInterestPaid,
      eventsSummary: eventsReportList,
      netCashDelta: netCashChange,
      netWorthDelta: nextCash - cash,
      joyDelta: joyChange,
    };
    setLastTurnReport(report);
    setIsTurnSummaryOpen(true);

    // Update History Chart Data
    const nextYear = year + 1;
    setYear(nextYear);
    setHistory((prev) => [
      ...prev,
      {
        year: nextYear,
        netWorth: nextCash + totalInvested - debtTotal,
        cash: nextCash,
        invested: totalInvested,
        joy: nextJoy,
        passiveIncome: passiveIncomeAnnual,
      },
    ]);

    // Check Victory / Game Over Condition in 10-Year or Goal Mode
    if (gameMode === '10_YEARS' && nextYear > 10) {
      const victory = netWorth >= goal.targetCapital && nextJoy >= goal.minJoy;
      setIsVictorious(victory);
      setFailReason(
        !victory
          ? netWorth < goal.targetCapital
            ? `Не удалось накопить целевой капитал ${goal.targetCapital.toLocaleString('ru-RU')} ₽ (накоплено: ${netWorth.toLocaleString('ru-RU')} ₽)`
            : `Уровень радости упал до ${nextJoy} (требовалось не менее ${goal.minJoy})`
          : undefined
      );
      setIsGameOverOpen(true);
      recordLeaderboard(victory, nextYear - 1, nextJoy, netWorth);
    }
  };

  // Event Choice Handler
  const handleSelectEventChoice = (choice: EventChoice) => {
    setCash((prev) => Math.max(0, prev + choice.cashDelta));
    setJoy((prev) => Math.min(100, Math.max(0, prev + choice.joyDelta)));
    setIsEventModalOpen(false);
    sound.playCoin();
  };

  // Record Leaderboard Entry
  const recordLeaderboard = (
    victorious: boolean,
    yearsTaken: number,
    finalJoy: number,
    finalCapital: number
  ) => {
    const entry: LeaderboardEntry = {
      id: `entry_${Date.now()}`,
      playerName,
      mode: gameMode,
      goalTitle: goal.title,
      finalCapital,
      finalJoy,
      yearsTaken,
      isVictorious: victorious,
      timestamp: Date.now(),
    };
    const updated = [entry, ...leaderboard].slice(0, 20);
    setLeaderboard(updated);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  };

  // Finish Goal Early
  const handleFinishGameEarly = () => {
    setIsVictorious(true);
    setIsGameOverOpen(true);
    recordLeaderboard(true, year, joy, netWorth);
    sound.playJoy();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Sleek Modern Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenDownload={() => setIsDownloadOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onRestartGame={() => setIsSetupOpen(true)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        year={year}
        gameMode={
          gameMode === '10_YEARS'
            ? 'Классика 10 лет'
            : gameMode === 'SANDBOX'
            ? 'Песочница'
            : goal.title
        }
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
        {/* Sleek Unified Dashboard Status Bar */}
        <StatusBar
          character={character}
          year={year}
          maxYears={10}
          mode={gameMode}
          goal={goal}
          cash={cash}
          netWorth={netWorth}
          joy={joy}
          hasApartment={hasApartment}
          hasBusiness={hasBusiness}
          passiveIncome={passiveIncomeAnnual}
          activeCrisis={activeCrisis}
          onFinishGameEarly={handleFinishGameEarly}
        />

        {/* Tab Content Panels */}
        {activeTab === 'overview' && (
          <OverviewTab
            cash={cash}
            netWorth={netWorth}
            annualSalary={annualSalary}
            mandatoryExpensesCost={mandatoryExpensesCost}
            isMandatoryExpensesPaid={isMandatoryExpensesPaid}
            onPayMandatoryExpenses={handlePayMandatoryExpenses}
            optionalExpenses={optionalExpenses}
            acceptedOptionalIds={acceptedOptionalIds}
            declinedOptionalIds={declinedOptionalIds}
            onAcceptOptional={handleAcceptOptional}
            onDeclineOptional={handleDeclineOptional}
            insurances={insurances}
            onToggleInsurance={handleToggleInsurance}
            hasCar={hasCar}
            hasApartment={hasApartment}
            debitCard={debitCard}
            creditCard={creditCard}
            inflationRate={inflationRate}
            onAdvanceYear={handleAdvanceYear}
            year={year}
            emergencyFundMonths={emergencyFundMonths}
            breakdown={mandatoryBreakdown}
          />
        )}

        {activeTab === 'investments' && (
          <InvestmentsTab
            cash={cash}
            stocks={stocks}
            onBuyStock={handleBuyStock}
            onSellStock={handleSellStock}
            bonds={bonds}
            onBuyBond={handleBuyBond}
            onSellBond={handleSellBond}
            deposits={deposits}
            onOpenDeposit={handleOpenDeposit}
            onCloseDepositEarly={handleCloseDepositEarly}
            crypto={crypto}
            onBuyCrypto={handleBuyCrypto}
            onSellCrypto={handleSellCrypto}
            businessAssets={businessAssets}
            onBuyBusinessAsset={handleBuyBusinessAsset}
            realEstate={realEstate}
            onBuyRealEstate={handleBuyRealEstate}
            onSellRealEstate={handleSellRealEstate}
            onRenovateRealEstate={handleRenovateRealEstate}
            businessEmpires={businessEmpires}
            onStartBusinessEmpire={handleStartBusinessEmpire}
            onUpgradeBusinessEmpire={handleUpgradeBusinessEmpire}
            year={year}
            keyRate={keyRate}
            inflationRate={inflationRate}
            currentNews={currentNews}
          />
        )}

        {activeTab === 'banking' && (
          <BankingTab
            cash={cash}
            annualSalary={annualSalary}
            loans={loans}
            onTakeLoan={handleTakeLoan}
            onRepayLoanEarly={handleRepayLoanEarly}
            creditCard={creditCard}
            onUseCreditCard={handleUseCreditCard}
            onRepayCreditCard={handleRepayCreditCard}
            debitCard={debitCard}
            onToggleDebitCard={handleToggleDebitCard}
            keyRate={keyRate}
          />
        )}

        {activeTab === 'career' && (
          <CareerTab
            cash={cash}
            character={character}
            annualSalary={annualSalary}
            educationTiers={educationTiers}
            onCompleteEducation={handleCompleteEducation}
            burnoutPenaltyActive={joy < 30}
            flowStateActive={joy >= 85}
          />
        )}

        {activeTab === 'news' && (
          <NewsTab
            currentNews={currentNews}
            inflationRate={inflationRate}
            keyRate={keyRate}
            newsHistory={newsHistory}
            year={year}
            activeCrisis={activeCrisis}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            history={history}
            netWorth={netWorth}
            cash={cash}
            stocksValue={stocksValue}
            bondsValue={bondsValue}
            depositsValue={depositsValue}
            cryptoValue={cryptoValue}
            businessValue={businessValue + realEstateValue + businessEmpiresValue}
            debtTotal={debtTotal}
            totalDividendsEarned={totalDividendsEarned}
            totalCouponsEarned={totalCouponsEarned}
            totalSalaryEarned={totalSalaryEarned}
            currentJoy={joy}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-slate-700">ФинПуть</span> · Симулятор финансовой жизни и инвестиций
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRulesOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Справочник правил
            </button>
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Зал славы
            </button>
            <button
              onClick={() => setIsTourOpen(true)}
              className="hover:text-slate-900 transition-colors text-indigo-600 font-semibold"
            >
              Обучение со стрелками
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TurnSummaryModal
        isOpen={isTurnSummaryOpen}
        onClose={() => setIsTurnSummaryOpen(false)}
        report={lastTurnReport}
        inflationRate={inflationRate}
        currentNews={currentNews}
      />

      <EventModal
        isOpen={isEventModalOpen}
        event={currentEvent}
        insuranceSavedLoss={eventInsuranceSaved}
        onClose={() => setIsEventModalOpen(false)}
        onSelectChoice={handleSelectEventChoice}
      />

      <RulesGuideModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <OnboardingTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        entries={leaderboard}
        onClearLeaderboard={() => {
          localStorage.removeItem(LEADERBOARD_KEY);
          setLeaderboard([]);
        }}
      />

      <GameOverModal
        isOpen={isGameOverOpen}
        isVictorious={isVictorious}
        failReason={failReason}
        totalCapital={netWorth}
        cashAmount={cash}
        investedAmount={totalInvested}
        finalJoy={joy}
        yearsTaken={year}
        goal={goal}
        mode={gameMode}
        hasUnpaidCreditCard={creditCard.usedAmount > 0}
        onPlayAgain={() => {
          setIsGameOverOpen(false);
          setIsSetupOpen(true);
        }}
        onViewLeaderboard={() => {
          setIsGameOverOpen(false);
          setIsLeaderboardOpen(true);
        }}
      />

      <GameSetupModal
        isOpen={isSetupOpen}
        onStartGame={handleStartGame}
      />
    </div>
  );
}
