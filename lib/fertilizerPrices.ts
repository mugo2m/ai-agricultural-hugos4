// lib/fertilizerPrices.ts
// Fertilizer price tracking with package sizes

export interface FertilizerPrice {
  fertilizerId: string;
  brand: string;
  pricePer50kg: number;
  packageSizes: {
    size: string; // e.g., "50kg bag", "1 ton"
    price: number;
    retailer?: string;
    location?: string;
  }[];
  lastUpdated: string;
}

export const fertilizerPrices: Record<string, FertilizerPrice> = {
  dap: {
    fertilizerId: "dap",
    brand: "DAP (18-46-0)",
    pricePer50kg: 3500,
    packageSizes: [
      { size: "50kg bag", price: 3500, retailer: "Agrovet", location: "Bungoma" },
      { size: "50kg bag", price: 3400, retailer: "NCPB", location: "Bungoma" },
      { size: "1 ton (20 bags)", price: 65000, retailer: "Wholesale", location: "Bungoma" }
    ],
    lastUpdated: "2024-01-15"
  },
  can: {
    fertilizerId: "ss_can",
    brand: "CAN (27-0-0)",
    pricePer50kg: 2600,
    packageSizes: [
      { size: "50kg bag", price: 2600, retailer: "Agrovet", location: "Bungoma" },
      { size: "50kg bag", price: 2500, retailer: "NCPB", location: "Bungoma" },
      { size: "1 ton (20 bags)", price: 48000, retailer: "Wholesale", location: "Bungoma" }
    ],
    lastUpdated: "2024-01-15"
  },
  urea: {
    fertilizerId: "ss_urea",
    brand: "UREA (46-0-0)",
    pricePer50kg: 2900,
    packageSizes: [
      { size: "50kg bag", price: 2900, retailer: "Agrovet", location: "Bungoma" },
      { size: "50kg bag", price: 2800, retailer: "NCPB", location: "Bungoma" },
      { size: "1 ton (20 bags)", price: 54000, retailer: "Wholesale", location: "Bungoma" }
    ],
    lastUpdated: "2024-01-15"
  },
  mop: {
    fertilizerId: "mop",
    brand: "MOP (0-0-60)",
    pricePer50kg: 2850,
    packageSizes: [
      { size: "50kg bag", price: 2850, retailer: "Agrovet", location: "Bungoma" },
      { size: "50kg bag", price: 2800, retailer: "NCPB", location: "Bungoma" }
    ],
    lastUpdated: "2024-01-15"
  },
  npk_2323: {
    fertilizerId: "npk_2323",
    brand: "NPK 23-23-0",
    pricePer50kg: 3100,
    packageSizes: [
      { size: "50kg bag", price: 3100, retailer: "Agrovet", location: "Bungoma" }
    ],
    lastUpdated: "2024-01-15"
  }
};

export const defaultFertilizerPrices: Record<string, number> = {
  dap: 3500,
  ss_urea: 2900,
  ss_can: 2600,
  ss_as: 2300,
  npk_2323: 3100,
  mop: 2850,
  sop: 3300,
  yara_power: 3900,
  etg_falcon_urea: 2900
};

export function getFertilizerPrice(fertilizerId: string): number {
  return defaultFertilizerPrices[fertilizerId] || 0;
}

export function getFertilizerPriceWithPackages(fertilizerId: string): FertilizerPrice | undefined {
  return fertilizerPrices[fertilizerId];
}

export function calculateTotalCost(recommendations: any[]): number {
  return recommendations.reduce((total, rec) => {
    const pricePerKg = (getFertilizerPrice(rec.fertilizerId) || 0) / 50;
    const cost = rec.amountKg * pricePerKg;

    // Add package size recommendation
    const bagsNeeded = Math.ceil(rec.amountKg / 50);
    const bulkBagsNeeded = Math.floor(rec.amountKg / 50);
    const bulkPrice = fertilizerPrices[rec.fertilizerId]?.packageSizes.find(p => p.size.includes("ton"))?.price;

    rec.purchaseRecommendation = {
      exactNeeded: `${rec.amountKg}kg (${bagsNeeded} bag(s) of 50kg)`,
      bulkOption: bulkPrice ? `Consider buying ${bulkBagsNeeded} bags with neighbors to save` : undefined,
      costBreakdown: `Cost: Ksh ${cost.toLocaleString()}`
    };

    return total + cost;
  }, 0);
}

// Calculate savings from bulk purchase
export function calculateBulkSavings(fertilizerId: string, quantityKg: number): { normalPrice: number; bulkPrice: number; savings: number } {
  const fertilizer = fertilizerPrices[fertilizerId];
  if (!fertilizer) return { normalPrice: 0, bulkPrice: 0, savings: 0 };

  const bagsNeeded = Math.ceil(quantityKg / 50);
  const normalPrice = bagsNeeded * fertilizer.pricePer50kg;

  // Check if bulk option exists (1 ton = 20 bags)
  const bulkOption = fertilizer.packageSizes.find(p => p.size.includes("ton"));
  if (bulkOption && bagsNeeded >= 20) {
    const bulkBagsNeeded = Math.floor(bagsNeeded / 20) * 20;
    const remainingBags = bagsNeeded % 20;
    const bulkPrice = (bulkBagsNeeded / 20) * bulkOption.price;
    const remainingPrice = remainingBags * fertilizer.pricePer50kg;
    const totalBulkPrice = bulkPrice + remainingPrice;

    return {
      normalPrice,
      bulkPrice: totalBulkPrice,
      savings: normalPrice - totalBulkPrice
    };
  }

  return { normalPrice, bulkPrice: normalPrice, savings: 0 };
}