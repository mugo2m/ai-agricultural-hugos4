// lib/soilTestInterpreter.ts

export interface SoilTestResults {
  // Basic soil properties
  ph: number;
  phRating: string;
  phosphorus: number;
  phosphorusRating: string;
  potassium: number;
  potassiumRating: string;
  calcium?: number;
  calciumRating?: string;
  magnesium?: number;
  magnesiumRating?: string;
  totalNitrogen?: number;
  totalNitrogenRating?: string;
  organicCarbon?: number;
  organicCarbonRating?: string;
  organicMatter?: number;
  organicMatterRating?: string;
  cec?: number;
  cecRating?: string;
  sodium?: number;
  sodiumRating?: string;

  // NEW: Recommendation fields
  targetYield?: number;
  recPlantingFertilizer?: string;
  recPlantingQuantity?: number;
  recTopdressingFertilizer?: string;
  recTopdressingQuantity?: number;
  recPotassiumFertilizer?: string;
  recPotassiumQuantity?: number;
  recCalciticLime?: number;

  // NEW: Crop information
  crop?: string;
  farmSize?: number;
}

// Crop-specific nutrient requirements (kg per ton of yield)
export const cropNutrientRequirements: Record<string, { n: number; p: number; k: number }> = {
  // Cereals & Grains
  maize: { n: 20, p: 8, k: 20 },
  rice: { n: 15, p: 6, k: 15 },
  wheat: { n: 22, p: 8, k: 18 },
  sorghum: { n: 18, p: 7, k: 16 },
  barley: { n: 20, p: 8, k: 17 },
  oats: { n: 18, p: 7, k: 15 },
  'finger millet': { n: 16, p: 6, k: 14 },

  // Legumes & Pulses (nitrogen-fixing)
  beans: { n: 0, p: 15, k: 20 },
  cowpeas: { n: 0, p: 12, k: 18 },
  'green grams': { n: 0, p: 12, k: 18 },
  'soya beans': { n: 0, p: 18, k: 22 },
  groundnuts: { n: 0, p: 15, k: 20 },
  pigeonpeas: { n: 0, p: 10, k: 15 },
  'bambara nuts': { n: 0, p: 12, k: 15 },

  // Root & Tuber Crops
  potatoes: { n: 25, p: 10, k: 30 },
  'sweet potatoes': { n: 20, p: 8, k: 25 },
  cassava: { n: 18, p: 6, k: 22 },
  yams: { n: 15, p: 8, k: 20 },
  taro: { n: 12, p: 6, k: 15 },
  carrots: { n: 15, p: 8, k: 20 },

  // Vegetables
  tomatoes: { n: 25, p: 10, k: 30 },
  onions: { n: 15, p: 8, k: 15 },
  cabbages: { n: 20, p: 8, k: 22 },
  kales: { n: 18, p: 7, k: 20 },
  spinach: { n: 20, p: 8, k: 20 },
  capsicums: { n: 18, p: 8, k: 22 },
  chillies: { n: 18, p: 8, k: 22 },
  brinjals: { n: 18, p: 8, k: 20 },
  'french beans': { n: 0, p: 12, k: 18 },
  'garden peas': { n: 0, p: 12, k: 18 },
  okra: { n: 18, p: 8, k: 18 },
  cauliflower: { n: 20, p: 8, k: 22 },

  // Fruits
  bananas: { n: 12, p: 4, k: 18 },
  oranges: { n: 10, p: 5, k: 15 },
  mangoes: { n: 10, p: 5, k: 15 },
  pineapples: { n: 8, p: 4, k: 12 },
  avocados: { n: 10, p: 5, k: 15 },
  pawpaws: { n: 12, p: 5, k: 16 },
  'passion fruit': { n: 15, p: 6, k: 18 },
  citrus: { n: 10, p: 5, k: 15 },
  watermelon: { n: 12, p: 6, k: 18 },

  // Cash Crops
  coffee: { n: 20, p: 8, k: 22 },
  tea: { n: 25, p: 5, k: 5 },
  cocoa: { n: 12, p: 6, k: 15 },
  cotton: { n: 18, p: 8, k: 18 },
  sugarcane: { n: 15, p: 5, k: 15 },
  tobacco: { n: 20, p: 10, k: 25 },
  sunflower: { n: 18, p: 8, k: 20 },
  simsim: { n: 15, p: 7, k: 15 },
  pyrethrum: { n: 16, p: 8, k: 18 },

  // Nuts
  groundnuts: { n: 0, p: 15, k: 20 },
  macadamia: { n: 15, p: 8, k: 15 },

  // Cover Crops
  mucuna: { n: 0, p: 5, k: 10 },
  desmodium: { n: 0, p: 5, k: 10 },
  dolichos: { n: 0, p: 5, k: 10 },
  canavalia: { n: 0, p: 5, k: 10 }
};

