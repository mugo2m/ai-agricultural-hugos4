// types/fertilizer.ts
// Additional type definitions for fertilizer module

export interface FertilizerSelection {
  plantingIds: string[];
  topDressingIds: string[];
}

export interface FertilizerPrice {
  fertilizerId: string;
  pricePer50kg: number; // Ksh per 50kg bag
  retailer?: string;
  date: string;
}

export interface FertilizerCalculationInput {
  soilTestData: any;
  cropType: string;
  targetYield: number;
  plantingFertilizers: string[];
  topDressingFertilizers: string[];
  prices?: Record<string, number>;
}

export interface FertilizerCalculationResult {
  success: boolean;
  result?: FertilizerBlendResult;
  error?: string;
}