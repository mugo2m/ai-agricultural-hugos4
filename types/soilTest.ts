// types/soilTest.ts
// TypeScript interfaces for soil test data

export type NutrientRating = "Very Low" | "Low" | "Optimum" | "High" | "Very High";

export interface SoilTestResults {
  // Date
  testDate: string;
  testAge: number; // months

  // pH
  ph: number;
  phRating: NutrientRating;

  // Phosphorus
  phosphorus: number;
  phosphorusRating: NutrientRating;

  // Potassium
  potassium: number;
  potassiumRating: NutrientRating;

  // Calcium
  calcium: number;
  calciumRating: NutrientRating;

  // Magnesium
  magnesium: number;
  magnesiumRating: NutrientRating;

  // Sodium
  sodium: number;
  sodiumRating: NutrientRating;

  // Total Nitrogen
  totalNitrogen: number; // %
  totalNitrogenRating: NutrientRating;

  // Organic Carbon
  organicCarbon: number; // %
  organicCarbonRating: NutrientRating;

  // Organic Matter
  organicMatter: number; // %
  organicMatterRating: NutrientRating;

  // CEC
  cec: number; // meq/100g
  cecRating: NutrientRating;
}

export interface NutrientRequirement {
  n: number; // kg N per acre needed
  p: number; // kg P per acre needed
  k: number; // kg K per acre needed
  s: number; // kg S per acre needed
  ca: number; // kg Ca per acre needed
  mg: number; // kg Mg per acre needed
  zn: number; // kg Zn per acre needed
  b: number; // kg B per acre needed
}

export interface FertilizerRecommendation {
  fertilizerId: string;
  brand: string;
  company: string;
  npk: string;
  amountKg: number; // kg per acre
  provides: {
    n: number;
    p: number;
    k: number;
    s?: number;
    ca?: number;
    mg?: number;
  };
  cost?: number; // if price provided
}

export interface FertilizerBlendResult {
  plantingRecommendations: FertilizerRecommendation[];
  topDressingRecommendations: FertilizerRecommendation[];
  totalNutrientsProvided: NutrientRequirement;
  remainingNeeds: NutrientRequirement;
  totalCost?: number;
  soilTestSummary: SoilTestResults;
}