// Fertilizer composition database
export const fertilizerComposition: Record<string, { n: number; p: number; k: number }> = {
  // Common fertilizers
  'DAP': { n: 18, p: 46, k: 0 },
  'TSP': { n: 0, p: 46, k: 0 },
  'SSP': { n: 0, p: 20, k: 0 },
  'UREA': { n: 46, p: 0, k: 0 },
  'CAN': { n: 27, p: 0, k: 0 },
  'MOP': { n: 0, p: 0, k: 60 },
  'SOP': { n: 0, p: 0, k: 50 },
  'NPK 23:23:0': { n: 23, p: 23, k: 0 },
  'NPK 17:17:17': { n: 17, p: 17, k: 17 },
  'NPK 20:20:20': { n: 20, p: 20, k: 20 },
  'NPK 20:10:10': { n: 20, p: 10, k: 10 },
  'NPK 25:5:5': { n: 25, p: 5, k: 5 },
  'NPK 12:24:12': { n: 12, p: 24, k: 12 },
  'NPK 10:26:10': { n: 10, p: 26, k: 10 },
  'NPK 23:10:10': { n: 23, p: 10, k: 10 },
  'NPK 26:0:20': { n: 26, p: 0, k: 20 },

  // Compound fertilizers
  'Compound 20:20:0': { n: 20, p: 20, k: 0 },
  'Compound 23:23:0': { n: 23, p: 23, k: 0 },
  'Compound 17:17:17': { n: 17, p: 17, k: 17 },

  // Organic options
  'Farmyard manure': { n: 0.5, p: 0.2, k: 0.5 },
  'Compost': { n: 1, p: 0.3, k: 0.8 },
  'Neem cake': { n: 5, p: 1, k: 2 }
};

// Crop yield categories (tons per acre)
export const cropYieldCategories: Record<string, { low: number; medium: number; high: number }> = {
  maize: { low: 1.5, medium: 2.5, high: 4 },
  beans: { low: 0.8, medium: 1.2, high: 1.8 },
  rice: { low: 2, medium: 3, high: 5 },
  potatoes: { low: 8, medium: 12, high: 18 },
  tomatoes: { low: 10, medium: 15, high: 25 },
  onions: { low: 6, medium: 8, high: 12 },
  cabbages: { low: 8, medium: 12, high: 18 },
  kales: { low: 6, medium: 8, high: 12 },
  bananas: { low: 4, medium: 6, high: 10 },
  mangoes: { low: 5, medium: 8, high: 15 },
  avocados: { low: 5, medium: 8, high: 15 },
  coffee: { low: 1.5, medium: 2, high: 3 },
  tea: { low: 1.5, medium: 2.5, high: 4 },
  macadamia: { low: 2, medium: 4, high: 6 },
  cocoa: { low: 0.5, medium: 0.8, high: 1.5 }
};

export class SoilTestInterpreter {

