import type { StockAsset } from '../types/game';

export type StockTradeSide = 'BUY' | 'SELL';

export interface StockTradeQuote {
  shares: number;
  side: StockTradeSide;
  referencePrice: number;
  averageExecutionPrice: number;
  totalValue: number;
  marketImpact: number;
  nextMarketPrice: number;
}

const TURNOVER_BY_RISK: Record<StockAsset['risk'], number> = {
  low: 1_500_000_000,
  medium: 500_000_000,
  high: 100_000_000,
};

/** Large orders cost more to execute and move the market price against the order. */
export function quoteStockTrade(
  stock: StockAsset,
  requestedShares: number,
  side: StockTradeSide
): StockTradeQuote {
  const shares = Math.max(0, Math.floor(Number.isFinite(requestedShares) ? requestedShares : 0));
  const referencePrice = Math.max(0, stock.price);
  const orderValue = referencePrice * shares;
  const marketImpact = orderValue > 0
    ? Math.min(0.12, 0.02 * Math.sqrt(orderValue / TURNOVER_BY_RISK[stock.risk]))
    : 0;
  const direction = side === 'BUY' ? 1 : -1;
  const averageExecutionPrice = Math.max(0, referencePrice * (1 + direction * marketImpact / 2));
  const totalValue = Math.round(averageExecutionPrice * shares);
  const nextMarketPrice = Math.max(10, Math.round(referencePrice * (1 + direction * marketImpact)));

  return {
    shares,
    side,
    referencePrice,
    averageExecutionPrice,
    totalValue,
    marketImpact: direction * marketImpact,
    nextMarketPrice,
  };
}

/** Finds the largest whole-share buy order that still fits the player's cash balance. */
export function maxAffordableStockShares(stock: StockAsset, cash: number): number {
  if (cash <= 0 || stock.price <= 0) return 0;

  let low = 0;
  let high = Math.floor(cash / stock.price);
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (quoteStockTrade(stock, middle, 'BUY').totalValue <= cash) low = middle;
    else high = middle - 1;
  }
  return low;
}

export interface StockMarketCatalyst {
  stockId: string;
  ticker: string;
  title: string;
  description: string;
  priceImpact: number;
}

interface CatalystTemplate {
  sectors: string[];
  title: string;
  description: string;
  priceImpact: number;
}

const MARKET_CATALYSTS: CatalystTemplate[] = [
  {
    sectors: ['it', 'ии', 'технолог', 'электрон'],
    title: 'Крупный контракт в технологическом секторе',
    description: 'Новая сделка повышает ожидания инвесторов по выручке компании.',
    priceImpact: 0.12,
  },
  {
    sectors: ['it', 'ии', 'технолог', 'электрон'],
    title: 'Сбой ключевого цифрового сервиса',
    description: 'Клиенты уходят, а расходы на восстановление давят на прогноз прибыли.',
    priceImpact: -0.14,
  },
  {
    sectors: ['финанс'],
    title: 'Рост просрочек по кредитам',
    description: 'Рынок закладывает дополнительные резервы и снижение банковской прибыли.',
    priceImpact: -0.12,
  },
  {
    sectors: ['финанс'],
    title: 'Сильный квартал банковского сектора',
    description: 'Комиссионные доходы и качество кредитного портфеля оказались лучше ожиданий.',
    priceImpact: 0.10,
  },
  {
    sectors: ['нефть', 'газ'],
    title: 'Внеплановая остановка экспортной инфраструктуры',
    description: 'Рынок ожидает временного снижения поставок и роста расходов.',
    priceImpact: -0.13,
  },
  {
    sectors: ['нефть', 'газ'],
    title: 'Новый долгосрочный контракт на сырьё',
    description: 'Ожидаемые экспортные поставки улучшают прогноз денежного потока.',
    priceImpact: 0.11,
  },
  {
    sectors: ['потребитель', 'ритейл', 'электронная коммерция'],
    title: 'Успешный сезон продаж',
    description: 'Спрос и средний чек превысили прогноз аналитиков.',
    priceImpact: 0.09,
  },
  {
    sectors: ['потребитель', 'ритейл', 'электронная коммерция'],
    title: 'Снижение покупательского спроса',
    description: 'Компания вынуждена активнее снижать цены и наращивать расходы на скидки.',
    priceImpact: -0.11,
  },
  {
    sectors: ['металл'],
    title: 'Остановка крупного производственного комплекса',
    description: 'Ремонт оборудования временно ограничивает выпуск продукции.',
    priceImpact: -0.12,
  },
  {
    sectors: ['металл'],
    title: 'Ввод нового производственного участка',
    description: 'Рост объёмов производства поддерживает прогноз экспортной выручки.',
    priceImpact: 0.10,
  },
  {
    sectors: ['девелоп', 'недвиж'],
    title: 'Замедление продаж новостроек',
    description: 'Дорогая ипотека увеличивает срок продажи квартир и стоимость финансирования.',
    priceImpact: -0.14,
  },
  {
    sectors: ['девелоп', 'недвиж'],
    title: 'Запуск крупного жилого проекта',
    description: 'Новый проект и эскроу-финансирование улучшают ожидания по выручке.',
    priceImpact: 0.10,
  },
  {
    sectors: ['био', 'медицин', 'фарма'],
    title: 'Клиническое исследование прошло важный этап',
    description: 'Шансы на коммерциализацию разработки выросли, но остаются неопределёнными.',
    priceImpact: 0.16,
  },
  {
    sectors: ['био', 'медицин', 'фарма'],
    title: 'Задержка клинических испытаний',
    description: 'Регулятор запросил дополнительные данные, коммерческий запуск откладывается.',
    priceImpact: -0.18,
  },
  {
    sectors: [],
    title: 'Неожиданный крупный заказ',
    description: 'Новый контракт временно улучшает ожидания по продажам компании.',
    priceImpact: 0.08,
  },
  {
    sectors: [],
    title: 'Расследование регулятора',
    description: 'Неопределённость и возможные штрафы заставляют инвесторов снижать оценки.',
    priceImpact: -0.10,
  },
];

/** One issuer-specific catalyst per year, independent of macro headlines. */
export function rollStockMarketCatalyst(
  stocks: StockAsset[],
  random: () => number = Math.random,
  chance = 0.32
): StockMarketCatalyst | null {
  const candidates = stocks.filter((stock) => !stock.isBankrupt && !stock.isPlayerCompany);
  if (candidates.length === 0 || random() >= chance) return null;

  const stock = candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
  const sector = stock.sector.toLowerCase();
  const matchingTemplates = MARKET_CATALYSTS.filter(
    (template) => template.sectors.length > 0 && template.sectors.some((keyword) => sector.includes(keyword))
  );
  const templates = matchingTemplates.length > 0
    ? matchingTemplates
    : MARKET_CATALYSTS.filter((template) => template.sectors.length === 0);
  const template = templates[Math.min(templates.length - 1, Math.floor(random() * templates.length))];

  return {
    stockId: stock.id,
    ticker: stock.ticker,
    title: template.title,
    description: template.description,
    priceImpact: template.priceImpact,
  };
}
