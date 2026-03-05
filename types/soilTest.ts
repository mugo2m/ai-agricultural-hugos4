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

  // Micronutrients
  zinc?: number;
  zincRating?: NutrientRating;
  copper?: number;
  copperRating?: NutrientRating;
  boron?: number;
  boronRating?: NutrientRating;
  manganese?: number;
  manganeseRating?: NutrientRating;
  iron?: number;
  ironRating?: NutrientRating;
  molybdenum?: number;
  molybdenumRating?: NutrientRating;

  // ========== SOIL TEST RECOMMENDATIONS ==========
  targetYield?: number; // e.g., 27 bags/acre

  // Planting fertilizer recommendation
  recPlantingFertilizer?: string; // e.g., "NPK 12.24.12+5S"
  recPlantingQuantity?: number; // e.g., 100 kg

  // Topdressing fertilizer recommendation
  recTopdressingFertilizer?: string; // e.g., "UREA 46-0-0"
  recTopdressingQuantity?: number; // e.g., 90 kg

  // Potassium fertilizer recommendation
  recPotassiumFertilizer?: string; // e.g., "MOP 0-0-60"
  recPotassiumQuantity?: number; // e.g., 30 kg
}

// ========== Interface for soil test recommendations input ==========
export interface SoilTestRecommendations {
  targetYield: number;
  plantingFertilizer: string;  // e.g., "NPK 12.24.12+5S"
  plantingQuantity: number;     // e.g., 100kg
  topdressingFertilizer: string; // e.g., "UREA 46-0-0"
  topdressingQuantity: number;   // e.g., 90kg
  potassiumFertilizer: string;   // e.g., "MOP 0-0-60"
  potassiumQuantity: number;     // e.g., 30kg
}

// ========== Interface for parsed nutrient values from recommendations ==========
export interface ParsedNutrients {
  n: number;
  p: number;
  k: number;
  s?: number;
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
  cu?: number; // kg Cu per acre needed
  mn?: number; // kg Mn per acre needed
  fe?: number; // kg Fe per acre needed
}

export interface FertilizerRecommendation {
  fertilizerId: string;
  brand: string;
  company: string;
  npk: string;
  amountKg: number; // kg per acre
  packageSizes: string[];
  pricePer50kg: number;
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