  // Interpret soil test data
  interpretSoilTest(data: any): SoilTestResults {
    // Parse ratings based on values
    const getPHRating = (ph: number): string => {
      if (ph < 5.0) return "Very Low";
      if (ph < 5.5) return "Low";
      if (ph < 6.5) return "Optimum";
      if (ph < 7.5) return "High";
      return "Very High";
    };

    const getPRating = (p: number): string => {
      if (p < 10) return "Very Low";
      if (p < 20) return "Low";
      if (p < 30) return "Optimum";
      if (p < 40) return "High";
      return "Very High";
    };

    const getKRating = (k: number): string => {
      if (k < 50) return "Very Low";
      if (k < 100) return "Low";
      if (k < 150) return "Optimum";
      if (k < 200) return "High";
      return "Very High";
    };

    const getCaRating = (ca: number): string => {
      if (ca < 200) return "Very Low";
      if (ca < 400) return "Low";
      if (ca < 800) return "Optimum";
      if (ca < 1200) return "High";
      return "Very High";
    };

    const getMgRating = (mg: number): string => {
      if (mg < 50) return "Very Low";
      if (mg < 100) return "Low";
      if (mg < 200) return "Optimum";
      if (mg < 300) return "High";
      return "Very High";
    };

    const getNRating = (n: number): string => {
      if (n < 0.1) return "Very Low";
      if (n < 0.2) return "Low";
      if (n < 0.3) return "Optimum";
      if (n < 0.4) return "High";
      return "Very High";
    };

    const getOMRating = (om: number): string => {
      if (om < 1) return "Very Low";
      if (om < 2) return "Low";
      if (om < 4) return "Optimum";
      if (om < 6) return "High";
      return "Very High";
    };

    const getCECRating = (cec: number): string => {
      if (cec < 5) return "Very Low";
      if (cec < 10) return "Low";
      if (cec < 15) return "Optimum";
      if (cec < 20) return "High";
      return "Very High";
    };

    const base = {
      ph: data.soilTestPH,
      phRating: getPHRating(data.soilTestPH),
      phosphorus: data.soilTestP,
      phosphorusRating: getPRating(data.soilTestP),
      potassium: data.soilTestK,
      potassiumRating: getKRating(data.soilTestK),
      calcium: data.soilTestCa,
      calciumRating: getCaRating(data.soilTestCa),
      magnesium: data.soilTestMg,
      magnesiumRating: getMgRating(data.soilTestMg),
      totalNitrogen: data.soilTestNPercent,
      totalNitrogenRating: getNRating(data.soilTestNPercent),
      organicCarbon: data.soilTestOC,
      organicCarbonRating: data.soilTestOCRating,
      organicMatter: data.soilTestOM,
      organicMatterRating: getOMRating(data.soilTestOM),
      cec: data.soilTestCEC,
      cecRating: getCECRating(data.soilTestCEC),
      sodium: data.soilTestNa,
      sodiumRating: data.soilTestNaRating
    };

    // Add recommendations if present
    return {
      ...base,
      targetYield: data.targetYield,
      recPlantingFertilizer: data.recPlantingFertilizer,
      recPlantingQuantity: data.recPlantingQuantity,
      recTopdressingFertilizer: data.recTopdressingFertilizer,
      recTopdressingQuantity: data.recTopdressingQuantity,
      recPotassiumFertilizer: data.recPotassiumFertilizer,
      recPotassiumQuantity: data.recPotassiumQuantity,
      recCalciticLime: data.recCalciticLime,
      crop: data.crops,
      farmSize: data.cropAcres
    };
  }

  // Calculate lime requirement based on pH and crop
  calculateLimeRequirement(ph: number, targetPh: number = 6.5, soilType: string = 'medium'): number {
    if (ph >= targetPh) return 0;

    // pH adjustment factors (kg lime per acre to raise pH by 0.1)
    const factors: Record<string, number> = {
      'sandy': 40,
      'sandy loam': 60,
      'loam': 80,
      'clay loam': 100,
      'clay': 120,
      'medium': 80 // default
    };

    const factor = factors[soilType] || 80;
    const diff = targetPh - ph;
    return Math.round(diff * 10 * factor);
  }

  // Calculate nutrient requirements for specific crop
  calculateCropNutrientRequirements(
    crop: string,
    targetYieldTons: number,
    soilTest: SoilTestResults
  ): { n: number; p: number; k: number; recommendations: string[] } {

    const requirements = cropNutrientRequirements[crop.toLowerCase()] || { n: 15, p: 8, k: 15 };

    // Calculate total nutrients needed
    const totalN = requirements.n * targetYieldTons;
    const totalP = requirements.p * targetYieldTons;
    const totalK = requirements.k * targetYieldTons;

    // Adjust based on soil test levels
    const soilPLevel = soilTest.phosphorus || 0;
    const soilKLevel = soilTest.potassium || 0;

    // Phosphorus adjustment (if soil P is high, reduce recommendation)
    const pAdjustment = soilPLevel > 30 ? 0.5 : soilPLevel > 20 ? 0.8 : 1;

    // Potassium adjustment
    const kAdjustment = soilKLevel > 150 ? 0.5 : soilKLevel > 100 ? 0.8 : 1;

    const adjustedN = totalN;
    const adjustedP = totalP * pAdjustment;
    const adjustedK = totalK * kAdjustment;

    // Generate fertilizer recommendations
    const recommendations: string[] = [];

    // Phosphorus source
    if (adjustedP > 0) {
      if (adjustedP < 20) {
        recommendations.push(`Apply TSP: ${Math.round(adjustedP / 0.46)} kg/acre`);
      } else {
        recommendations.push(`Apply DAP: ${Math.round(adjustedP / 0.46)} kg/acre (provides ${Math.round(adjustedP / 0.46 * 0.18)} kg N)`);
      }
    }

    // Nitrogen topdressing
    if (adjustedN > 0) {
      recommendations.push(`Topdress with CAN: ${Math.round(adjustedN / 0.27)} kg/acre`);
      recommendations.push(`Alternative: UREA ${Math.round(adjustedN / 0.46)} kg/acre`);
    }

    // Potassium
    if (adjustedK > 0) {
      recommendations.push(`Apply MOP: ${Math.round(adjustedK / 0.6)} kg/acre`);
    }

    return {
      n: Math.round(adjustedN * 10) / 10,
      p: Math.round(adjustedP * 10) / 10,
      k: Math.round(adjustedK * 10) / 10,
      recommendations
    };
  }

