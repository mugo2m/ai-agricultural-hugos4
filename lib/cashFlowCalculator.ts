// lib/cashFlowCalculator.ts
// Calculate monthly cash flow projections based on planting and harvest dates

import { getCropMaturityPeriod } from '@/lib/data/cropMaturity';
import { parseNutrientString } from '@/lib/utils';

export interface CashFlowMonth {
  month: number;
  monthName: string;
  activities: string[];
  costs: number;
  revenue: number;
  netCash: number;
  cumulativeCash: number;
  // NEW: Detailed breakdown
  costBreakdown?: {
    seed?: number;
    plantingMaterial?: number;
    fertilizer?: number;
    labour?: number;
    transport?: number;
    bags?: number;
    other?: number;
  };
  // NEW: Fertilizer application details
  fertilizerApplications?: {
    type: 'planting' | 'topdressing' | 'potassium';
    product: string;
    amountKg: number;
    nutrients?: {
      n?: number;
      p?: number;
      k?: number;
      s?: number;
      ca?: number;
      mg?: number;
      zn?: number;
      b?: number;
    };
  }[];
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
  // NEW: Summary statistics
  costBreakdown: {
    seed: number;
    fertilizer: number;
    labour: number;
    transport: number;
    bags: number;
    other: number;
  };
  // NEW: Nutrient summary
  totalNutrients: {
    n: number;
    p: number;
    k: number;
    s?: number;
    ca?: number;
    mg?: number;
    zn?: number;
    b?: number;
  };
  // NEW: Plants damaged (data only)
  plantsDamaged?: number;
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
    plantingMaterialCost?: number;      // NEW: For vegetative crops
    plantingMaterialQuantity?: number;   // NEW: Number of units
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
    // NEW: Fertilizer details for nutrient tracking
    plantingFertilizer?: {
      brand: string;
      amountKg: number;
      nutrients?: any;
    };
    topdressingFertilizer?: {
      brand: string;
      amountKg: number;
      nutrients?: any;
    };
    potassiumFertilizer?: {
      brand: string;
      amountKg: number;
      nutrients?: any;
    };
    // NEW: Planting material details
    usesSeed?: boolean;
    seedRate?: number;
  },
  yield: {
    actualYieldKg: number;
    pricePerKg: number;
  },
  // NEW: Plants damaged (data only)
  plantsDamaged?: number
): CashFlowResult {

  // Determine if crop uses seed or vegetative material
  const usesSeed = costs.usesSeed ?? true;

  // Calculate planting material cost
  let plantingMaterialTotal = 0;
  if (usesSeed && costs.seedCost && costs.seedRate) {
    plantingMaterialTotal = costs.seedCost * costs.seedRate * farmSize;
  } else if (!usesSeed && costs.plantingMaterialCost && costs.plantingMaterialQuantity) {
    plantingMaterialTotal = costs.plantingMaterialCost * costs.plantingMaterialQuantity;
  }

  // Calculate fertilizer costs with nutrient tracking
  const fertilizerCost =
    (costs.plantingFertilizerCost || 0) * farmSize +
    (costs.topdressingFertilizerCost || 0) * farmSize +
    (costs.potassiumFertilizerCost || 0) * farmSize;

  // Calculate total nutrient contributions
  const totalNutrients = {
    n: 0, p: 0, k: 0,
    s: 0, ca: 0, mg: 0, zn: 0, b: 0
  };

  // Add nutrients from planting fertilizer
  if (costs.plantingFertilizer) {
    const fert = costs.plantingFertilizer;
    const factor = fert.amountKg / 100;
    if (fert.nutrients) {
      if (fert.nutrients.n) totalNutrients.n += fert.nutrients.n * factor;
      if (fert.nutrients.p) totalNutrients.p += fert.nutrients.p * factor;
      if (fert.nutrients.k) totalNutrients.k += fert.nutrients.k * factor;
      if (fert.nutrients.s) totalNutrients.s += fert.nutrients.s * factor;
      if (fert.nutrients.ca) totalNutrients.ca += fert.nutrients.ca * factor;
      if (fert.nutrients.mg) totalNutrients.mg += fert.nutrients.mg * factor;
      if (fert.nutrients.zn) totalNutrients.zn += fert.nutrients.zn * factor;
      if (fert.nutrients.b) totalNutrients.b += fert.nutrients.b * factor;
    }
  }

  // Add nutrients from topdressing fertilizer
  if (costs.topdressingFertilizer) {
    const fert = costs.topdressingFertilizer;
    const factor = fert.amountKg / 100;
    if (fert.nutrients) {
      if (fert.nutrients.n) totalNutrients.n += fert.nutrients.n * factor;
      if (fert.nutrients.p) totalNutrients.p += fert.nutrients.p * factor;
      if (fert.nutrients.k) totalNutrients.k += fert.nutrients.k * factor;
      if (fert.nutrients.s) totalNutrients.s += fert.nutrients.s * factor;
      if (fert.nutrients.ca) totalNutrients.ca += fert.nutrients.ca * factor;
      if (fert.nutrients.mg) totalNutrients.mg += fert.nutrients.mg * factor;
      if (fert.nutrients.zn) totalNutrients.zn += fert.nutrients.zn * factor;
      if (fert.nutrients.b) totalNutrients.b += fert.nutrients.b * factor;
    }
  }

  // Add nutrients from potassium fertilizer
  if (costs.potassiumFertilizer) {
    const fert = costs.potassiumFertilizer;
    const factor = fert.amountKg / 100;
    if (fert.nutrients) {
      if (fert.nutrients.n) totalNutrients.n += fert.nutrients.n * factor;
      if (fert.nutrients.p) totalNutrients.p += fert.nutrients.p * factor;
      if (fert.nutrients.k) totalNutrients.k += fert.nutrients.k * factor;
      if (fert.nutrients.s) totalNutrients.s += fert.nutrients.s * factor;
      if (fert.nutrients.ca) totalNutrients.ca += fert.nutrients.ca * factor;
      if (fert.nutrients.mg) totalNutrients.mg += fert.nutrients.mg * factor;
      if (fert.nutrients.zn) totalNutrients.zn += fert.nutrients.zn * factor;
      if (fert.nutrients.b) totalNutrients.b += fert.nutrients.b * factor;
    }
  }

  // Calculate total labour cost
  const labourCost =
    (costs.ploughingCost || 0) * farmSize +
    (costs.plantingLabourCost || 0) * farmSize +
    (costs.weedingCost || 0) * farmSize +
    (costs.harvestingCost || 0) * farmSize;

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
    plantingMaterialTotal +
    fertilizerCost +
    labourCost +
    transportCostTotal +
    bagCostTotal +
    otherCostsTotal;

  // Cost breakdown
  const costBreakdown = {
    seed: plantingMaterialTotal,
    fertilizer: fertilizerCost,
    labour: labourCost,
    transport: transportCostTotal,
    bags: bagCostTotal,
    other: otherCostsTotal
  };

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

    // Initialize month data
    let monthCosts = 0;
    const activities: string[] = [];
    const costBreakdown: any = { seed: 0, fertilizer: 0, labour: 0, transport: 0, bags: 0, other: 0 };
    const fertilizerApplications: any[] = [];

    // Distribute costs by month based on actual farming activities
    if (i === 0) {
      // Month 1: Land preparation and planting
      monthCosts += (costs.ploughingCost || 0) * farmSize;
      monthCosts += (costs.plantingLabourCost || 0) * farmSize;
      monthCosts += plantingMaterialTotal;
      monthCosts += (costs.plantingFertilizerCost || 0) * farmSize;

      costBreakdown.seed += plantingMaterialTotal;
      costBreakdown.labour += ((costs.ploughingCost || 0) + (costs.plantingLabourCost || 0)) * farmSize;
      costBreakdown.fertilizer += (costs.plantingFertilizerCost || 0) * farmSize;

      activities.push('Land preparation', 'Planting', usesSeed ? 'Seed purchase' : 'Planting material purchase', 'Planting fertilizer');

      // Add planting fertilizer application details
      if (costs.plantingFertilizer) {
        fertilizerApplications.push({
          type: 'planting',
          product: costs.plantingFertilizer.brand,
          amountKg: costs.plantingFertilizer.amountKg,
          nutrients: costs.plantingFertilizer.nutrients
        });
      }

    } else if (i === 1) {
      // Month 2: First weeding and topdressing
      monthCosts += (costs.weedingCost || 0) * farmSize * 0.5;
      monthCosts += (costs.topdressingFertilizerCost || 0) * farmSize * 0.5;

      costBreakdown.labour += (costs.weedingCost || 0) * farmSize * 0.5;
      costBreakdown.fertilizer += (costs.topdressingFertilizerCost || 0) * farmSize * 0.5;

      activities.push('Weeding (1st)', 'Topdressing (1st application)');

      // Add topdressing fertilizer application details
      if (costs.topdressingFertilizer && maturityMonths > 2) {
        fertilizerApplications.push({
          type: 'topdressing',
          product: costs.topdressingFertilizer.brand,
          amountKg: costs.topdressingFertilizer.amountKg * 0.5,
          nutrients: costs.topdressingFertilizer.nutrients
        });
      }

    } else if (i === 2 && maturityMonths > 3) {
      // Month 3: Second weeding and topdressing
      monthCosts += (costs.weedingCost || 0) * farmSize * 0.5;
      monthCosts += (costs.topdressingFertilizerCost || 0) * farmSize * 0.5;

      costBreakdown.labour += (costs.weedingCost || 0) * farmSize * 0.5;
      costBreakdown.fertilizer += (costs.topdressingFertilizerCost || 0) * farmSize * 0.5;

      activities.push('Weeding (2nd)', 'Topdressing (2nd application)');

      // Add topdressing fertilizer application details
      if (costs.topdressingFertilizer && maturityMonths > 3) {
        fertilizerApplications.push({
          type: 'topdressing',
          product: costs.topdressingFertilizer.brand,
          amountKg: costs.topdressingFertilizer.amountKg * 0.5,
          nutrients: costs.topdressingFertilizer.nutrients
        });
      }

    } else if (i === maturityMonths - 1) {
      // Harvest month
      monthCosts += (costs.harvestingCost || 0) * farmSize;
      monthCosts += transportCostTotal;
      monthCosts += bagCostTotal;

      costBreakdown.labour += (costs.harvestingCost || 0) * farmSize;
      costBreakdown.transport += transportCostTotal;
      costBreakdown.bags += bagCostTotal;

      activities.push('Harvesting', 'Transport', 'Packaging');

      // Add potassium application if applicable (often applied at flowering/fruiting)
      if (costs.potassiumFertilizer) {
        const kMonth = Math.floor(maturityMonths * 0.6); // Apply potassium around 60% of growth
        if (i === kMonth) {
          monthCosts += (costs.potassiumFertilizerCost || 0) * farmSize;
          costBreakdown.fertilizer += (costs.potassiumFertilizerCost || 0) * farmSize;
          activities.push('Potassium application');

          fertilizerApplications.push({
            type: 'potassium',
            product: costs.potassiumFertilizer.brand,
            amountKg: costs.potassiumFertilizer.amountKg,
            nutrients: costs.potassiumFertilizer.nutrients
          });
        }
      }

    } else if (i === Math.floor(maturityMonths * 0.6) && costs.potassiumFertilizer && i < maturityMonths - 1) {
      // Potassium application month (if not already added in harvest month)
      monthCosts += (costs.potassiumFertilizerCost || 0) * farmSize;
      costBreakdown.fertilizer += (costs.potassiumFertilizerCost || 0) * farmSize;
      activities.push('Potassium application');

      fertilizerApplications.push({
        type: 'potassium',
        product: costs.potassiumFertilizer.brand,
        amountKg: costs.potassiumFertilizer.amountKg,
        nutrients: costs.potassiumFertilizer.nutrients
      });

    } else {
      // Maintenance months
      monthCosts += (costs.weedingCost || 0) * farmSize * 0.3;
      costBreakdown.labour += (costs.weedingCost || 0) * farmSize * 0.3;
      activities.push('Routine maintenance');
    }

    // Add other costs spread evenly
    monthCosts += otherCostsTotal / maturityMonths;
    costBreakdown.other += otherCostsTotal / maturityMonths;

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
      cumulativeCash: Math.round(cumulativeCash),
      costBreakdown: {
        seed: Math.round(costBreakdown.seed),
        fertilizer: Math.round(costBreakdown.fertilizer),
        labour: Math.round(costBreakdown.labour),
        transport: Math.round(costBreakdown.transport),
        bags: Math.round(costBreakdown.bags),
        other: Math.round(costBreakdown.other)
      },
      fertilizerApplications: fertilizerApplications.length > 0 ? fertilizerApplications : undefined
    });
  }

  // Calculate loan metrics
  const loanNeeded = Math.abs(peakDeficit);
  const repaymentCapacity = totalRevenue - (totalCosts - loanNeeded);
  const breakevenYield = totalCosts / (yield.pricePerKg || 1) / farmSize;

  // Round all nutrient values
  const roundedNutrients = {
    n: Math.round(totalNutrients.n * 10) / 10,
    p: Math.round(totalNutrients.p * 10) / 10,
    k: Math.round(totalNutrients.k * 10) / 10,
    s: totalNutrients.s ? Math.round(totalNutrients.s * 10) / 10 : undefined,
    ca: totalNutrients.ca ? Math.round(totalNutrients.ca * 10) / 10 : undefined,
    mg: totalNutrients.mg ? Math.round(totalNutrients.mg * 10) / 10 : undefined,
    zn: totalNutrients.zn ? Math.round(totalNutrients.zn * 10) / 10 : undefined,
    b: totalNutrients.b ? Math.round(totalNutrients.b * 10) / 10 : undefined
  };

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
    breakevenYield: Math.round(breakevenYield * 10) / 10,
    costBreakdown: {
      seed: Math.round(plantingMaterialTotal),
      fertilizer: Math.round(fertilizerCost),
      labour: Math.round(labourCost),
      transport: Math.round(transportCostTotal),
      bags: Math.round(bagCostTotal),
      other: Math.round(otherCostsTotal)
    },
    totalNutrients: roundedNutrients,
    plantsDamaged
  };
}