import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  MACRO_NEWS_POOL,
} from './data/initialData';
import { LOCAL_GAMEPLAY_EVENTS, pickRichMacroNews } from './data/richEventsPool';
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
import { OnboardingTourModal } from './components/Modals/OnboardingTourModal';
import { calculateMandatoryExpensesBreakdown } from './utils/expenses';
import { requestAiMacroNews, requestAiGameplayEvent } from './services/aiNewsService';
import { sound } from './utils/audio';
import { GAME_TRANSLATIONS, getGameTranslationsForYandexLanguage } from './i18n';
import type { GameLocale } from './i18n';
import {
  createYandexCloudSaveQueue,
  getYandexPlayer,
  initializeYandexGames,
  IS_YANDEX_GAMES_BUILD,
  loadYandexCloudSave,
  showYandexFullscreenAd,
} from './platform/yandexGames';
import type { YandexCloudSaveQueue, YandexGamesSDK } from './platform/yandexGames';
import {
  applyCashMovement,
  calculateAnnualPassiveIncome,
  calculateAnnualStockDividends,
  calculateInvestedAssetsValue,
  calculateNetWorth,
  combineEventChoiceImpact,
  evaluateGoalStatus,
  UNPAID_CREDIT_CARD_GAME_OVER_LIMIT,
  UNPAID_CREDIT_CARD_GAME_OVER_REASON,
  evaluateYearEndOutcome,
  processAnnualBondDefaults,
  protectEventLossWithEmergencyFund,
  salaryJoyMultiplier,
} from './utils/gameRules';

const STORAGE_KEY = 'finlife_save_v1';
const LEADERBOARD_KEY = 'finlife_leaderboard_v1';
const PREFER_YANDEX_CLOUD_ON_RESTORE_KEY = 'finlife_yandex_cloud_restore_after_account_selection';