  // Generate recommendation text using farmer's actual recommendations
  generateRecommendationText(soilResults: SoilTestResults): string {
    // If farmer provided their own recommendations, use them
    if (soilResults.recPlantingFertilizer) {
      return this.generateFarmerRecText(soilResults);
    }

    // Otherwise generate based on soil test
    return this.generateSoilBasedText(soilResults);
  }

  // Generate text using farmer's provided recommendations
  private generateFarmerRecText(soilResults: SoilTestResults): string {
    let text = `🌱 **YOUR SOIL TEST RECOMMENDATIONS**\n\n`;

    if (soilResults.crop) {
      text += `**Crop:** ${soilResults.crop.toUpperCase()}\n`;
    }

    if (soilResults.targetYield) {
      text += `**Target Yield:** ${soilResults.targetYield} kg/acre\n\n`;
    } else {
      text += `\n`;
    }

    text += `**PLANTING FERTILIZER:**\n`;
    text += `• ${soilResults.recPlantingFertilizer}\n`;
    if (soilResults.recPlantingQuantity) {
      text += `• Apply ${soilResults.recPlantingQuantity} kg per acre\n\n`;
    } else {
      text += `\n`;
    }

    text += `**TOPDRESSING FERTILIZER:**\n`;
    text += `• ${soilResults.recTopdressingFertilizer}\n`;
    if (soilResults.recTopdressingQuantity) {
      text += `• Apply ${soilResults.recTopdressingQuantity} kg per acre\n\n`;
    } else {
      text += `\n`;
    }

    if (soilResults.recPotassiumFertilizer) {
      text += `**POTASSIUM FERTILIZER:**\n`;
      text += `• ${soilResults.recPotassiumFertilizer}\n`;
      if (soilResults.recPotassiumQuantity) {
        text += `• Apply ${soilResults.recPotassiumQuantity} kg per acre\n\n`;
      }
    }

    if (soilResults.recCalciticLime && soilResults.recCalciticLime > 0) {
      text += `**LIME RECOMMENDATION:**\n`;
      text += `• Apply ${soilResults.recCalciticLime} kg calcitic lime per acre\n`;
      text += `• Apply 3-4 weeks before planting\n\n`;
    }

    text += `**NUTRIENTS PROVIDED:**\n`;
    const nutrients = this.calculateNutrientsFromRecs(soilResults);
    text += `• Nitrogen (N): ${nutrients.n.toFixed(1)} kg\n`;
    text += `• Phosphorus (P): ${nutrients.p.toFixed(1)} kg\n`;
    text += `• Potassium (K): ${nutrients.k.toFixed(1)} kg\n\n`;

    text += `**BUSINESS TIP:** Every Ksh 1 invested in soil correction returns Ksh 3-5 in higher yields!\n`;

    return text;
  }

