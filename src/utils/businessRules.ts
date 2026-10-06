import type { BusinessEmpire, StockAsset } from '../types/game';

export interface BusinessDisruption {
  id: string;
  title: string;
  description: string;
  profitMultiplier: number;
  yearsRemaining: number;
}

export interface BusinessYearResult {
  businesses: BusinessEmpire[];
  operatingProfit: number;
  incidentSummaries: string[];
}

export const STANDARD_BUSINESS_MAX_LEVEL = 4;
export const STANDARD_BUSINESS_STARTUP_PROFIT_FACTOR = 0.65;
export const STANDARD_BUSINESS_UPGRADE_PROFIT_FACTOR = 1.9;
export const STANDARD_BUSINESS_INCIDENT_CHANCE = 0.06;

const STANDARD_LEVEL_NAMES = [
  'Не куплено',
  'Уровень 1: Частный стартовый бизнес',
  'Уровень 2: Устойчивый региональный бизнес',
  'Уровень 3: Сетевая компания',
  'Уровень 4: Федеральный частный бизнес',
];

const BUSINESS_DISRUPTIONS: Omit<BusinessDisruption, 'yearsRemaining'>[] = [
  {
    id: 'fire',
    title: 'Пожар и ремонт помещений',
    description: 'Работа части площадок приостановлена, оборудование и помещения восстанавливаются.',
    profitMultiplier: 0,
  },
  {
    id: 'equipment_failure',
    title: 'Авария оборудования',
    description: 'Срочный ремонт и простой линии временно ограничивают выпуск и продажи.',
    profitMultiplier: 0.4,
  },
  {
    id: 'cyberattack',
    title: 'Кибератака на инфраструктуру',
    description: 'Восстановление систем и компенсации клиентам резко увеличивают расходы.',
    profitMultiplier: 0.35,
  },
  {
    id: 'regulatory_audit',
    title: 'Проверка регулятора',
    description: 'Дополнительные проверки и ограничения временно снижают объём операций.',
    profitMultiplier: 0.65,
  },
  {
    id: 'supply_disruption',
    title: 'Срыв поставок',
    description: 'Дефицит комплектующих и сырья мешает работать в обычном режиме.',
    profitMultiplier: 0.55,
  },
];

export function getBusinessCatalogForEdition(
  catalog: BusinessEmpire[],
  isYandexBuild: boolean
): BusinessEmpire[] {
  return catalog.map((business) => {
    if (isYandexBuild) return { ...business, levelNames: [...business.levelNames] };

    return {
      ...business,
      annualProfit: Math.round(business.annualProfit * STANDARD_BUSINESS_STARTUP_PROFIT_FACTOR),
      maxLevel: STANDARD_BUSINESS_MAX_LEVEL,
      isIpo: false,
      dividendYield: 0,
      stockAssetId: undefined,
      ipoCapitalRaised: undefined,
      activeDisruption: undefined,
      levelNames: [...STANDARD_LEVEL_NAMES],
    };
  });
}

/** Keeps old standard-edition portfolios playable while retiring legacy business IPOs. */
export function migrateLegacyBusinessPortfolio(
  savedBusinesses: BusinessEmpire[],
  stocks: StockAsset[],
  standardCatalog: BusinessEmpire[]
): { businesses: BusinessEmpire[]; stocks: StockAsset[]; retiredIpoCount: number } {
  const retiredCompanyIds = new Set<string>();
  let retiredIpoCount = 0;

  const businesses = savedBusinesses.map((saved) => {
    const standard = standardCatalog.find((business) => business.id === saved.id);
    const normalizedLevel = Math.max(0, Math.min(STANDARD_BUSINESS_MAX_LEVEL, saved.level || 0));
    const levelNames = standard?.levelNames || STANDARD_LEVEL_NAMES;
    const initialProfit = standard?.annualProfit || 0;

    if (saved.isIpo) {
      retiredIpoCount += 1;
      retiredCompanyIds.add(saved.id);
      const listedStock = stocks.find(
        (stock) => stock.companyEmpireId === saved.id || stock.id === (saved.stockAssetId || `stock_${saved.id}`)
      );
      const retainedStakeValue = listedStock
        ? Math.max(0, listedStock.ownedShares * listedStock.price)
        : 0;

      return {
        ...saved,
        level: STANDARD_BUSINESS_MAX_LEVEL,
        maxLevel: STANDARD_BUSINESS_MAX_LEVEL,
        currentValuation: retainedStakeValue,
        annualProfit: Math.round(retainedStakeValue * 0.10),
        upgradeCost: 0,
        isIpo: false,
        dividendYield: 0,
        stockAssetId: undefined,
        ipoCapitalRaised: undefined,
        activeDisruption: undefined,
        lastProfitMultiplier: undefined,
        levelNames: [...levelNames],
      };
    }

    const expectedBalancedProfit = saved.owned
      ? Math.round(initialProfit * Math.pow(STANDARD_BUSINESS_UPGRADE_PROFIT_FACTOR, Math.max(0, normalizedLevel - 1)))
      : initialProfit;

    return {
      ...saved,
      level: normalizedLevel,
      maxLevel: STANDARD_BUSINESS_MAX_LEVEL,
      annualProfit: saved.owned
        ? Math.max(0, Math.min(Number(saved.annualProfit) || expectedBalancedProfit, expectedBalancedProfit))
        : initialProfit,
      isIpo: false,
      dividendYield: 0,
      activeDisruption: undefined,
      lastProfitMultiplier: undefined,
      levelNames: [...levelNames],
    };
  });

  const retainedStocks = stocks.filter((stock) => {
    if (!stock.isPlayerCompany) return true;
    return !retiredCompanyIds.has(stock.companyEmpireId || stock.id.replace(/^stock_/, ''));
  });

  return { businesses, stocks: retainedStocks, retiredIpoCount };
}

