// lib/fertilizerPrices.ts
// Optional - for price tracking

export interface FertilizerPrice {
  fertilizerId: string;
  pricePer50kg: number;
  retailer: string;
  location: string;
  date: string;
}

export const defaultFertilizerPrices: Record<string, number> = {
  dap: 3500,      // DAP per 50kg
  ss_urea: 2800,  // Urea per 50kg
  ss_can: 2500,   // CAN per 50kg
  ss_as: 2200,    // Ammonium Sulphate per 50kg
  npk_2323: 3000, // NPK 23-23-0 per 50kg
  yara_power: 3800, // Yara Mila Power
  etg_falcon_urea: 2850,
  interagro_can: 2550
};

export function getFertilizerPrice(fertilizerId: string): number {
  return defaultFertilizerPrices[fertilizerId] || 0;
}

export function calculateTotalCost(recommendations: any[]): number {
  return recommendations.reduce((total, rec) => {
    const pricePerKg = (getFertilizerPrice(rec.fertilizerId) || 0) / 50;
    return total + (rec.amountKg * pricePerKg);
  }, 0);
}e t