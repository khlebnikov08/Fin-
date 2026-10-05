// Mandatory Expenses and Tax Calculator

export interface MandatoryExpensesBreakdown {
  total: number;
  incomeTax: number;       // Подоходный налог (НДФЛ 13% с зарплаты)
  businessTax: number;     // Налог на доход бизнеса / аренду (6% УСН)
  propertyTax: number;     // Налог на имущество физлиц (квартира)
  transportTax: number;    // Транспортный налог (автомобиль)
  livingCosts: number;     // Базовое питание, быт, одежда, коммуналка
  housingCosts: number;    // Аренда или обслуживание собственного жилья
  transportCosts: number;  // Расходы на автомобиль (бензин, ТО) или транспорт
  cardFees: number;        // Обслуживание банковских карт
}

export function calculateMandatoryExpensesBreakdown(params: {
  annualSalary: number;
  businessIncome?: number;
  rentIncome?: number;
  baseLivingFloor: number;
  hasApartment: boolean;
  hasCar: boolean;
  debitCardActive: boolean;
  inflationMultiplier: number;
  investmentPropertiesCount?: number;
  propertyTotalValuation?: number;
}): MandatoryExpensesBreakdown {
  const {
    annualSalary,
    businessIncome = 0,
    rentIncome = 0,
    baseLivingFloor,
    hasApartment,
    hasCar,
    debitCardActive,
    inflationMultiplier,
    investmentPropertiesCount = 0,
    propertyTotalValuation = 0,
  } = params;

  // 1. Income Tax (НДФЛ 13% в РФ; прогрессивная шкала 15% свыше 5 млн)
  let incomeTax = 0;
  if (annualSalary <= 5000000) {
    incomeTax = Math.round(annualSalary * 0.13);
  } else {
    incomeTax = Math.round(5000000 * 0.13 + (annualSalary - 5000000) * 0.15);
  }

  // 2. Business / Rental Tax (УСН 6%-8% для малого бизнеса, ОСНО 15% для крупного холдинга)
  const totalCommercialIncome = businessIncome + rentIncome;
  let businessTax = 0;
  if (totalCommercialIncome <= 50000000) {
    businessTax = Math.round(totalCommercialIncome * 0.06);
  } else if (totalCommercialIncome <= 200000000) {
    businessTax = Math.round(50000000 * 0.06 + (totalCommercialIncome - 50000000) * 0.08);
  } else {
    businessTax = Math.round(
      50000000 * 0.06 + 150000000 * 0.08 + (totalCommercialIncome - 200000000) * 0.15
    );
  }

  // 3. Property Tax (Налог на имущество: 0.15% от кадастровой стоимости недвижимости)
  let propertyTax = 0;
  if (propertyTotalValuation > 0) {
    propertyTax = Math.round(propertyTotalValuation * 0.0015);
  } else {
    const baseApartmentTax = hasApartment ? 18000 : 0;
    const investmentTax = investmentPropertiesCount * 22000;
    propertyTax = Math.round((baseApartmentTax + investmentTax) * inflationMultiplier);
  }

  // 4. Transport Tax (Транспортный налог: начисляется при наличии автомобиля)
  const transportTax = hasCar ? Math.round(24000 * Math.min(3, inflationMultiplier)) : 0;

  // 5. Base living costs (food, household, clothing, health routines)
  // Indexed to inflation + realistic lifestyle scaling with career growth (+3% of salary)
  const livingCosts = Math.round(
    (baseLivingFloor * inflationMultiplier) + (annualSalary * 0.03)
  );

  // 6. Housing costs
  // If player owns an apartment: rent is 0, only maintenance / utilities (~50k indexed)
  // If renting: market rent ~280k indexed
  const housingCosts = hasApartment
    ? Math.round(55000 * inflationMultiplier)
    : Math.round(300000 * inflationMultiplier);

  // 7. Transport operating costs
  // If player owns a car: gas + maintenance ~120k indexed
  // If public transit: ~45k indexed
  const transportCosts = hasCar
    ? Math.round(130000 * inflationMultiplier)
    : Math.round(45000 * inflationMultiplier);

  // 8. Banking card annual fees
  const cardFees = debitCardActive ? 1500 : 0;

  const total =
    incomeTax +
    businessTax +
    propertyTax +
    transportTax +
    livingCosts +
    housingCosts +
    transportCosts +
    cardFees;

  return {
    total,
    incomeTax,
    businessTax,
    propertyTax,
    transportTax,
    livingCosts,
    housingCosts,
    transportCosts,
    cardFees,
  };
}