  // Generate text based on soil test analysis
  private generateSoilBasedText(soilResults: SoilTestResults): string {
    let text = `🌱 **SOIL TEST ANALYSIS**\n\n`;

    text += `**pH:** ${soilResults.ph} (${soilResults.phRating})\n`;
    if (soilResults.ph < 5.5) {
      text += `→ Soil is too acidic. Lime recommended.\n`;
    } else if (soilResults.ph > 7.5) {
      text += `→ Soil is too alkaline. Add organic matter.\n`;
    }

    text += `**Phosphorus (P):** ${soilResults.phosphorus} ppm (${soilResults.phosphorusRating})\n`;
    if (soilResults.phosphorus < 15) {
      text += `→ Phosphorus is low. Apply DAP or TSP.\n`;
    }

    text += `**Potassium (K):** ${soilResults.potassium} ppm (${soilResults.potassiumRating})\n`;
    if (soilResults.potassium < 100) {
      text += `→ Potassium is low. Apply MOP or other potassium fertilizer.\n`;
    }

    if (soilResults.totalNitrogen) {
      text += `**Nitrogen (N):** ${soilResults.totalNitrogen}% (${soilResults.totalNitrogenRating})\n`;
    }

    if (soilResults.organicMatter) {
      text += `**Organic Matter:** ${soilResults.organicMatter}% (${soilResults.organicMatterRating})\n`;
    }

    if (soilResults.calcium) {
      text += `**Calcium (Ca):** ${soilResults.calcium} ppm (${soilResults.calciumRating})\n`;
    }

    if (soilResults.magnesium) {
      text += `**Magnesium (Mg):** ${soilResults.magnesium} ppm (${soilResults.magnesiumRating})\n`;
    }

    text += `\n**BUSINESS INSIGHT:** Every Ksh 1 invested in soil correction returns Ksh 3-5 in higher yields!\n`;
    text += `**TEST SOIL YEARLY** to track improvements and adjust inputs.\n`;

    return text;
  }

  // Calculate nutrients from fertilizer recommendations
  calculateNutrientsFromRecs(rec: SoilTestResults): { n: number; p: number; k: number } {
    const parseFertilizer = (name: string, qty: number) => {
      if (!name || !qty) return { n: 0, p: 0, k: 0 };

      const lowerName = name.toLowerCase();

      // Try to match fertilizer in composition database
      for (const [key, comp] of Object.entries(fertilizerComposition)) {
        if (lowerName.includes(key.toLowerCase())) {
          return {
            n: (comp.n / 100) * qty,
            p: (comp.p / 100) * qty,
            k: (comp.k / 100) * qty
          };
        }
      }

      // Try to extract NPK numbers
      const match = name.match(/(\d+)[^\d]?(\d+)?[^\d]?(\d+)?/);
      if (match) {
        const n = parseInt(match[1]) || 0;
        const p = parseInt(match[2]) || 0;
        const k = parseInt(match[3]) || 0;
        return {
          n: (n / 100) * qty,
          p: (p / 100) * qty,
          k: (k / 100) * qty
        };
      }

      // Common fertilizer names
      if (lowerName.includes('urea')) return { n: 0.46 * qty, p: 0, k: 0 };
      if (lowerName.includes('can')) return { n: 0.27 * qty, p: 0, k: 0 };
      if (lowerName.includes('dap')) return { n: 0.18 * qty, p: 0.46 * qty, k: 0 };
      if (lowerName.includes('mop')) return { n: 0, p: 0, k: 0.6 * qty };
      if (lowerName.includes('tsp')) return { n: 0, p: 0.46 * qty, k: 0 };

      return { n: 0, p: 0, k: 0 };
    };

    const planting = parseFertilizer(rec.recPlantingFertilizer || "", rec.recPlantingQuantity || 0);
    const topdressing = parseFertilizer(rec.recTopdressingFertilizer || "", rec.recTopdressingQuantity || 0);
    const potassium = parseFertilizer(rec.recPotassiumFertilizer || "", rec.recPotassiumQuantity || 0);

    return {
      n: Math.round((planting.n + topdressing.n + potassium.n) * 10) / 10,
      p: Math.round((planting.p + topdressing.p + potassium.p) * 10) / 10,
      k: Math.round((planting.k + topdressing.k + potassium.k) * 10) / 10
    };
  }

  // Get yield category for a crop
  getYieldCategory(crop: string, level: 'low' | 'medium' | 'high' = 'medium'): number {
    const categories = cropYieldCategories[crop.toLowerCase()];
    if (!categories) return 2; // default 2 tons/acre

    return categories[level];
  }

  // Get fertilizer composition
  getFertilizerComposition(name: string): { n: number; p: number; k: number } {
    const lowerName = name.toLowerCase();

    for (const [key, comp] of Object.entries(fertilizerComposition)) {
      if (lowerName.includes(key.toLowerCase())) {
        return comp;
      }
    }

    return { n: 0, p: 0, k: 0 };
  }
}

export const soilTestInterpreter = new SoilTestInterpreter();