import assert from 'node:assert/strict';
import test from 'node:test';
import type { StockAsset } from '../types/game';
import {
  maxAffordableStockShares,
  quoteStockTrade,
  rollStockMarketCatalyst,
} from './marketRules';

const stock = (overrides: Partial<StockAsset> = {}): StockAsset => ({
  id: 'stock_test',
  name: 'Test stock',
  ticker: 'TEST',
  sector: 'Технологии & ИИ',
  description: '',
  price: 1_000,
  prevPrice: 1_000,
  dividendYield: 0.04,
  risk: 'high',
  ownedShares: 0,
  history: [1_000],
  ...overrides,
});

test('large share purchases pay a higher average execution price and move the quote upward', () => {
  const quote = quoteStockTrade(stock(), 200_000, 'BUY');
  assert.ok(quote.averageExecutionPrice > quote.referencePrice);
  assert.ok(quote.totalValue > quote.referencePrice * quote.shares);
  assert.ok(quote.marketImpact > 0);
  assert.ok(quote.nextMarketPrice > quote.referencePrice);
});

test('large sales move the quote down and execute below the reference price', () => {
  const quote = quoteStockTrade(stock(), 200_000, 'SELL');
  assert.ok(quote.averageExecutionPrice < quote.referencePrice);
  assert.ok(quote.marketImpact < 0);
  assert.ok(quote.nextMarketPrice < quote.referencePrice);
});

test('maximum affordable quantity accounts for market impact', () => {
  const testStock = stock({ risk: 'medium', price: 1_000 });
  const cash = 100_000;
  const shares = maxAffordableStockShares(testStock, cash);

  assert.ok(shares > 0);
  assert.ok(quoteStockTrade(testStock, shares, 'BUY').totalValue <= cash);
  assert.ok(quoteStockTrade(testStock, shares + 1, 'BUY').totalValue > cash);
});

test('issuer-specific events are independent of macro news and can skip a year', () => {
  const event = rollStockMarketCatalyst([stock()], () => 0);
  assert.ok(event);
  assert.equal(event.stockId, 'stock_test');
  assert.equal(event.priceImpact, 0.12);
  assert.equal(rollStockMarketCatalyst([stock()], () => 0.9), null);
});

test('player-created companies do not receive ordinary public-market catalysts', () => {
  const playerCompany = stock({ isPlayerCompany: true });
  assert.equal(rollStockMarketCatalyst([playerCompany], () => 0), null);
});
