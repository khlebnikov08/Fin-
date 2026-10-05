import React, { useState, useEffect } from 'react';
import {
  StockAsset,
  BondAsset,
  BankDeposit,
  CryptoAsset,
  BusinessOrRealEstate,
  MacroNews,
  RealEstateProperty,
  BusinessEmpire,
} from '../../types/game';
import {
  TrendingUp,
  BarChart2,
  FileText,
  Building2,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Minus,
  Sparkles,
  Home,
  Briefcase,
  Flame,
  Rocket,
  Paintbrush,
  DollarSign,
  Layers,
  ArrowUpRight,
  TrendingDown,
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface InvestmentsTabProps {
  cash: number;
  stocks: StockAsset[];
  onBuyStock: (stockId: string, count: number) => void;
  onSellStock: (stockId: string, count: number) => void;
  bonds: BondAsset[];
  onBuyBond: (bondId: string, count: number) => void;
  onSellBond: (bondId: string, count: number) => void;
  deposits: BankDeposit[];
  onOpenDeposit: (params: {
    bankName: string;
    bankType: 'STATE_TOP' | 'REGIONAL' | 'NEOBANK';
    interestRate: number;
    termYears: number;
    amount: number;
  }) => void;
  onCloseDepositEarly: (depositId: string) => void;
  crypto: CryptoAsset[];
  onBuyCrypto: (cryptoId: string, rubleAmount: number) => void;
  onSellCrypto: (cryptoId: string, rubleAmount: number) => void;
  businessAssets: BusinessOrRealEstate[];
  onBuyBusinessAsset: (assetId: string) => void;
  realEstate: RealEstateProperty[];
  onBuyRealEstate: (propertyId: string) => void;
  onSellRealEstate: (propertyId: string) => void;
  onRenovateRealEstate: (propertyId: string) => void;
  businessEmpires: BusinessEmpire[];
  onStartBusinessEmpire: (bizId: string) => void;
  onUpgradeBusinessEmpire: (bizId: string) => void;
  year: number;
  keyRate: number;
  inflationRate: number;
  currentNews?: MacroNews;
}

export type InvestmentSubTab =
  | 'stocks'
  | 'bonds'
  | 'deposits'
  | 'crypto'
  | 'real_estate'
  | 'business_empire';

export const InvestmentsTab: React.FC<InvestmentsTabProps> = ({
  cash,
  stocks,
  onBuyStock,
  onSellStock,
  bonds,
  onBuyBond,
  onSellBond,
  deposits,
  onOpenDeposit,
  onCloseDepositEarly,
  crypto,
  onBuyCrypto,
  onSellCrypto,
  businessAssets,
  onBuyBusinessAsset,
  realEstate,
  onBuyRealEstate,
  onSellRealEstate,
  onRenovateRealEstate,
  businessEmpires,
  onStartBusinessEmpire,
  onUpgradeBusinessEmpire,
  year,
  keyRate,
  inflationRate,
  currentNews,
}) => {
  const [subTab, setSubTab] = useState<InvestmentSubTab>('stocks');

  // Deposit form state
  const [depositAmount, setDepositAmount] = useState<number>(() =>
    Math.min(100000, Math.max(10000, cash))
  );
  const [depositTerm, setDepositTerm] = useState<number>(2);
  const [selectedBankType, setSelectedBankType] = useState<
    'STATE_TOP' | 'REGIONAL' | 'NEOBANK'
  >('STATE_TOP');
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  // Stock lot size selector (1, 10, 50, 100, 1000)
  const [stockLotSize, setStockLotSize] = useState<number>(10);
  const [customStockQuantities, setCustomStockQuantities] = useState<Record<string, number>>({});

  // Crypto bulk trade states
  const [cryptoTradeAmounts, setCryptoTradeAmounts] = useState<Record<string, number>>({});
  const [cryptoSellAmounts, setCryptoSellAmounts] = useState<Record<string, number>>({});

  // Sync depositAmount when cash changes
  useEffect(() => {
    if (depositAmount > cash && cash > 0) {
      setDepositAmount(cash);
    }
  }, [cash, depositAmount]);

  // Calculate deposit rate based on key rate and bank type
  const getBankRate = (type: 'STATE_TOP' | 'REGIONAL' | 'NEOBANK') => {
    if (type === 'STATE_TOP') return keyRate - 0.02; // e.g. 10%
    if (type === 'REGIONAL') return keyRate + 0.015; // e.g. 13.5%
    return keyRate + 0.055; // e.g. 17.5%
  };

  const handleOpenDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cash < depositAmount || depositAmount <= 0) return;
    sound.playCoin();
    const bankName =
      selectedBankType === 'STATE_TOP'
        ? 'Сбер / Госбанк'
        : selectedBankType === 'REGIONAL'
        ? 'Волга-Капитал Банк'
        : 'ИнноВклад Необанк';

    const amt = depositAmount;
    onOpenDeposit({
      bankName,
      bankType: selectedBankType,
      interestRate: getBankRate(selectedBankType),
      termYears: depositTerm,
      amount: amt,
    });

    setDepositSuccessMsg(`Вклад в «${bankName}» на ${amt.toLocaleString('ru-RU')} ₽ успешно открыт!`);
    setTimeout(() => setDepositSuccessMsg(null), 4000);

    const rem = cash - amt;
    setDepositAmount(rem >= 10000 ? Math.min(100000, rem) : rem);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Subtab Segmented Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            sound.playClick();
            setSubTab('stocks');
          }}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            subTab === 'stocks'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Акции & Дивиденды</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSubTab('bonds');
          }}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            subTab === 'bonds'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Облигации (Купоны)</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSubTab('deposits');
          }}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            subTab === 'deposits'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Вклады & АСВ</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSubTab('real_estate');
          }}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            subTab === 'real_estate'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Недвижимость & Аренда</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSubTab('business_empire');
          }}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            subTab === 'business_empire'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Rocket className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Бизнес-Империя & IPO</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSubTab('crypto');
          }}
          className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            subTab === 'crypto'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Coins className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Криптовалюта</span>
        </button>
      </div>

      {/* SUBTAB 1: STOCKS */}
      {subTab === 'stocks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Рынок акций и дивидендов
              </h3>
              <p className="text-xs text-slate-500">
                Покупка доли в бизнесе: рост стоимости акций + ежегодные дивиденды на баланс
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Global Lot Size Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                <span className="text-[11px] text-slate-500 font-semibold px-1.5 hidden sm:inline">
                  Быстрый лот:
                </span>
                {[1, 10, 50, 100, 500, 1000].map((lot) => (
                  <button
                    key={lot}
                    onClick={() => {
                      sound.playClick();
                      setStockLotSize(lot);
                    }}
                    className={`px-2 py-1 rounded-lg font-bold text-xs transition-colors ${
                      stockLotSize === lot
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lot >= 1000 ? `${lot / 1000}k` : lot} шт
                  </button>
                ))}
              </div>

              <div className="text-xs text-slate-500 shrink-0">
                Баланс: <span className="font-bold text-slate-900 tabular-nums">{cash.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>

          {/* Current AI Macro News Market Impact Banner */}
          {currentNews && (
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs ${
                currentNews.cycleType === 'CRISIS' || currentNews.cycleType === 'STAGFLATION'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                  : currentNews.cycleType === 'BOOM' || currentNews.cycleType === 'TECH_RALLY'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-purple-50/70 border-purple-200 text-purple-950'
              }`}
            >
              <div className="flex items-start sm:items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-white shadow-2xs shrink-0 mt-0.5 sm:mt-0">
                  {currentNews.cycleType === 'CRISIS' || currentNews.cycleType === 'STAGFLATION' ? (
                    <Flame className="w-4 h-4 text-rose-600" />
                  ) : currentNews.cycleType === 'BOOM' || currentNews.cycleType === 'TECH_RALLY' ? (
                    <Rocket className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  )}
                </span>
                <div>
                  <span className="font-bold block sm:inline mr-2">
                    {currentNews.cycleType === 'CRISIS'
                      ? 'Рыночный спад'
                      : currentNews.cycleType === 'BOOM'
                      ? 'Рыночный бум'
                      : 'Макроэкономический фон'}
                    :
                  </span>
                  <span className="font-medium">{currentNews.headline}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold tabular-nums px-2.5 py-1 rounded-md bg-white border border-slate-200/80 shadow-2xs">
                  Влияние на акции: {currentNews.marketImpact.stockMarketMultiplier >= 1 ? '+' : ''}
                  {((currentNews.marketImpact.stockMarketMultiplier - 1) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {/* Stock Cards Grid (8 stocks) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stocks.map((stock) => {
              const priceDelta = stock.price - stock.prevPrice;
              const percentDelta = stock.prevPrice > 0 ? (priceDelta / stock.prevPrice) * 100 : 0;
              const totalValuation = stock.ownedShares * stock.price;

              const sharesEligibleForDiv =
                stock.heldSharesLastYear !== undefined
                  ? stock.heldSharesLastYear
                  : stock.ownedShares;

              const dividendEarnedPastYear = Math.round(
                sharesEligibleForDiv * stock.price * stock.dividendYield
              );
              const isNewlyBought = stock.ownedShares > 0 && sharesEligibleForDiv === 0;
              const chosenQty = Math.max(1, customStockQuantities[stock.id] ?? stockLotSize);
              const buyCost = chosenQty * stock.price;
              const maxAffordShares = Math.floor(cash / stock.price);
              const annualExpectedDiv = Math.round(stock.ownedShares * stock.price * stock.dividendYield);

              return (
                <div
                  key={stock.id}
                  className={`rounded-2xl border p-4 shadow-xs transition-all flex flex-col justify-between space-y-3 ${
                    stock.isPlayerCompany
                      ? 'border-indigo-400 bg-indigo-50/20 ring-2 ring-indigo-400/25'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* IPO / Founder Company Badge */}
                    {stock.isPlayerCompany && (
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-1.5">
                          <Rocket className="w-3.5 h-3.5 text-amber-300" />
                          <span>ВАШ БИЗНЕС НА МОСБИРЖЕ</span>
                        </div>
                        <span className="text-amber-200 font-bold">50% контрольный пакет</span>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900 leading-tight">
                            {stock.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {stock.ticker} · {stock.sector}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                          stock.risk === 'low'
                            ? 'bg-blue-50 text-blue-700'
                            : stock.risk === 'medium'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {stock.risk === 'low'
                          ? 'Низкий риск'
                          : stock.risk === 'medium'
                          ? 'Средний'
                          : 'Высокий'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div className="text-lg font-extrabold text-slate-900 tabular-nums font-heading">
                        {stock.price.toLocaleString('ru-RU')} ₽
                      </div>
                      <div
                        className={`text-xs font-bold tabular-nums flex items-center gap-0.5 ${
                          priceDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {priceDelta >= 0 ? '+' : ''}
                        {percentDelta.toFixed(1)}%
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-600">
                        <span>Дивидендная доходность:</span>
                        <span className="font-semibold text-emerald-700 tabular-nums">
                          {(stock.dividendYield * 100).toFixed(1)}% годовых
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>В вашем портфеле:</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {stock.ownedShares.toLocaleString('ru-RU')} шт. ({totalValuation.toLocaleString('ru-RU')} ₽)
                        </span>
                      </div>
                      {stock.ownedShares > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Прогноз дивидендов:</span>
                          <span className="font-bold text-emerald-700 tabular-nums">
                            +{annualExpectedDiv.toLocaleString('ru-RU')} ₽ / год
                          </span>
                        </div>
                      )}

                      {stock.ownedShares > 0 && (
                        <div className="pt-1 border-t border-slate-200/60 flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">Доход за прошлый год:</span>
                          <span
                            className={`font-bold tabular-nums ${
                              isNewlyBought
                                ? 'text-slate-400'
                                : dividendEarnedPastYear > 0
                                ? 'text-emerald-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {isNewlyBought ? (
                              <span title="Куплено в этом году, дивиденды поступят на следующий ход">
                                (куплено в этом году)
                              </span>
                            ) : dividendEarnedPastYear > 0 ? (
                              `+${dividendEarnedPastYear.toLocaleString('ru-RU')} ₽ див.`
                            ) : (
                              '0 ₽'
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Input and Multi-Share Controls */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {/* Custom Quantity Input Bar */}
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[11px] text-slate-500 font-semibold pl-1 shrink-0">
                        Кол-во:
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={1000000}
                        value={chosenQty}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setCustomStockQuantities((prev) => ({ ...prev, [stock.id]: val }));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 tabular-nums text-center"
                      />
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 10, 100, 1000].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setCustomStockQuantities((prev) => ({ ...prev, [stock.id]: q }));
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              chosenQty === q
                                ? 'bg-slate-900 text-white'
                                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {q >= 1000 ? `${q / 1000}k` : q}
                          </button>
                        ))}
                        {maxAffordShares > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setCustomStockQuantities((prev) => ({ ...prev, [stock.id]: maxAffordShares }));
                            }}
                            className="px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-[10px] font-extrabold text-emerald-800"
                            title={`Купить максимум (${maxAffordShares} шт)`}
                          >
                            MAX
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Primary Buy and Sell Buttons */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => {
                          sound.playCoin();
                          onBuyStock(stock.id, chosenQty);
                        }}
                        disabled={cash < buyCost}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                          cash >= buyCost
                            ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 shrink-0" />
                        <span>+{chosenQty} ({buyCost.toLocaleString('ru-RU')} ₽)</span>
                      </button>

                      <button
                        onClick={() => {
                          sound.playCoin();
                          onSellStock(stock.id, Math.min(stock.ownedShares, chosenQty));
                        }}
                        disabled={stock.ownedShares <= 0}
                        className={`py-2 px-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 ${
                          stock.ownedShares > 0
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer'
                            : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5 shrink-0" />
                        <span>-{Math.min(stock.ownedShares, chosenQty)} шт</span>
                      </button>
                    </div>

                    {/* Sell Presets Row */}
                    {stock.ownedShares > 0 && (
                      <div className="flex items-center justify-between gap-1 pt-1 text-[10px]">
                        <span className="text-slate-400 font-medium">Продать:</span>
                        <div className="flex items-center gap-1">
                          {stock.ownedShares >= 10 && (
                            <button
                              type="button"
                              onClick={() => {
                                sound.playCoin();
                                onSellStock(stock.id, 10);
                              }}
                              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
                            >
                              -10
                            </button>
                          )}
                          {stock.ownedShares >= 100 && (
                            <button
                              type="button"
                              onClick={() => {
                                sound.playCoin();
                                onSellStock(stock.id, 100);
                              }}
                              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700"
                            >
                              -100
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              sound.playCoin();
                              onSellStock(stock.id, Math.max(1, Math.floor(stock.ownedShares * 0.5)));
                            }}
                            className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 font-bold text-amber-800"
                          >
                            50%
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              sound.playCoin();
                              onSellStock(stock.id, stock.ownedShares);
                            }}
                            className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 font-bold text-rose-700"
                            title="Продать весь пакет акций"
                          >
                            Все ({stock.ownedShares})
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: BONDS */}
      {subTab === 'bonds' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Облигации федерального займа (ОФЗ) и Корпоративные бонды
              </h3>
              <p className="text-xs text-slate-500">
                Гарантированный фиксированный купонный доход каждый год прямо на ваш счет
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Баланс: <span className="font-bold text-slate-900 tabular-nums">{cash.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bonds.map((bond) => {
              const annualCouponPerBond = Math.round(bond.faceValue * bond.couponRate);
              const totalOwnedCost = bond.ownedCount * bond.faceValue;
              const totalAnnualCoupons = bond.ownedCount * annualCouponPerBond;

              return (
                <div
                  key={bond.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-sm sm:text-base text-slate-900 block">
                          {bond.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Номинал: {bond.faceValue.toLocaleString('ru-RU')} ₽ / шт.
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          bond.type === 'OFZ'
                            ? 'bg-emerald-50 text-emerald-800'
                            : bond.type === 'CORP'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {bond.type === 'OFZ'
                          ? 'ОФЗ (Гос)'
                          : bond.type === 'CORP'
                          ? 'Корпоративные'
                          : 'ВДО'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Купонная ставка:</span>
                        <span className="font-bold text-emerald-600 tabular-nums">
                          {(bond.couponRate * 100).toFixed(1)}% годовых
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Купон с 1 шт.:</span>
                        <span className="font-semibold text-slate-800 tabular-nums">
                          +{annualCouponPerBond} ₽ / год
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">В портфеле:</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {bond.ownedCount} шт. ({totalOwnedCost.toLocaleString('ru-RU')} ₽)
                        </span>
                      </div>
                      {bond.ownedCount > 0 && (
                        <div className="pt-1.5 border-t border-slate-200 flex justify-between">
                          <span className="text-slate-500">Ежегодный купонный доход:</span>
                          <span className="font-bold text-emerald-700 tabular-nums">
                            +{totalAnnualCoupons.toLocaleString('ru-RU')} ₽ / год
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 italic leading-relaxed">
                      {bond.riskText}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 mt-4">
                    <button
                      onClick={() => {
                        sound.playCoin();
                        onBuyBond(bond.id, 10);
                      }}
                      disabled={cash < bond.faceValue * 10}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                        cash >= bond.faceValue * 10
                          ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Купить 10 шт ({(bond.faceValue * 10).toLocaleString('ru-RU')} ₽)
                    </button>

                    <button
                      onClick={() => {
                        sound.playCoin();
                        onSellBond(bond.id, 10);
                      }}
                      disabled={bond.ownedCount < 10}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                        bond.ownedCount >= 10
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer'
                          : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      Продать 10 шт
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: DEPOSITS */}
      {subTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Банковские вклады с государственной страховкой АСВ
              </h3>
              <p className="text-xs text-slate-500">
                Фиксированная доходность, привязанная к ключевой ставке ЦБ. Государство страхует до 1.4 млн ₽.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Баланс: <span className="font-bold text-slate-900 tabular-nums">{cash.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          {depositSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{depositSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['STATE_TOP', 'REGIONAL', 'NEOBANK'] as const).map((type) => {
              const rate = getBankRate(type);
              const title =
                type === 'STATE_TOP'
                  ? 'Сбер / Госбанк'
                  : type === 'REGIONAL'
                  ? 'Волга-Капитал Банк'
                  : 'ИнноВклад Необанк';
              const badge =
                type === 'STATE_TOP'
                  ? 'Высшая надежность'
                  : type === 'REGIONAL'
                  ? 'Средний банк'
                  : 'Финтех-необанк';

              return (
                <div
                  key={type}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    selectedBankType === type
                      ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm sm:text-base text-slate-900">{title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {badge}
                      </span>
                    </div>

                    <div className="text-2xl font-extrabold text-emerald-700 tabular-nums font-heading">
                      {(rate * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {type === 'STATE_TOP'
                        ? 'Ставка на 2% ниже ключевой ЦБ. Абсолютная надежность.'
                        : type === 'REGIONAL'
                        ? 'Премия +1.5% к ставке ЦБ. Полная страховка АСВ до 1.4 млн ₽.'
                        : 'Максимальный процент (+5.5% к ставке ЦБ). Финтех-партнер.'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      sound.playClick();
                      setSelectedBankType(type);
                    }}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold transition-colors ${
                      selectedBankType === type
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {selectedBankType === type ? '✓ Выбран банк' : 'Выбрать этот банк'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Open Deposit Form */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900">
              Открыть новый вклад в выбранном банке
            </h4>

            <form onSubmit={handleOpenDepositSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 block">
                    Сумма вклада (₽):
                  </label>
                  <input
                    type="number"
                    min={10000}
                    max={cash}
                    step={10000}
                    value={depositAmount || ''}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-bold tabular-nums"
                  />

                  {/* Percentage Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {[0.25, 0.5, 0.75, 1].map((pct) => {
                      const calculated = Math.floor((cash * pct) / 10000) * 10000;
                      return (
                        <button
                          key={pct}
                          type="button"
                          disabled={cash < 10000}
                          onClick={() => setDepositAmount(Math.max(10000, calculated))}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors"
                        >
                          {pct * 100}% ({calculated.toLocaleString('ru-RU')} ₽)
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-slate-700 block">Срок вклада:</label>
                  <select
                    value={depositTerm}
                    onChange={(e) => setDepositTerm(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold"
                  >
                    <option value={1}>1 год (быстрая ликвидность)</option>
                    <option value={2}>2 года (оптимальная ставка)</option>
                    <option value={3}>3 года (фиксация высокой ставки)</option>
                  </select>
                  <p className="text-[11px] text-slate-400">
                    Досрочное закрытие возможно в любой момент, но проценты за текущий период сгорят.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={cash < depositAmount || depositAmount < 10000}
                  className={`py-3 px-6 rounded-xl font-bold text-xs sm:text-sm transition-colors ${
                    cash >= depositAmount && depositAmount >= 10000
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Открыть вклад на {depositAmount.toLocaleString('ru-RU')} ₽
                </button>
              </div>
            </form>
          </div>

          {/* Active Deposits List */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Ваши действующие вклады
            </h4>
            {deposits.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
                У вас пока нет открытых банковских вкладов.
              </div>
            ) : (
              <div className="space-y-3">
                {deposits.map((dep) => {
                  const yearsPassed = year - dep.startYear;
                  const yearsRemaining = Math.max(0, dep.termYears - yearsPassed);

                  return (
                    <div
                      key={dep.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{dep.bankName}</span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            {(dep.interestRate * 100).toFixed(1)}% годовых
                          </span>
                        </div>
                        <div className="text-slate-500 mt-1">
                          Начальная сумма: {dep.principal.toLocaleString('ru-RU')} ₽ ·
                          Осталось: {yearsRemaining} {yearsRemaining === 1 ? 'год' : 'года/лет'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">Текущий баланс</span>
                          <span className="font-bold text-slate-900 tabular-nums text-sm">
                            {Math.round(dep.currentAmount).toLocaleString('ru-RU')} ₽
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm('При досрочном закрытии начисленные проценты сгорят. Закрыть вклад?')) {
                              sound.playWarning();
                              onCloseDepositEarly(dep.id);
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl font-semibold text-xs transition-colors"
                        >
                          Закрыть досрочно
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: REAL ESTATE MARKET (НОВАЯ ГЛУБОКАЯ МЕХАНИКА) */}
      {subTab === 'real_estate' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Рынок жилой и коммерческой недвижимости
              </h3>
              <p className="text-xs text-slate-500">
                Капитальные активы с ежегодным чистым арендным доходом, защитой от инфляции и возможностью ремонта
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Баланс: <span className="font-bold text-slate-900 tabular-nums">{cash.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          {/* Real Estate Market Banner */}
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 text-teal-950">
              <span className="p-2 rounded-xl bg-white shadow-2xs text-teal-700 shrink-0">
                <Home className="w-5 h-5" />
              </span>
              <div>
                <strong className="block text-sm">Пассивный доход от аренды и капитализация</strong>
                <span className="text-teal-800">
                  Покупка любой жилой квартиры автоматически закрывает потребность в аренде и снижает обязательный платеж!
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-bold px-3 py-1 bg-white rounded-lg border border-teal-200 text-teal-800">
                Инфляция недвижимости: +{(inflationRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Real Estate Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {realEstate.map((property) => {
              const priceDelta = property.currentPrice - property.prevPrice;
              const percentDelta =
                property.prevPrice > 0 ? (priceDelta / property.prevPrice) * 100 : 0;
              const effectiveRent = property.isRenovated
                ? Math.round(property.annualRentIncome * 1.3)
                : property.annualRentIncome;
              const netAnnualYield = (effectiveRent / property.currentPrice) * 100;

              return (
                <div
                  key={property.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                    property.ownedCount > 0
                      ? 'border-teal-400 bg-teal-50/20'
                      : 'border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-base text-slate-900 block leading-tight">
                          {property.name}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {property.district} · {property.areaSqM} м²
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                        {property.categoryLabel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {property.description}
                    </p>

                    {/* Pricing and Yield Box */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-500">Рыночная цена:</span>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 tabular-nums text-sm">
                            {property.currentPrice.toLocaleString('ru-RU')} ₽
                          </span>
                          <span
                            className={`text-[10px] ml-1.5 font-bold ${
                              priceDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {priceDelta >= 0 ? '+' : ''}
                            {percentDelta.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Арендный доход:</span>
                        <span className="font-bold text-emerald-700 tabular-nums">
                          +{effectiveRent.toLocaleString('ru-RU')} ₽ / год ({netAnnualYield.toFixed(1)}%)
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Обслуживание и налог:</span>
                        <span className="font-medium text-slate-700 tabular-nums">
                          -{property.annualMaintenance.toLocaleString('ru-RU')} ₽ / год
                        </span>
                      </div>

                      <div className="flex justify-between pt-1 border-t border-slate-200">
                        <span className="text-slate-500">В вашей собственности:</span>
                        <span className="font-bold text-slate-900 tabular-nums">
                          {property.ownedCount} шт.
                        </span>
                      </div>

                      {property.isRenovated && (
                        <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Сделан дизайнерский ремонт (+30% к аренде)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions (Buy, Renovate, Sell) */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 mt-3">
                    <button
                      onClick={() => {
                        sound.playJoy();
                        onBuyRealEstate(property.id);
                      }}
                      disabled={cash < property.currentPrice}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-colors ${
                        cash >= property.currentPrice
                          ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Купить объект за {property.currentPrice.toLocaleString('ru-RU')} ₽
                    </button>

                    {property.ownedCount > 0 && !property.isRenovated && (
                      <button
                        onClick={() => {
                          sound.playJoy();
                          onRenovateRealEstate(property.id);
                        }}
                        disabled={cash < property.renovationCost}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                          cash >= property.renovationCost
                            ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                            : 'bg-amber-50 text-amber-300 cursor-not-allowed'
                        }`}
                      >
                        <Paintbrush className="w-3.5 h-3.5" />
                        <span>Сделать ремонт ({property.renovationCost.toLocaleString('ru-RU')} ₽)</span>
                      </button>
                    )}

                    {property.ownedCount > 0 && (
                      <button
                        onClick={() => {
                          sound.playCoin();
                          onSellRealEstate(property.id);
                        }}
                        className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                      >
                        Продать 1 объект (+{property.currentPrice.toLocaleString('ru-RU')} ₽)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 5: BUSINESS EMPIRE & IPO (НОВАЯ МЕХАНИКА МАСШТАБИРОВАНИЯ И ВЫХОДА НА БИРЖУ) */}
      {subTab === 'business_empire' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Развитие собственной Бизнес-Империи и выход на IPO
              </h3>
              <p className="text-xs text-slate-500">
                Создавайте компании с нуля, масштабируйте до федерального уровня и размещайте акции на Мосбирже!
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Баланс: <span className="font-bold text-slate-900 tabular-nums">{cash.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {businessEmpires.map((biz) => {
              const currentLevelName = biz.levelNames[biz.level] || 'Не открыт';
              const nextLevel = biz.level + 1;
              const isNextIpo = nextLevel >= biz.maxLevel;
              const canAffordUpgrade = cash >= biz.upgradeCost;

              return (
                <div
                  key={biz.id}
                  className={`bg-white rounded-3xl border p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                    biz.owned
                      ? 'border-indigo-300 bg-indigo-50/15 ring-1 ring-indigo-200'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-bold text-lg text-slate-900 block font-heading">
                          {biz.name}
                        </span>
                        <span className="text-xs text-indigo-700 font-semibold block">
                          {biz.sector}
                        </span>
                      </div>

                      {biz.isIpo ? (
                        <span className="px-3 py-1 bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-xs animate-pulse flex items-center gap-1">
                          <Rocket className="w-3.5 h-3.5" />
                          <span>IPO LISTED</span>
                        </span>
                      ) : biz.owned ? (
                        <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 font-bold text-xs rounded-xl">
                          Уровень {biz.level} из {biz.maxLevel}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-xs rounded-xl">
                          Не куплен
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {biz.description}
                    </p>

                    {/* Progress Bar through 5 Levels */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                        <span>Текущий статус:</span>
                        <span className="text-indigo-900 font-bold">{currentLevelName}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <div
                            key={lvl}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              biz.level >= lvl
                                ? lvl === 5
                                  ? 'bg-emerald-500'
                                  : 'bg-indigo-600'
                                : 'bg-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Financial stats of company */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Оценка стоимости бизнеса:</span>
                        <span className="font-extrabold text-slate-900 tabular-nums text-sm">
                          {biz.currentValuation.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Ежегодная чистая прибыль:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-600 tabular-nums text-sm">
                            +{biz.annualProfit.toLocaleString('ru-RU')} ₽ / год
                          </span>
                          {biz.lastProfitMultiplier && biz.lastProfitMultiplier !== 1 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700">
                              {biz.lastProfitMultiplier > 1 ? '+' : ''}{((biz.lastProfitMultiplier - 1) * 100).toFixed(0)}% к тренду
                            </span>
                          )}
                        </div>
                      </div>

                      {biz.isIpo && (
                        <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-emerald-800">
                          <span className="font-semibold">Дивидендный поток после IPO:</span>
                          <span className="font-extrabold tabular-nums">
                            +{Math.round(biz.currentValuation * (biz.dividendYield || 0.25)).toLocaleString('ru-RU')} ₽ / год
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upgrade and IPO Actions */}
                  <div>
                    {!biz.owned ? (
                      <button
                        onClick={() => {
                          sound.playJoy();
                          onStartBusinessEmpire(biz.id);
                        }}
                        disabled={cash < biz.baseCost}
                        className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                          cash >= biz.baseCost
                            ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer hover:shadow-md'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Основать бизнес ({biz.baseCost.toLocaleString('ru-RU')} ₽)
                      </button>
                    ) : biz.level < biz.maxLevel ? (
                      <button
                        onClick={() => {
                          sound.playJoy();
                          onUpgradeBusinessEmpire(biz.id);
                        }}
                        disabled={!canAffordUpgrade}
                        className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
                          isNextIpo
                            ? canAffordUpgrade
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer shadow-lg'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : canAffordUpgrade
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:shadow-md'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isNextIpo ? (
                          <>
                            <Rocket className="w-4 h-4" />
                            <span>
                              ВЫЙТИ НА IPO НА МОСБИРЖЕ! (Инвестиции: {biz.upgradeCost.toLocaleString('ru-RU')} ₽)
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-4 h-4" />
                            <span>
                              Масштабировать до Уровня {nextLevel} ({biz.upgradeCost.toLocaleString('ru-RU')} ₽)
                            </span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-full py-2.5 px-4 bg-emerald-50 border border-emerald-300 text-emerald-900 font-extrabold text-xs sm:text-sm rounded-xl text-center flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Rocket className="w-4 h-4 text-emerald-600" />
                            <span>Акции обращаются на Мосбирже ({biz.stockTicker})</span>
                          </div>
                          <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded font-mono font-bold">
                            MOEX LISTED
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setSubTab('stocks');
                          }}
                          className="w-full py-2 px-3 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>Торговать акциями компании на бирже →</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 6: CRYPTO (С ОПТОВОЙ ПОКУПКОЙ И ПРОДАЖЕЙ БОЛЬШИМИ ОБЪЕМАМИ) */}
      {subTab === 'crypto' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Криптовалютный рынок
              </h3>
              <p className="text-xs text-slate-500">
                4-летний цикл халвинга: бычий бум, коррекция, накопление и ралли
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Баланс: <span className="font-bold text-slate-900 tabular-nums">{cash.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          {/* 4-Year Halving Cycle Indicator Banner */}
          {(() => {
            const halvingPhase = year % 4;
            const halvingInfo =
              halvingPhase === 1
                ? {
                    title: 'Фаза 1: Пост-халвинг и Бычий Забег 🚀',
                    desc: 'Рекордный приток ликвидности и внимания. Исторически самая прибыльная фаза цикла для криптоактивов!',
                    badge: 'Бычий цикл',
                    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                  }
                : halvingPhase === 2
                ? {
                    title: 'Фаза 2: Медвежий рынок и Коррекция 📉',
                    desc: 'Период фиксации прибыли и охлаждения рынка. Цены ищут локальное дно.',
                    badge: 'Коррекция',
                    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
                  }
                : halvingPhase === 3
                ? {
                    title: 'Фаза 3: Криптозима и Донное Накопление ❄️',
                    desc: 'Низкая волатильность и консолидация на дне. Идеальное время для постепенной покупки активов с дисконтом.',
                    badge: 'Накопление',
                    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
                  }
                : {
                    title: 'Фаза 4: Ралли накануне Халвинга ⚡',
                    desc: 'Рынок закладывает в цены будущее сокращение эмиссии. Растущий тренд и оптимизм инвесторов.',
                    badge: 'Ожидание халвинга',
                    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
                  };

            return (
              <div className="p-4 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start sm:items-center gap-3">
                  <span className="p-2 rounded-xl bg-white shadow-2xs text-purple-700 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-slate-900">{halvingInfo.title}</strong>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${halvingInfo.badgeClass}`}>
                        {halvingInfo.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{halvingInfo.desc}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-semibold text-purple-900 bg-white px-3 py-1.5 rounded-xl border border-purple-200">
                    Цикл: Год {(year % 4) + 1} из 4
                  </span>
                </div>
              </div>
            );
          })()}

          {currentNews && (
            <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 text-purple-950">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  <strong>ИИ-макрофон для крипты:</strong> {currentNews.headline}
                </span>
              </div>
              <span
                className={`font-bold tabular-nums px-2.5 py-0.5 rounded-md bg-white border shrink-0 ${
                  currentNews.marketImpact.cryptoMultiplier >= 1
                    ? 'border-purple-200 text-purple-700'
                    : 'border-rose-200 text-rose-700'
                }`}
              >
                Влияние новости: {currentNews.marketImpact.cryptoMultiplier >= 1 ? '+' : ''}
                {((currentNews.marketImpact.cryptoMultiplier - 1) * 100).toFixed(0)}%
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {crypto.map((coin) => {
              const priceDelta = coin.price - coin.prevPrice;
              const percentDelta = coin.prevPrice > 0 ? (priceDelta / coin.prevPrice) * 100 : 0;
              const totalValRub = Math.round(coin.ownedAmount * coin.price);

              const currentBuyInput = cryptoTradeAmounts[coin.id] || 100000;
              const currentSellInput = cryptoSellAmounts[coin.id] || Math.min(100000, totalValRub);

              return (
                <div
                  key={coin.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900">{coin.name}</span>
                        <span className="text-xs text-slate-400 font-mono">({coin.symbol})</span>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-slate-900 tabular-nums">
                          {coin.price.toLocaleString('ru-RU')} ₽
                        </div>
                        <div
                          className={`text-xs font-semibold tabular-nums ${
                            priceDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {priceDelta >= 0 ? '+' : ''}
                          {percentDelta.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 my-3 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">На балансе монет:</span>
                        <span className="font-bold text-slate-800 tabular-nums">
                          {coin.ownedAmount.toFixed(4)} {coin.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Эквивалент в рублях:</span>
                        <span className="font-bold text-purple-700 tabular-nums">
                          {totalValRub.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </div>

                    {/* Bulk Buy Console */}
                    <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 space-y-2 text-xs mb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-950">Покупка ({coin.symbol}):</span>
                        <span className="text-[11px] text-slate-500">
                          Сумма в рублях
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1000}
                          max={cash}
                          step={10000}
                          value={currentBuyInput}
                          onChange={(e) =>
                            setCryptoTradeAmounts((prev) => ({
                              ...prev,
                              [coin.id]: Number(e.target.value),
                            }))
                          }
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold tabular-nums"
                        />
                        <button
                          onClick={() => {
                            sound.playCoin();
                            onBuyCrypto(coin.id, currentBuyInput);
                          }}
                          disabled={cash < currentBuyInput || currentBuyInput <= 0}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            cash >= currentBuyInput && currentBuyInput > 0
                              ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          Купить
                        </button>
                      </div>

                      {/* Buy Quick Buttons */}
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {[100000, 500000, 1000000, 5000000].map((amt) => {
                          if (cash < amt) return null;
                          return (
                            <button
                              key={amt}
                              onClick={() => {
                                sound.playCoin();
                                onBuyCrypto(coin.id, amt);
                              }}
                              className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-[11px] font-semibold text-purple-900 hover:bg-purple-100"
                            >
                              +{amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}k`} ₽
                            </button>
                          );
                        })}
                        {cash > 0 && (
                          <button
                            onClick={() => {
                              sound.playCoin();
                              onBuyCrypto(coin.id, cash);
                            }}
                            className="px-2 py-0.5 rounded-md bg-purple-100 border border-purple-300 text-[11px] font-bold text-purple-900 hover:bg-purple-200"
                          >
                            Всё (MAX: {cash.toLocaleString('ru-RU')} ₽)
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bulk Sell Console */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Продажа ({coin.symbol}):</span>
                        <span className="text-[11px] text-slate-500">
                          В портфеле: {totalValRub.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {[0.25, 0.5, 0.75, 1].map((pct) => {
                          const amt = Math.round(totalValRub * pct);
                          return (
                            <button
                              key={pct}
                              onClick={() => {
                                sound.playCoin();
                                onSellCrypto(coin.id, amt);
                              }}
                              disabled={totalValRub <= 0}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                                totalValRub > 0
                                  ? 'bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer'
                                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              }`}
                            >
                              {pct === 1 ? 'Продать 100%' : `${pct * 100}%`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
