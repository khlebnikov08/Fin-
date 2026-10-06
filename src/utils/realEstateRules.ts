import type { RealEstateProperty } from '../types/game';

const BASE_MAX_GROSS_YIELD: Record<RealEstateProperty['category'], number> = {
  STUDIO: 0.09,
  APARTMENT: 0.09,
  BUSINESS_CLASS: 0.09,
  PREMIUM: 0.09,
  COMMERCIAL: 0.10,
  WAREHOUSE: 0.10,
};

/** Renovation raises rent once; it does not compound on top of stored rent. */
export function getEffectiveAnnualRent(property: RealEstateProperty): number {
  const renovationMultiplier = property.isRenovated ? 1.3 : 1;
  const requestedRent = Math.max(0, property.annualRentIncome * renovationMultiplier);
  const yieldLimit = BASE_MAX_GROSS_YIELD[property.category] + (property.isRenovated ? 0.01 : 0);
  const maximumRent = Math.max(0, property.currentPrice * yieldLimit);
  return Math.round(Math.min(requestedRent, maximumRent));
}

export function getNetAnnualRent(property: RealEstateProperty): number {
  return Math.max(0, getEffectiveAnnualRent(property) - property.annualMaintenance) * property.ownedCount;
}

/** Rent grows more slowly than high inflation and remains bounded by the asset's value. */
export function updateRealEstateForYear(
  property: RealEstateProperty,
  nextPrice: number,
  inflationRate: number
): RealEstateProperty {
  const rentIndexation = Math.max(0, Math.min(0.06, inflationRate * 0.45));
  const maintenanceIndexation = Math.max(0, Math.min(0.08, inflationRate * 0.65));

  return {
    ...property,
    prevPrice: property.currentPrice,
    currentPrice: nextPrice,
    annualRentIncome: Math.round(property.annualRentIncome * (1 + rentIndexation)),
    annualMaintenance: Math.round(property.annualMaintenance * (1 + maintenanceIndexation)),
  };
}

/** Converts legacy saves where renovation was already baked into stored rent. */
export function normalizeLegacyRenovatedRent(property: RealEstateProperty): RealEstateProperty {
  if (!property.isRenovated) return property;
  return {
    ...property,
    annualRentIncome: Math.round(property.annualRentIncome / 1.3),
  };
}
