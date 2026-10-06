import assert from 'node:assert/strict';
import test from 'node:test';
import type { RealEstateProperty } from '../types/game';
import {
  getEffectiveAnnualRent,
  getNetAnnualRent,
  normalizeLegacyRenovatedRent,
  updateRealEstateForYear,
} from './realEstateRules';

const property = (overrides: Partial<RealEstateProperty> = {}): RealEstateProperty => ({
  id: 'property_test',
  name: 'Тестовая квартира',
  category: 'APARTMENT',
  categoryLabel: 'Квартира',
  areaSqM: 50,
  district: 'Центр',
  basePrice: 10_000_000,
  currentPrice: 10_000_000,
  prevPrice: 10_000_000,
  annualRentIncome: 1_200_000,
  annualMaintenance: 100_000,
  ownedCount: 2,
  isRenovated: false,
  renovationCost: 500_000,
  description: '',
  ...overrides,
});

test('rent yield is capped by market value and category', () => {
  assert.equal(getEffectiveAnnualRent(property()), 900_000);
  assert.equal(
    getEffectiveAnnualRent(property({ category: 'COMMERCIAL', annualRentIncome: 1_500_000 })),
    1_000_000
  );
});

test('renovation applies its rent bonus once and has a modestly higher yield ceiling', () => {
  const renovated = property({ isRenovated: true, annualRentIncome: 800_000 });
  assert.equal(getEffectiveAnnualRent(renovated), 1_000_000);
  assert.equal(getNetAnnualRent(renovated), 1_800_000);
});

test('high inflation cannot make rent grow faster than the balanced indexation limit', () => {
  const updated = updateRealEstateForYear(property({ annualRentIncome: 800_000 }), 10_500_000, 0.165);
  assert.equal(updated.annualRentIncome, 848_000);
  assert.equal(updated.annualMaintenance, 108_000);
  assert.equal(updated.prevPrice, 10_000_000);
  assert.equal(updated.currentPrice, 10_500_000);
});

test('legacy renovated rents are normalized before using the single renovation bonus', () => {
  const legacy = property({ isRenovated: true, annualRentIncome: 1_040_000 });
  const normalized = normalizeLegacyRenovatedRent(legacy);
  assert.equal(normalized.annualRentIncome, 800_000);
  assert.equal(getEffectiveAnnualRent(normalized), 1_000_000);
});
