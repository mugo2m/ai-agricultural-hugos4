// lib/cashFlowCalculator.ts
// Calculate monthly cash flow projections based on planting and harvest dates

import { getCropMaturityPeriod } from '@/lib/data/cropMaturity';

export interface CashFlowMonth {
  month: number;
  monthName: string;
  activities: string[];
  costs: number;
  revenue: number;
  netCash: number;
  cumulativeCash: number;
}

export interface CashFlowResult {
  crop: string;
  country: string;
  region: string;
  farmSize: number;
  plantingDate: string;
  harvestDate: string;
  maturityMonths: number;
  months: CashFlowMonth[];
  totalCosts: number;
  totalRevenue: number;
  netProfit: number;
  roi: number;
  peakDeficit: number;
  loanNeeded: number;
  repaymentCapacity: number;
  breakevenYield: number;
}

export function calculateCashFlow(
  crop: string,
  country: string,
  region: string,
  farmSize: number,
  plantingDate: string,
  harvestDate: string,
  costs: {
    seedCost: number;
    plantingFertilizerCost: number;
    topdressingFertilizerCost: number;
    potassiumFertilizerCost: number;
    ploughingCost: number;
    plantingLabourCost: number;
    weedingCost: number;
    harvestingCost: number;
    transportCostPerKg: number;
    bagCost: number;
    emptyBags: number;
    otherCosts?: { name: string; amount: number }[];
  },
  yield: {
    actualYieldKg: number;
    pricePerKg: number;
  }
): CashFlowResult {

  // Calculate total fertilizer cost
  const fertilizerCost =
    (costs.plantingFertilizerCost || 0) +
    (costs.topdressingFertilizerCost || 0) +
    (costs.potassiumFertilizerCost || 0);

  // Calculate total labour cost
  const labourCost =
    (costs.ploughingCost || 0) * farmSize +
    (costs.plantingLabourCost || 0) * farmSize +
    (costs.weedingCost || 0) * farmSize +
    (costs.harvestingCost || 0) * farmSize;

  // Calculate seed cost
  const seedCostTotal = (costs.seedCost || 0) * farmSize;

  // Calculate bag cost
  const bagCostTotal = (costs.bagCost || 0) * (costs.emptyBags || 0);

  // Calculate transport cost
  const transportCostTotal = (yield.actualYieldKg || 0) * (costs.transportCostPerKg || 0);

  // Calculate other costs
  const otherCostsTotal = costs.otherCosts
    ? costs.otherCosts.reduce((sum, item) => sum + item.amount, 0)
    : 0;

  // Total costs
  const totalCosts =
    seedCostTotal +
    fertilizerCost * farmSize +
    labourCost +
    transportCostTotal +
    bagCostTotal +
    otherCostsTotal;

  // Total revenue
  const totalRevenue = (yield.actualYieldKg || 0) * (yield.pricePerKg || 0) * farmSize;

  // Net profit
  const netProfit = totalRevenue - totalCosts;

  // ROI
  const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

  // Get crop-specific maturity period based on location
  const maturityMonths = getCropMaturityPeriod(crop, country, region) ||
                         Math.ceil((new Date(harvestDate).getTime() - new Date(plantingDate).getTime()) / (1000 * 60 * 60 * 24 * 30));

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Distribute costs across months
  const months: CashFlowMonth[] = [];
  let cumulativeCash = 0;
  let peakDeficit = 0;

  for (let i = 0; i < maturityMonths; i++) {
    const currentDate = new Date(plantingDate);
    currentDate.setMonth(currentDate.getMonth() + i);
    const monthName = monthNames[currentDate.getMonth()];
    const monthNum = i + 1;

    // Distribute costs by month (simplified allocation)
    let monthCosts = 0;
    const activities: string[] = [];

    if (i === 0) {
      // Month 1: Land preparation and planting
      monthCosts += (costs.ploughingCost || 0) * farmSize;
      monthCosts += (costs.plantingLabourCost || 0) * farmSize;
      monthCosts += seedCostTotal;
      monthCosts += (costs.plantingFertilizerCost || 0) * farmSize;
      activities.push('Land preparation', 'Planting', 'Seed purchase', 'Planting fertilizer');
    } else if (i === 1) {
      // Month 2: Weeding and first topdressing
      monthCosts += (costs.weedingCost || 0) * farmSize * 0.5;
      monthCosts += (costs.topdressingFertilizerCost || 0) * farmSize * 0.5;
      activities.push('Weeding', 'Topdressing (1st application)');
    } else if (i === 2 && maturityMonths > 3) {
      // Month 3: Second weeding and topdressing
      monthCosts += (costs.weedingCost || 0) * farmSize * 0.5;
      monthCosts += (costs.topdressingFertilizerCost || 0) * farmSize * 0.5;
      activities.push('Weeding', 'Topdressing (2nd application)');
    } else if (i === maturityMonths - 1) {
      // Harvest month
      monthCosts += (costs.harvestingCost || 0) * farmSize;
      monthCosts += transportCostTotal;
      monthCosts += bagCostTotal;
      activities.push('Harvesting', 'Transport', 'Packaging');
    } else {
      // Maintenance months
      monthCosts += (costs.weedingCost || 0) * farmSize * 0.3;
      activities.push('Routine maintenance');
    }

    // Add other costs spread evenly
    monthCosts += otherCostsTotal / maturityMonths;

    // Revenue only in harvest month
    const monthRevenue = (i === maturityMonths - 1) ? totalRevenue : 0;

    const netCash = monthRevenue - monthCosts;
    cumulativeCash += netCash;

    // Track peak deficit
    if (cumulativeCash < peakDeficit) {
      peakDeficit = cumulativeCash;
    }

    months.push({
      month: monthNum,
      monthName,
      activities,
      costs: Math.round(monthCosts),
      revenue: Math.round(monthRevenue),
      netCash: Math.round(netCash),
      cumulativeCash: Math.round(cumulativeCash)
    });
  }

  // Calculate loan metrics
  const loanNeeded = Math.abs(peakDeficit);
  const repaymentCapacity = totalRevenue - (totalCosts - loanNeeded);
  const breakevenYield = totalCosts / (yield.pricePerKg || 1) / farmSize;

  return {
    crop,
    country,
    region,
    farmSize,
    plantingDate,
    harvestDate,
    maturityMonths,
    months,
    totalCosts: Math.round(totalCosts),
    totalRevenue: Math.round(totalRevenue),
    netProfit: Math.round(netProfit),
    roi: Math.round(roi * 10) / 10,
    peakDeficit: Math.round(peakDeficit),
    loanNeeded: Math.round(loanNeeded),
    repaymentCapacity: Math.round(repaymentCapacity),
    breakevenYield: Math.round(breakevenYield * 10) / 10
  };
}