function pickDisruption(random: () => number): Omit<BusinessDisruption, 'yearsRemaining'> {
  const index = Math.min(BUSINESS_DISRUPTIONS.length - 1, Math.floor(random() * BUSINESS_DISRUPTIONS.length));
  return BUSINESS_DISRUPTIONS[index];
}

function getMarketProfitMultiplier(
  business: BusinessEmpire,
  environment: { businessMultiplier: number; favoredSector?: string; keyRate: number }
): number {
  const marketMultiplier = environment.businessMultiplier || 1;
  const techFavored = environment.favoredSector?.includes('IT') && business.sector.includes('Технологии');
  const retailFavored = environment.favoredSector?.includes('Потребительский') && business.sector.includes('ритейл');
  const sectorBonus = techFavored || retailFavored ? 0.18 : 0;
  const rateEffect = environment.keyRate > 0.15 ? -0.06 : environment.keyRate < 0.10 ? 0.06 : 0;
  return Math.max(0.70, Math.min(1.50, marketMultiplier + sectorBonus + rateEffect));
}

export function processStandardBusinessYear(
  businesses: BusinessEmpire[],
  environment: { businessMultiplier: number; favoredSector?: string; keyRate: number },
  random: () => number = Math.random
): BusinessYearResult {
  let operatingProfit = 0;
  const incidentSummaries: string[] = [];

  const updatedBusinesses = businesses.map((business) => {
    if (!business.owned) return business;

    let disruption = business.activeDisruption && business.activeDisruption.yearsRemaining > 0
      ? business.activeDisruption
      : undefined;
    const isNewDisruption = !disruption && random() < STANDARD_BUSINESS_INCIDENT_CHANCE;
    if (isNewDisruption) {
      disruption = { ...pickDisruption(random), yearsRemaining: 2 };
    }

    const marketMultiplier = getMarketProfitMultiplier(business, environment);
    const totalMultiplier = marketMultiplier * (disruption?.profitMultiplier ?? 1);
    const yearProfit = Math.round(business.annualProfit * totalMultiplier);
    if (!business.isIpo) operatingProfit += yearProfit;

    let activeDisruption: BusinessDisruption | undefined;
    if (disruption) {
      const yearsRemainingAfterThisYear = Math.max(0, disruption.yearsRemaining - 1);
      if (yearsRemainingAfterThisYear > 0) {
        activeDisruption = { ...disruption, yearsRemaining: yearsRemainingAfterThisYear };
      }

      if (isNewDisruption) {
        incidentSummaries.push(
          `${business.name}: ${disruption.title}. ${disruption.description} Прибыль в этом году снижена на ${Math.round((1 - disruption.profitMultiplier) * 100)}%; событие затронет и следующий год.`
        );
      } else if (yearsRemainingAfterThisYear > 0) {
        incidentSummaries.push(
          `${business.name}: продолжается «${disruption.title}»; в этом году получено ${Math.round(disruption.profitMultiplier * 100)}% обычной прибыли, после года останется ещё ${yearsRemainingAfterThisYear} год.`
        );
      } else {
        incidentSummaries.push(
          `${business.name}: завершился последний год восстановления после «${disruption.title}».`
        );
      }
    }

    const updatedBusiness = {
      ...business,
      lastProfitMultiplier: totalMultiplier,
      activeDisruption,
    };
    return updatedBusiness;
  });

  return { businesses: updatedBusinesses, operatingProfit, incidentSummaries };
}
