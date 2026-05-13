/**
 * Calculation logic for commissions and bonuses as per business rules.
 */

export interface CommissionResult {
  baseCommission: number;
  volumeBonusPercent: number;
  valueBonus: number;
  total: number;
}

export function calculateCommission(value: number, contractsCount: number): CommissionResult {
  // 1. Base Commission Logic
  // R$300 a R$1.000 = 10%
  // R$1.001 a R$3.000 = 15%
  // R$3.001 a R$7.000 = 20%
  // Acima de R$7.000 = 25%
  
  let baseRate = 0;
  if (value >= 300 && value <= 1000) baseRate = 0.10;
  else if (value > 1000 && value <= 3000) baseRate = 0.15;
  else if (value > 3000 && value <= 7000) baseRate = 0.20;
  else if (value > 7000) baseRate = 0.25;

  const baseCommission = value * baseRate;

  // 2. Volume Bonus
  // 5 contratos = +2%
  // 10 contratos = +5%
  // 20 contratos = +8%
  let volumeBonusPercent = 0;
  if (contractsCount >= 20) volumeBonusPercent = 0.08;
  else if (contractsCount >= 10) volumeBonusPercent = 0.05;
  else if (contractsCount >= 5) volumeBonusPercent = 0.02;

  // 3. Large Client Bonus
  // > R$10.000 = +R$500
  // > R$20.000 = +R$1.000
  let valueBonus = 0;
  if (value > 20000) valueBonus = 1000;
  else if (value > 10000) valueBonus = 500;

  // Total calculation: base + (value * volume bonus) + fixed bonus
  const total = baseCommission + (value * volumeBonusPercent) + valueBonus;

  return {
    baseCommission,
    volumeBonusPercent,
    valueBonus,
    total
  };
}
