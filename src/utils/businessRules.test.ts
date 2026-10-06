import assert from 'node:assert/strict';
import test from 'node:test';
import type { BusinessEmpire, StockAsset } from '../types/game';
import {
  getBusinessCatalogForEdition,
  migrateLegacyBusinessPortfolio,
  processStandardBusinessYear,
} from './businessRules';

const business = (overrides: Partial<BusinessEmpire> = {}): BusinessEmpire => ({
  id: 'biz_test',
  name: 'Тестовый бизнес',
  sector: 'Потребительский ритейл',
  description: '',
  baseCost: 1_000_000,
  currentValuation: 1_000_000,
  annualProfit: 100_000,
  level: 1,
  maxLevel: 5,
  upgradeCost: 500_000,
  owned: true,
  isIpo: false,
  dividendYield: 0.2,
  levelNames: ['Не открыт', 'Старт', 'Сеть', 'Федеральный', 'IPO'],
  ...overrides,
});

const stock = (overrides: Partial<StockAsset> = {}): StockAsset => ({
  id: 'stock_biz_test',
  name: 'Тестовая компания',
  ticker: 'TEST',
  sector: 'Тест',
  description: '',
  price: 100,
  prevPrice: 100,
  dividendYield: 0.2,
  risk: 'medium',
  ownedShares: 70,
  heldSharesLastYear: 70,
  history: [100],
  isPlayerCompany: true,
  companyEmpireId: 'biz_test',
  ...overrides,
});

test('standard business catalog removes the IPO level and lowers initial profits; Yandex catalog stays unchanged', () => {
  const catalog = [business({ annualProfit: 100_000 })];
  const standard = getBusinessCatalogForEdition(catalog, false)[0];
  const yandex = getBusinessCatalogForEdition(catalog, true)[0];

  assert.equal(standard.maxLevel, 4);
  assert.equal(standard.annualProfit, 65_000);
  assert.equal(standard.dividendYield, 0);
  assert.equal(yandex.maxLevel, 5);
  assert.equal(yandex.annualProfit, 100_000);
  assert.equal(yandex.dividendYield, 0.2);
});

test('a legacy IPO stake is converted to a private business asset without losing its marked value', () => {
  const legacyBusiness = business({ level: 5, maxLevel: 5, isIpo: true, annualProfit: 2_000_000 });
  const catalog = getBusinessCatalogForEdition([business()], false);
  const migrated = migrateLegacyBusinessPortfolio([legacyBusiness], [stock()], catalog);

  assert.equal(migrated.retiredIpoCount, 1);
  assert.equal(migrated.stocks.length, 0);
  assert.equal(migrated.businesses[0].isIpo, false);
  assert.equal(migrated.businesses[0].level, 4);
  assert.equal(migrated.businesses[0].currentValuation, 7_000);
  assert.equal(migrated.businesses[0].annualProfit, 700);
});

test('a fire stops profit for its incident year and the following recovery year, then expires', () => {
  const firstYear = processStandardBusinessYear(
    [business()],
    { businessMultiplier: 1, keyRate: 0.12 },
    () => 0
  );
  assert.equal(firstYear.operatingProfit, 0);
  assert.equal(firstYear.businesses[0].activeDisruption?.id, 'fire');
  assert.equal(firstYear.businesses[0].activeDisruption?.yearsRemaining, 1);
  assert.match(firstYear.incidentSummaries[0], /Пожар/);

  const recoveryYear = processStandardBusinessYear(
    firstYear.businesses,
    { businessMultiplier: 1, keyRate: 0.12 },
    () => {
      throw new Error('An active disruption must not trigger a second incident.');
    }
  );
  assert.equal(recoveryYear.operatingProfit, 0);
  assert.equal(recoveryYear.businesses[0].activeDisruption, undefined);
  assert.match(recoveryYear.incidentSummaries[0], /последний год восстановления/);

  const normalYear = processStandardBusinessYear(
    recoveryYear.businesses,
    { businessMultiplier: 1, keyRate: 0.12 },
    () => 0.99
  );
  assert.equal(normalYear.operatingProfit, 100_000);
  assert.equal(normalYear.incidentSummaries.length, 0);
  assert.equal(normalYear.businesses[0].currentValuation, 1_000_000);
});