export default function App() {
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);
  const [isTurnSummaryOpen, setIsTurnSummaryOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [locale, setLocale] = useState<GameLocale>('ru');
  const [yandexSdk, setYandexSdk] = useState<YandexGamesSDK | null>(null);
  const [isSaveHydrated, setIsSaveHydrated] = useState(false);
  const [isYandexAdShowing, setIsYandexAdShowing] = useState(false);
  const [isYandexPlatformPaused, setIsYandexPlatformPaused] = useState(false);
  const yandexGameplayActiveRef = useRef<boolean | null>(null);
  const yandexCloudSaveQueueRef = useRef<YandexCloudSaveQueue | null>(null);
  const hasActiveGameRef = useRef(false);
  const pendingEventChoiceResolverRef = useRef<((choice: EventChoice) => void) | null>(null);
  const isAdvancingYearRef = useRef(false);

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
  const [primaryResidenceValue, setPrimaryResidenceValue] = useState(0);

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
  const [eventEmergencyFundSaved, setEventEmergencyFundSaved] = useState(0);
  const [eventCashDeltaAfterProtection, setEventCashDeltaAfterProtection] = useState(0);
  const [pendingTaxRefund, setPendingTaxRefund] = useState(0);

  // Lifetime Stats
  const [totalDividendsEarned, setTotalDividendsEarned] = useState(0);
  const [totalCouponsEarned, setTotalCouponsEarned] = useState(0);
  const [totalSalaryEarned, setTotalSalaryEarned] = useState(1200000);
  const [history, setHistory] = useState<YearHistoryPoint[]>([
    {
      year: 0,
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
    () =>
      businessEmpires
        .filter((business) => business.owned && !business.isIpo)
        .reduce((acc, business) => acc + business.currentValuation, 0),
    [businessEmpires]
  );

  const totalInvested = useMemo(
    () =>
      calculateInvestedAssetsValue({
        stocks,
        bonds,
        deposits,
        crypto,
        businessAssets,
        realEstate,
        businessEmpires,
        primaryResidenceValue,
      }),
    [stocks, bonds, deposits, crypto, businessAssets, realEstate, businessEmpires, primaryResidenceValue]
  );

  const debtTotal = useMemo(
    () => loans.reduce((acc, l) => acc + l.remainingDebt, 0) + creditCard.usedAmount,
    [loans, creditCard]
  );

  const netWorth = useMemo(
    () => calculateNetWorth(cash, totalInvested, debtTotal),
    [cash, totalInvested, debtTotal]
  );

  const effectiveAnnualSalary = Math.round(annualSalary * salaryJoyMultiplier(joy));

  const hasBusiness = useMemo(
    () =>
      businessAssets.some((a) => a.type === 'BUSINESS' && a.owned) ||
      businessEmpires.some((b) => b.owned),
    [businessAssets, businessEmpires]
  );

  const passiveIncomeAnnual = useMemo(
    () => calculateAnnualPassiveIncome({ stocks, bonds, deposits, businessAssets, realEstate, businessEmpires }),
    [stocks, bonds, deposits, businessAssets, realEstate, businessEmpires]
  );

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
      .filter((business) => business.owned && !business.isIpo)
      .reduce((acc, business) => acc + business.annualProfit, 0);

    const currentRentIncome = realEstate.reduce((acc, r) => {
      return acc + Math.max(0, (r.annualRentIncome - r.annualMaintenance) * r.ownedCount);
    }, 0);

    const totalRealEstateValuation =
      primaryResidenceValue +
      realEstate.reduce((acc, property) => acc + property.ownedCount * property.currentPrice, 0);

    return calculateMandatoryExpensesBreakdown({
      annualSalary: effectiveAnnualSalary,
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
    effectiveAnnualSalary,
    businessAssets,
    businessEmpires,
    realEstate,
    hasApartment,
    primaryResidenceValue,
    hasCar,
    debitCard.active,
    inflationRate,
    year,
  ]);

  useEffect(() => {
    setMandatoryExpensesCost(mandatoryBreakdown.total);
  }, [mandatoryBreakdown.total]);

  // Restore local progress first, then prefer a newer Yandex cloud snapshot.
  useEffect(() => {
    let cancelled = false;

    const restoreSave = async () => {
      let platformSdk: YandexGamesSDK | null = null;
      try {
        const savedLb = localStorage.getItem(LEADERBOARD_KEY);
        if (savedLb) {
          setLeaderboard(JSON.parse(savedLb));
        }

        let data: Record<string, any> | null = null;
        const savedGame = localStorage.getItem(STORAGE_KEY);
        if (savedGame) {
          try {
            data = JSON.parse(savedGame) as Record<string, any>;
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        if (IS_YANDEX_GAMES_BUILD) {
          let preferCloudSave = false;
          try {
            preferCloudSave =
              sessionStorage.getItem(PREFER_YANDEX_CLOUD_ON_RESTORE_KEY) === 'true';
          } catch {
            // Session storage may be unavailable in restricted browser contexts.
          }

          platformSdk = await initializeYandexGames();
          if (cancelled) return;
          if (platformSdk) {
            const localizedGame = getGameTranslationsForYandexLanguage(
              platformSdk.environment?.i18n?.lang
            );
            document.documentElement.lang = localizedGame.locale;
            setLocale(localizedGame.locale);
            setYandexSdk(platformSdk);
            const player = await getYandexPlayer(platformSdk);
            if (cancelled) return;
            if (player) {
              yandexCloudSaveQueueRef.current = createYandexCloudSaveQueue(player);
              const cloudSave = await loadYandexCloudSave(player);
              if (cancelled) return;
              const localSavedAt = Number(data?._savedAt) || 0;
              if (cloudSave && (preferCloudSave || cloudSave.savedAt > localSavedAt)) {
                data = cloudSave.payload;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
              }
              try {
                sessionStorage.removeItem(PREFER_YANDEX_CLOUD_ON_RESTORE_KEY);
              } catch {
                // Ignore restricted session storage.
              }
            }
          }
        }

        if (cancelled) return;
        if (data) {
          hasActiveGameRef.current = true;
          if (Array.isArray(data.leaderboard)) setLeaderboard(data.leaderboard);
          setPlayerName(data.playerName || 'Инвестор');
          const loadedMode: GameMode = data.gameMode || 'GOAL';
          const storedYear = Number(data.year) || 1;
          const legacySave = !Object.hasOwn(data, 'primaryResidenceValue');
          const legacyClassicFinished =
            legacySave && loadedMode === '10_YEARS' && storedYear > 10 && !Object.hasOwn(data, 'isGameOverOpen');
          const loadedCardDebt = Number(data.creditCard?.usedAmount) || 0;
          const loadedCardDebtReachedGameOver = loadedCardDebt >= UNPAID_CREDIT_CARD_GAME_OVER_LIMIT;
          const loadedGoal: LifeGoal =
            data.goal || (loadedMode === '10_YEARS' ? INITIAL_LIFE_GOALS[0] : INITIAL_LIFE_GOALS[1]);
          setGameMode(loadedMode);
          setGoal(loadedGoal);
          setCharacter(data.character || INITIAL_CHARACTERS[0]);
          setYear(legacyClassicFinished ? 10 : storedYear);
          setIsGameOverOpen(
            Boolean(data.isGameOverOpen) || legacyClassicFinished || loadedCardDebtReachedGameOver
          );
          setIsVictorious(loadedCardDebtReachedGameOver ? false : Boolean(data.isVictorious));
          setFailReason(
            loadedCardDebtReachedGameOver ? UNPAID_CREDIT_CARD_GAME_OVER_REASON : data.failReason
          );
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
          const loadedHasApartment = Boolean(data.hasApartment);
          setHasApartment(loadedHasApartment);
          // Older saves stored only the ownership flag; preserve their purchased home value.
          setPrimaryResidenceValue(
            Number.isFinite(data.primaryResidenceValue)
              ? Math.max(0, data.primaryResidenceValue)
              : loadedHasApartment
              ? 7200000
              : 0
          );
          setRecentEventIds(data.recentEventIds || []);
          setInflationRate(data.inflationRate || 0.08);
          setKeyRate(data.keyRate || 0.12);
          setCurrentNews(data.currentNews || MACRO_NEWS_POOL[0]);
          setActiveCrisis(data.activeCrisis || null);
          setNewsHistory(data.newsHistory || []);
          setPendingTaxRefund(data.pendingTaxRefund || 0);

          const savedStocks: StockAsset[] = data.stocks || [];
          const initialStockIds = new Set(INITIAL_STOCKS.map((stock) => stock.id));
          const mergedStocks = [
            ...INITIAL_STOCKS.map((initialStock) => {
              const savedStock = savedStocks.find((stock) => stock.id === initialStock.id);
              return savedStock
                ? {
                    ...initialStock,
                    ...savedStock,
                    heldSharesLastYear: savedStock.heldSharesLastYear ?? savedStock.ownedShares,
                  }
                : initialStock;
            }),
            ...savedStocks
              .filter((stock) => !initialStockIds.has(stock.id))
              .map((stock) => ({
                ...stock,
                heldSharesLastYear: stock.heldSharesLastYear ?? stock.ownedShares,
              })),
          ];
          const loadedBonds: BondAsset[] = data.bonds || INITIAL_BONDS;
          const loadedDeposits: BankDeposit[] = data.deposits || [];
          const loadedCrypto: CryptoAsset[] = data.crypto || INITIAL_CRYPTO;
          const loadedBusinessAssets: BusinessOrRealEstate[] =
            data.businessAssets || INITIAL_BUSINESS_AND_REAL_ESTATE;
          const loadedRealEstate: RealEstateProperty[] = data.realEstate || INITIAL_REAL_ESTATE;
          const loadedBusinessEmpires: BusinessEmpire[] = data.businessEmpires || INITIAL_BUSINESS_EMPIRES;
          setStocks(mergedStocks);
          setBonds(loadedBonds);
          setDeposits(loadedDeposits);
          setCrypto(loadedCrypto);
          setBusinessAssets(loadedBusinessAssets);
          setRealEstate(loadedRealEstate);
          setBusinessEmpires(loadedBusinessEmpires);
          setInsurances(data.insurances || INITIAL_INSURANCES);
          setEducationTiers(data.educationTiers || INITIAL_EDUCATION_TIERS);
          const loadedCreditCard: CreditCard = data.creditCard || {
            limit: 600000,
            usedAmount: 0,
            gracePeriodYearsRemaining: 1,
            interestRate: 0.28,
            penaltyRate: 0.1,
            isOverdue: false,
          };
          const loadedLoans: Loan[] = data.loans || [];
          setCreditCard(loadedCreditCard);
          setLoans(loadedLoans);
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
          const loadedHistory: YearHistoryPoint[] = data.history || [
            { year: 0, netWorth: 350000, cash: 350000, invested: 0, joy: 75, passiveIncome: 0 },
          ];
          setHistory(
            legacySave
              ? loadedHistory.map((point) => ({ ...point, year: Math.max(0, point.year - 1) }))
              : loadedHistory
          );

          if (legacyClassicFinished) {
            const migratedResidenceValue = Number.isFinite(data.primaryResidenceValue)
              ? Math.max(0, data.primaryResidenceValue)
              : loadedHasApartment
              ? 7200000
              : 0;
            const loadedDebt =
              loadedLoans.reduce((sum, loan) => sum + loan.remainingDebt, 0) + loadedCreditCard.usedAmount;
            const finalCapital = calculateNetWorth(
              loadedCash,
              calculateInvestedAssetsValue({
                stocks: mergedStocks,
                bonds: loadedBonds,
                deposits: loadedDeposits,
                crypto: loadedCrypto,
                businessAssets: loadedBusinessAssets,
                realEstate: loadedRealEstate,
                businessEmpires: loadedBusinessEmpires,
                primaryResidenceValue: migratedResidenceValue,
              }),
              loadedDebt
            );
            const finalPassiveIncome = calculateAnnualPassiveIncome({
              stocks: mergedStocks,
              bonds: loadedBonds,
              deposits: loadedDeposits,
              businessAssets: loadedBusinessAssets,
              realEstate: loadedRealEstate,
              businessEmpires: loadedBusinessEmpires,
            });
            const finalStatus = evaluateGoalStatus({
              mode: loadedMode,
              goal: loadedGoal,
              netWorth: finalCapital,
              cash: loadedCash,
              joy: data.joy ?? 75,
              hasApartment: loadedHasApartment,
              primaryResidenceValue: migratedResidenceValue,
              hasBusiness:
                loadedBusinessAssets.some((asset) => asset.type === 'BUSINESS' && asset.owned) ||
                loadedBusinessEmpires.some((business) => business.owned),
              passiveIncome: finalPassiveIncome,
              creditCardDebt: loadedCreditCard.usedAmount,
            });
            setIsVictorious(finalStatus.canClaimVictory);
            setFailReason(
              finalStatus.canClaimVictory
                ? undefined
                : 'Итоговые условия сохранённой классической партии не выполнены.'
            );
          }

          if (loadedCardDebtReachedGameOver) {
            setIsGameOverOpen(true);
            setIsVictorious(false);
            setFailReason(UNPAID_CREDIT_CARD_GAME_OVER_REASON);
          }
        } else {
          setIsSetupOpen(true);
        }

        const tourDone = localStorage.getItem('finlife_tour_completed');
        if (!tourDone) {
          setIsTourOpen(true);
        }
      } catch (error) {
        console.warn('Game save restoration failed; starting with local defaults:', error);
        setIsSetupOpen(true);
      } finally {
        if (!cancelled) setIsSaveHydrated(true);
      }
    };

    void restoreSave();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!IS_YANDEX_GAMES_BUILD) return;

    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    document.addEventListener('contextmenu', preventContextMenu);
    return () => document.removeEventListener('contextmenu', preventContextMenu);
  }, []);

  useEffect(() => {
    if (!IS_YANDEX_GAMES_BUILD || !yandexSdk || !isSaveHydrated) return;
    yandexSdk.features?.LoadingAPI?.ready?.();
  }, [yandexSdk, isSaveHydrated]);

  useEffect(() => {
    if (!IS_YANDEX_GAMES_BUILD || !yandexSdk) return;

    const setGameplayActive = (active: boolean) => {
      if (yandexGameplayActiveRef.current === active) return;
      yandexGameplayActiveRef.current = active;
      if (active) {
        yandexSdk.features?.GameplayAPI?.start?.();
      } else {
        yandexSdk.features?.GameplayAPI?.stop?.();
        sound.suspend();
      }
    };

    const updateGameplayState = () => {
      const canPlay =
        isSaveHydrated &&
        !document.hidden &&
        !isSetupOpen &&
        !isGameOverOpen &&
        !isTurnSummaryOpen &&
        !isYandexAdShowing &&
        !isYandexPlatformPaused;
      setGameplayActive(canPlay);
    };
    const handleBlur = () => {
      sound.suspend();
      void yandexCloudSaveQueueRef.current?.flush(true);
      setGameplayActive(false);
    };
    const handleFocus = () => {
      setIsYandexPlatformPaused(false);
      updateGameplayState();
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        void yandexCloudSaveQueueRef.current?.flush(true);
      } else {
        setIsYandexPlatformPaused(false);
      }
      updateGameplayState();
    };
    const handleSdkPause = () => {
      sound.suspend();
      void yandexCloudSaveQueueRef.current?.flush(true);
      setIsYandexPlatformPaused(true);
    };
    const handleSdkResume = () => setIsYandexPlatformPaused(false);
    const handleAccountSelectionOpened = () => {
      sound.suspend();
      void yandexCloudSaveQueueRef.current?.flush(true);
      setIsYandexPlatformPaused(true);
    };
    const handleAccountSelectionClosed = () => {
      try {
        sessionStorage.setItem(PREFER_YANDEX_CLOUD_ON_RESTORE_KEY, 'true');
      } catch {
        // The reload still lets the SDK create a fresh Player object.
      }
      window.location.reload();
    };

    const unsubscribePause = yandexSdk.on?.('game_api_pause', handleSdkPause);
    const unsubscribeResume = yandexSdk.on?.('game_api_resume', handleSdkResume);
    const accountSelectionOpenedEvent = yandexSdk.EVENTS?.ACCOUNT_SELECTION_DIALOG_OPENED;
    const accountSelectionClosedEvent = yandexSdk.EVENTS?.ACCOUNT_SELECTION_DIALOG_CLOSED;
    const unsubscribeAccountSelectionOpened = accountSelectionOpenedEvent
      ? yandexSdk.on?.(accountSelectionOpenedEvent, handleAccountSelectionOpened)
      : undefined;
    const unsubscribeAccountSelectionClosed = accountSelectionClosedEvent
      ? yandexSdk.on?.(accountSelectionClosedEvent, handleAccountSelectionClosed)
      : undefined;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    updateGameplayState();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      if (typeof unsubscribePause === 'function') unsubscribePause();
      else yandexSdk.off?.('game_api_pause', handleSdkPause);
      if (typeof unsubscribeResume === 'function') unsubscribeResume();
      else yandexSdk.off?.('game_api_resume', handleSdkResume);
      if (accountSelectionOpenedEvent) {
        if (typeof unsubscribeAccountSelectionOpened === 'function') unsubscribeAccountSelectionOpened();
        else yandexSdk.off?.(accountSelectionOpenedEvent, handleAccountSelectionOpened);
      }
      if (accountSelectionClosedEvent) {
        if (typeof unsubscribeAccountSelectionClosed === 'function') unsubscribeAccountSelectionClosed();
        else yandexSdk.off?.(accountSelectionClosedEvent, handleAccountSelectionClosed);
      }
      setGameplayActive(false);
    };
  }, [yandexSdk, isSaveHydrated, isSetupOpen, isGameOverOpen, isTurnSummaryOpen, isYandexAdShowing, isYandexPlatformPaused]);

  // Save Game on State Change
  const saveCurrentGame = useCallback(() => {
    if (!isSaveHydrated || !hasActiveGameRef.current) return;

    try {
      const data = {
        _savedAt: Date.now(),
        playerName,
        gameMode,
        goal,
        isGameOverOpen,
        isVictorious,
        failReason,
        character,
        year,
        cash,
        joy,
        annualSalary,
        mandatoryExpensesCost,
        isMandatoryExpensesPaid,
        hasCar,
        hasApartment,
        primaryResidenceValue,
        recentEventIds,
        inflationRate,
        keyRate,
        currentNews,
        activeCrisis,
        newsHistory,
        pendingTaxRefund,
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
        leaderboard,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (!isYandexPlatformPaused) yandexCloudSaveQueueRef.current?.schedule(data);
    } catch {
      // Keep the browser save as the fallback if cloud sync is unavailable.
    }
  }, [
    isSaveHydrated,
    isYandexPlatformPaused,
    playerName,
    gameMode,
    goal,
    isGameOverOpen,
    isVictorious,
    failReason,
    character,
    year,
    cash,
    joy,
    annualSalary,
    mandatoryExpensesCost,
    isMandatoryExpensesPaid,
    hasCar,
    hasApartment,
    primaryResidenceValue,
    recentEventIds,
    inflationRate,
    keyRate,
    currentNews,
    activeCrisis,
    newsHistory,
    pendingTaxRefund,
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
    leaderboard,
  ]);

  useEffect(() => {
    saveCurrentGame();
  }, [saveCurrentGame]);

  useEffect(() => {
    if (!IS_YANDEX_GAMES_BUILD || !isSaveHydrated) return;

    const flushCloudSave = () => {
      void yandexCloudSaveQueueRef.current?.flush(true);
    };
    const handleVisibilityChange = () => {
      if (document.hidden) flushCloudSave();
    };

    window.addEventListener('pagehide', flushCloudSave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', flushCloudSave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSaveHydrated]);

  // Background Prefetch for Next Turn
  useEffect(() => {
    if (!isSaveHydrated) return;

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
  }, [isSaveHydrated, year, hasCar, hasApartment, hasBusiness, character.name, character.role, activeCrisis?.headline]);

  // Start New Game Handler
  const handleStartGame = (params: {
    playerName: string;
    character: CharacterPreset;
    mode: GameMode;
    goal: LifeGoal;
  }) => {
    hasActiveGameRef.current = true;
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
    setPrimaryResidenceValue(0);
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
        year: 0,
        netWorth: params.character.initialCash,
        cash: params.character.initialCash,
        invested: 0,
        joy: params.character.initialJoy,
        passiveIncome: 0,
      },
    ]);

    setActiveTab('overview');
    setIsRulesOpen(false);
    setIsTourOpen(false);
    setIsLeaderboardOpen(false);
    setIsSetupOpen(false);
    setIsGameOverOpen(false);
    setIsTurnSummaryOpen(false);
    setIsEventModalOpen(false);
    setIsVictorious(false);
    setFailReason(undefined);
    setLastTurnReport(null);
    setCurrentEvent(null);
    setEventInsuranceSaved(false);
    setEventEmergencyFundSaved(0);
    setEventCashDeltaAfterProtection(0);
    setPendingTaxRefund(0);
    setActiveCrisis(null);
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
      setPrimaryResidenceValue(expense.cost);
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
    if (!bond || bond.isDefaulted) return;
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
    if (!isMandatoryExpensesPaid || isAdvancingYearRef.current) return;
    isAdvancingYearRef.current = true;

    try {
      // Resolve interactive events before mutating the year's financial state. This
      // ensures reports, history, and a final-year result include the player's choice.
      let chosenEvent: GameRandomEvent;
      if (prefetchedEvent) {
        chosenEvent = prefetchedEvent;
      } else {
        const recent = recentEventIds || [];
        let eligible = LOCAL_GAMEPLAY_EVENTS.filter((event) => {
          if (event.requiresCar && !hasCar) return false;
          if (event.requiresApartment && !hasApartment) return false;
          return !recent.includes(event.id);
        });

        if (eligible.length === 0) {
          eligible = LOCAL_GAMEPLAY_EVENTS.filter((event) => {
            if (event.requiresCar && !hasCar) return false;
            if (event.requiresApartment && !hasApartment) return false;
            return true;
          });
        }

        chosenEvent = eligible[Math.floor(Math.random() * eligible.length)] || LOCAL_GAMEPLAY_EVENTS[0];
      }

      setCurrentEvent(chosenEvent);
      let eventLossAfterInsurance = chosenEvent.choices?.length ? 0 : chosenEvent.cashDelta;
      let insuranceSaved = false;
      if (chosenEvent.coveredByInsurance) {
        const activePolicy = insurances.find(
          (policy) => policy.type === chosenEvent.coveredByInsurance && policy.active
        );
        if (activePolicy) {
          insuranceSaved = true;
          eventLossAfterInsurance = 0;
        }
      }
      const emergencyFundProtection = protectEventLossWithEmergencyFund(
        eventLossAfterInsurance,
        emergencyFundMonths,
        insuranceSaved
      );
      eventLossAfterInsurance = emergencyFundProtection.cashDelta;
      setEventInsuranceSaved(insuranceSaved);
      setEventEmergencyFundSaved(emergencyFundProtection.protectedAmount);
      setEventCashDeltaAfterProtection(eventLossAfterInsurance);
      setIsEventModalOpen(true);

      let selectedEventChoice: EventChoice | undefined;
      if (chosenEvent.choices?.length) {
        selectedEventChoice = await new Promise<EventChoice>((resolve) => {
          pendingEventChoiceResolverRef.current = resolve;
        });
      }
      const eventImpact = combineEventChoiceImpact(
        { cashDelta: eventLossAfterInsurance, joyDelta: chosenEvent.joyDelta },
        selectedEventChoice
      );

      if (prefetchedEvent) setPrefetchedEvent(null);
      setRecentEventIds((prev) => [chosenEvent.id, ...prev.filter((id) => id !== chosenEvent.id)].slice(0, 30));

      // 1. Annual investment income and issuer defaults. Dividends use opening holdings.
      const earnedDividends = calculateAnnualStockDividends(stocks);
      const bondYear = processAnnualBondDefaults(bonds);
      const updatedBonds = bondYear.bonds;
      const earnedCoupons = bondYear.couponsEarned;
      setBonds(updatedBonds);

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
        const interestForYear = Math.round(loan.remainingDebt * loan.annualInterestRate);
        totalLoanPayments += loan.annualPayment;
        const nextDebt = Math.max(0, loan.remainingDebt - (loan.annualPayment - interestForYear));
        if (nextDebt > 0) {
          updatedLoans.push({
            ...loan,
            remainingDebt: Math.round(nextDebt),
            yearsRemaining: Math.max(0, loan.yearsRemaining - 1),
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

        // IPO dividends are already paid by the linked player-owned stock position.
        if (!biz.isIpo) earnedEmpireProfit += yearProfit;

        const newBizValuation = Math.round(biz.currentValuation * (1 + (dynamicProfitMultiplier - 1.0) * 0.35));

        return {
          ...biz,
          currentValuation: newBizValuation,
          lastProfitMultiplier: dynamicProfitMultiplier,
        };
      });
      setBusinessEmpires(updatedBusinessEmpires);

      // 9. Update Stock, Crypto & Real Estate Prices
      const updatedStocks = stocks.map((stock) => {
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
        });
      setStocks(updatedStocks);

      // Crypto Market: Authentic 4-Year Halving Cycle + bounded corridor
      // year % 4 == 1: Post-halving Bull Run (+40% to +85%)
      // year % 4 == 2: Bear Market Crash (-35% to -50%)
      // year % 4 == 3: Accumulation Bottom (-10% to +15%)
      // year % 4 == 0: Pre-halving Rally (+20% to +45%)
      const halvingPhase = year % 4;
      const updatedCrypto = crypto.map((coin) => {
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
        });
      setCrypto(updatedCrypto);

      // Real Estate Market Update & Rent Calculation
      // Mortgages cool down when key rate is high (>14%); subsidized boom when low (<10%)
      // Prices follow rational economic corridor (NEVER explode into hundreds of billions!)
      let earnedRentIncome = 0;
      const rateCooling = nextKeyRate > 0.14 ? -0.04 : nextKeyRate < 0.10 ? +0.03 : 0;
      const cycleBonus = nextNews.cycleType === 'BOOM' ? 0.05 : nextNews.cycleType === 'CRISIS' ? -0.04 : 0.01;
      const netPropertyMultiplier = 1 + Math.max(-0.05, Math.min(0.08, nextInflation * 0.55 + cycleBonus + rateCooling));

      const updatedRealEstate = realEstate.map((prop) => {
        const netPropIncome = (prop.annualRentIncome - prop.annualMaintenance) * prop.ownedCount;
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
      const nextPrimaryResidenceValue = primaryResidenceValue > 0
        ? Math.round(primaryResidenceValue * netPropertyMultiplier)
        : 0;
      setPrimaryResidenceValue(nextPrimaryResidenceValue);

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

      // 11. Net cash and salary effects for the year just completed.
      const salaryIncomeEarned = Math.round(annualSalary * salaryJoyMultiplier(joy));
      const netCashChange =
        salaryIncomeEarned +
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
        eventImpact.cashDelta;

      const cashMovement = applyCashMovement(cash, netCashChange);
      const nextCash = cashMovement.balance;
      setCash(nextCash);

      // Joy Delta with Realistic Life Routine Fatigue (-8 joy per year)
      const passiveCoversAll = passiveIncomeAnnual >= mandatoryExpensesCost;
      let routineFatigue = passiveCoversAll ? -4 : -8; // Financial independence softens work fatigue!
      let joyChange = routineFatigue + eventImpact.joyDelta;
      if (cash > annualSalary * 2) joyChange += 2;
      if (joy < 30) joyChange -= 3; // Burnout downward spiral if neglected

      const nextJoy = Math.max(0, Math.min(100, joy + joyChange));
      setJoy(nextJoy);

      // Reset Insurances for next year
      setInsurances((prev) => prev.map((i) => ({ ...i, active: false })));

      // 12. Single Source of Truth for Mandatory Expenses of Next Year
      const totalCommercialIncome = earnedLegacyBusiness + earnedEmpireProfit;
      const totalPropertiesValue =
        nextPrimaryResidenceValue +
        updatedRealEstate.reduce((acc, property) => acc + property.ownedCount * property.currentPrice, 0);

      const nextBreakdown = calculateMandatoryExpensesBreakdown({
        annualSalary: Math.round(indexedSalary * salaryJoyMultiplier(nextJoy)),
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
      setTotalSalaryEarned((prev) => prev + salaryIncomeEarned);

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

      // Reconcile the post-transition balance sheet before rendering the report or ending the run.
      const nextInvested = calculateInvestedAssetsValue({
        stocks: updatedStocks,
        bonds: updatedBonds,
        deposits: updatedDeposits,
        crypto: updatedCrypto,
        businessAssets,
        realEstate: updatedRealEstate,
        businessEmpires: updatedBusinessEmpires,
        primaryResidenceValue: nextPrimaryResidenceValue,
      });
      const nextDebtTotal =
        updatedLoans.reduce((sum, loan) => sum + loan.remainingDebt, 0) + nextCreditCard.usedAmount;
      const nextNetWorth = calculateNetWorth(nextCash, nextInvested, nextDebtTotal);
      const nextNetWorthDelta = nextNetWorth - netWorth;
      const nextPassiveIncome = calculateAnnualPassiveIncome({
        stocks: updatedStocks,
        bonds: updatedBonds,
        deposits: updatedDeposits,
        businessAssets,
        realEstate: updatedRealEstate,
        businessEmpires: updatedBusinessEmpires,
      });
      const outcome = evaluateYearEndOutcome({
        mode: gameMode,
        goal,
        yearsCompleted: year,
        netWorth: nextNetWorth,
        cash: nextCash,
        joy: nextJoy,
        hasApartment,
        primaryResidenceValue: nextPrimaryResidenceValue,
        hasBusiness:
          businessAssets.some((asset) => asset.type === 'BUSINESS' && asset.owned) ||
          updatedBusinessEmpires.some((business) => business.owned),
        passiveIncome: nextPassiveIncome,
        creditCardDebt: nextCreditCard.usedAmount,
      });

      // Turn Report
      const selectedChoiceEffects = selectedEventChoice
        ? [
            selectedEventChoice.cashDelta !== 0
              ? `${selectedEventChoice.cashDelta > 0 ? '+' : ''}${selectedEventChoice.cashDelta.toLocaleString('ru-RU')} ₽`
              : '',
            selectedEventChoice.joyDelta !== 0
              ? `${selectedEventChoice.joyDelta > 0 ? '+' : ''}${selectedEventChoice.joyDelta} радости`
              : '',
          ]
            .filter(Boolean)
            .join(', ')
        : '';
      const eventOutcomeSummary = selectedEventChoice
        ? `${selectedEventChoice.label}${selectedChoiceEffects ? ` (${selectedChoiceEffects})` : ''}`
        : insuranceSaved
        ? 'расход покрыт страховкой!'
        : emergencyFundProtection.protectedAmount > 0
        ? `${eventLossAfterInsurance.toLocaleString('ru-RU')} ₽ (резерв защитил ${emergencyFundProtection.protectedAmount.toLocaleString('ru-RU')} ₽)`
        : `${chosenEvent.cashDelta >= 0 ? '+' : ''}${chosenEvent.cashDelta.toLocaleString('ru-RU')} ₽`;
      const eventsReportList = [`${chosenEvent.title}: ${eventOutcomeSummary}`];
      if (cbDecision) {
        eventsReportList.push(`Решение ЦБ РФ: ${cbDecision.statement}`);
      }
      bondYear.defaults.forEach(({ bondName, principalLost }) => {
        eventsReportList.push(
          `Дефолт по облигациям «${bondName}»: потеряно ${principalLost.toLocaleString('ru-RU')} ₽ номинала; выпуск обесценился.`
        );
      });
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
        salaryIncome: salaryIncomeEarned,
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
        netCashDelta: cashMovement.actualDelta,
        netWorthDelta: nextNetWorthDelta,
        joyDelta: nextJoy - joy,
      };
      setLastTurnReport(report);
      setIsTurnSummaryOpen(true);

      // History starts at year 0 and records the balance sheet after each completed year.
      const completedYear = year;
      const nextYear = outcome.shouldEndGame ? year : year + 1;
      setYear(nextYear);
      setHistory((prev) => [
        ...prev,
        {
          year: completedYear,
          netWorth: nextNetWorth,
          cash: nextCash,
          invested: nextInvested,
          joy: nextJoy,
          passiveIncome: nextPassiveIncome,
        },
      ]);

      if (outcome.shouldEndGame) {
        const status = outcome.goalStatus;
        const goalFailureReason = !status.capitalMet
          ? `Не удалось накопить целевой капитал ${goal.targetCapital.toLocaleString('ru-RU')} ₽ (итоговый капитал: ${nextNetWorth.toLocaleString('ru-RU')} ₽)`
          : !status.joyMet
          ? `Уровень радости упал до ${nextJoy} (требовалось не менее ${goal.minJoy})`
          : !status.creditCardClear
          ? 'Нельзя засчитать победу с непогашенным долгом по кредитной карте.'
          : !status.apartmentMet
          ? 'Не выполнено условие о собственном жилье.'
          : !status.residenceValueMet
          ? `Стоимость собственного жилья ниже ${goal.requiredAssets?.primaryResidenceValueTarget?.toLocaleString('ru-RU')} ₽.`
          : !status.cashReserveMet
          ? `Не сохранён резерв ${goal.requiredAssets?.cashReserveTarget?.toLocaleString('ru-RU')} ₽.`
          : !status.businessMet
          ? 'Не выполнено условие о собственном бизнесе.'
          : !status.passiveIncomeMet
          ? 'Не достигнут целевой уровень пассивного дохода.'
          : undefined;
        const reason = outcome.failureReason || goalFailureReason;

        setIsVictorious(outcome.isVictorious);
        setFailReason(outcome.isVictorious ? undefined : reason);
        setIsGameOverOpen(true);
        recordLeaderboard(outcome.isVictorious, completedYear, nextJoy, nextNetWorth);
      }
    } finally {
      isAdvancingYearRef.current = false;
    }
  };

  // Event Choice Handler
  const handleSelectEventChoice = (choice: EventChoice) => {
    const resolveChoice = pendingEventChoiceResolverRef.current;
    pendingEventChoiceResolverRef.current = null;
    setIsEventModalOpen(false);
    if (resolveChoice) {
      resolveChoice(choice);
    }
    sound.playCoin();
  };

  const handleCloseEventModal = () => {
    const resolveChoice = pendingEventChoiceResolverRef.current;
    pendingEventChoiceResolverRef.current = null;
    setIsEventModalOpen(false);
    if (resolveChoice) {
      resolveChoice({ id: 'skip', label: 'Решение пропущено', cashDelta: 0, joyDelta: 0 });
    }
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

  const handleCloseTurnSummary = useCallback(() => {
    setIsTurnSummaryOpen(false);

    const completedYear = lastTurnReport?.year ?? 0;
    const shouldShowAd =
      IS_YANDEX_GAMES_BUILD &&
      Boolean(yandexSdk) &&
      !isGameOverOpen &&
      completedYear > 0 &&
      completedYear % 3 === 0;
    if (!shouldShowAd || !yandexSdk) return;

    setIsYandexAdShowing(true);
    yandexSdk.features?.GameplayAPI?.stop?.();
    yandexGameplayActiveRef.current = false;
    sound.suspend();
    void yandexCloudSaveQueueRef.current?.flush(true);
    void showYandexFullscreenAd(yandexSdk).finally(() => setIsYandexAdShowing(false));
  }, [lastTurnReport, yandexSdk, isGameOverOpen]);

  // Finish Goal Early
  const handleFinishGameEarly = () => {
    const status = evaluateGoalStatus({
      mode: gameMode,
      goal,
      netWorth,
      cash,
      joy,
      hasApartment,
      primaryResidenceValue,
      hasBusiness,
      passiveIncome: passiveIncomeAnnual,
      creditCardDebt: creditCard.usedAmount,
    });
    if (gameMode !== 'GOAL' || !status.canClaimVictory) return;

    setIsVictorious(true);
    setFailReason(undefined);
    setIsGameOverOpen(true);
    recordLeaderboard(true, year, joy, netWorth);
    sound.playJoy();
  };

  if (IS_YANDEX_GAMES_BUILD && !isSaveHydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700 font-sans">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          <p className="font-semibold">{GAME_TRANSLATIONS[locale].loadingSave}</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Sleek Modern Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onRestartGame={() => setIsSetupOpen(true)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-6 pb-28 sm:pb-32 space-y-5">
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
          primaryResidenceValue={primaryResidenceValue}
          creditCardDebt={creditCard.usedAmount}
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
            annualSalary={effectiveAnnualSalary}
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
            annualSalary={effectiveAnnualSalary}
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
            primaryResidenceValue={primaryResidenceValue}
            debtTotal={debtTotal}
            totalDividendsEarned={totalDividendsEarned}
            totalCouponsEarned={totalCouponsEarned}
            totalSalaryEarned={totalSalaryEarned}
            currentJoy={joy}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 pb-[calc(5.25rem+env(safe-area-inset-bottom))] text-xs text-slate-500">
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
        onClose={handleCloseTurnSummary}
        report={lastTurnReport}
        inflationRate={inflationRate}
        currentNews={currentNews}
      />

      <EventModal
        isOpen={isEventModalOpen}
        event={currentEvent}
        insuranceSavedLoss={eventInsuranceSaved}
        emergencyFundProtectionAmount={eventEmergencyFundSaved}
        cashDeltaAfterProtection={eventCashDeltaAfterProtection}
        onClose={handleCloseEventModal}
        onSelectChoice={handleSelectEventChoice}
      />

      <RulesGuideModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <OnboardingTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={setActiveTab}
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
        debtAmount={debtTotal}
        finalJoy={joy}
        yearsTaken={year}
        goal={goal}
        mode={gameMode}
        hasUnpaidCreditCard={
          creditCard.usedAmount > 0 && creditCard.usedAmount < UNPAID_CREDIT_CARD_GAME_OVER_LIMIT
        }
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
