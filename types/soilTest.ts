// types/soilTest.ts
// TypeScript interfaces for soil test data

export type NutrientRating = "Very Low" | "Low" | "Optimum" | "High" | "Very High";

// ========== SPACING INTERFACES ==========
export interface SpacingInfo {
  rowCm: number;
  plantCm: number;
  seedsPerHole: number;
  label: string;
  plantsPerAcre: number;
}

export interface PerPlantInfo {
  plantsPerAcre: number;
  totalPlants: number;
  dapGrams: number;
  ureaGrams: number;
  mopGrams: number;
  totalGrams: number;
  dapGuide: string;
  ureaGuide: string;
  mopGuide: string;
  totalGuide: string;
}

// ========== SOIL TEST RESULTS ==========
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

// ========== INTERFACE FOR SOIL TEST RECOMMENDATIONS INPUT ==========
export interface SoilTestRecommendations {
  targetYield: number;
  plantingFertilizer: string;  // e.g., "NPK 12.24.12+5S"
  plantingQuantity: number;     // e.g., 100kg
  topdressingFertilizer: string; // e.g., "UREA 46-0-0"
  topdressingQuantity: number;   // e.g., 90kg
  potassiumFertilizer: string;   // e.g., "MOP 0-0-60"
  potassiumQuantity: number;     // e.g., 30kg
}

// ========== INTERFACE FOR PARSED NUTRIENT VALUES ==========
export interface ParsedNutrients {
  n: number;
  p: number;
  k: number;
  s?: number;
}

// ========== NUTRIENT REQUIREMENT INTERFACE ==========
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

// ========== FERTILIZER RECOMMENDATION INTERFACE ==========
export interface FertilizerRecommendation {
  fertilizerId: string;
  brand: string;
  company: string;
  npk: string;
  amountKg: number; // kg for entire farm
  packageSizes: string[];
  pricePer50kg: number;
  provides: {
    n: number;      // kg N for entire farm
    p: number;      // kg P for entire farm
    k: number;      // kg K for entire farm
    s?: number;
    ca?: number;
    mg?: number;
  };
  cost?: number; // total cost for this fertilizer
}

// ========== FERTILIZER BLEND RESULT (ENHANCED) ==========
export interface FertilizerBlendResult {
  // Recommendations scaled to farm size
  plantingRecommendations: FertilizerRecommendation[];
  topDressingRecommendations: FertilizerRecommendation[];

  // Per-acre reference values (for display)
  perAcrePlanting?: FertilizerRecommendation[];
  perAcreTopdressing?: FertilizerRecommendation[];

  // Totals for entire farm
  totalNutrientsProvided: NutrientRequirement;
  remainingNeeds: NutrientRequirement;
  totalCost?: number;

  // Farm information
  farmSize?: number;

  // Per-plant information (if spacing provided)
  perPlant?: PerPlantInfo;

  // Original soil test summary
  soilTestSummary: SoilTestResults | null;
}

// ========== FARMER SESSION INTERFACE ==========
export interface FarmerSession {
  id: string;
  userId: string;
  farmerName: string;
  phoneNumber: string;
  county: string;
  subCounty: string;
  ward: string;
  village: string;
  totalFarmSize?: number;
  cultivatedAcres?: number;
  waterSources?: string[];
  crops: string[];
  cropVarieties?: string;
  cropAcres?: number;
  season?: string;
  plantingDate?: string;
  spacing?: string; // Selected spacing label
  spacingInfo?: SpacingInfo; // Parsed spacing data
  seedRate?: number;
  seedCost?: number;

  // Fertilizer information
  plantingFertilizer?: {
    used: boolean;
    type?: string;
    quantity?: number;
    cost?: number;
    reason?: string;
  };
  topdressingFertilizer?: {
    used: boolean;
    type?: string;
    quantity?: number;
    cost?: number;
    reason?: string;
  };
  potassiumFertilizer?: {
    used: boolean;
    type?: string;
    quantity?: number;
    cost?: number;
  };

  // Pests and diseases
  commonPests?: string;
  commonDiseases?: string;

  // Yield and storage
  actualYield?: number;
  yieldUnit?: string;
  pricePerUnit?: number;
  storageMethod?: string;

  // Costs
  inputCosts?: {
    dap?: number;
    can?: number;
    npk?: number;
    bag?: number;
  };
  labourCosts?: {
    ploughing?: number;
    planting?: number;
    weeding?: number;
    harvesting?: number;
  };
  transportCostPerBag?: number;

  // Challenges
  productionChallenges?: string[];
  marketingChallenges?: string[];
  climateChallenges?: string[];
  financialChallenges?: string[];

  // Conservation (combined)
  conservationPractices?: string;

  // Soil test data
  soilTest?: SoilTestResults & {
    plantingFertilizerToUse?: string;
    plantingFertilizerCost?: number;
    topdressingFertilizerToUse?: string;
    topdressingFertilizerCost?: number;
    potassiumFertilizerToUse?: string;
    potassiumFertilizerCost?: number;
    fertilizerPlan?: any;
    perPlant?: PerPlantInfo;
  };

  // Recommendations
  recommendations: string[];
  financialAdvice: string;
  grossMarginAnalysis?: any;

  // Metadata
  createdAt: string;
  queryCount: number;
  source: string;
}