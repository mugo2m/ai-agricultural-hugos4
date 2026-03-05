// lib/fertilizerCalculator.ts
// Core calculation logic for converting soil tests to fertilizer kg

import { SoilTestResults, NutrientRequirement, FertilizerRecommendation, FertilizerBlendResult } from '@/types/soilTest';
import { plantingFertilizers, getPlantingFertilizerById } from './fertilizers/plantingFertilizers';
import { topDressingFertilizers, getTopDressingFertilizerById } from './fertilizers/topDressingFertilizers';
import { soilTestInterpreter } from './soilTestInterpreter';

export class FertilizerCalculator {

  // Calculate optimal blend from available fertilizers
  calculateOptimalBlend(
    nutrientNeeds: NutrientRequirement,
    availableFertilizerIds: string[],
    applicationType: 'planting' | 'topdressing',
    costs?: { plantingCost?: number; topdressingCost?: number; potassiumCost?: number }
  ): {
    recommendations: FertilizerRecommendation[];
    remaining: NutrientRequirement;
  } {
    // Get available fertilizers from database
    const fertilizerDb = applicationType === 'planting' ? plantingFertilizers : topDressingFertilizers;
    const availableFertilizers = fertilizerDb.filter(f => availableFertilizerIds.includes(f.id));

    let remaining = { ...nutrientNeeds };
    const recommendations: FertilizerRecommendation[] = [];

    // ========== STEP 1: Meet phosphorus needs FIRST (most limiting) ==========
    if (remaining.p > 0.1) {
      // Find fertilizers with phosphorus
      const pFertilizers = availableFertilizers.filter(f => (f.nutrients.p || 0) > 0);

      if (pFertilizers.length > 0) {
        // Use the first available P fertilizer (usually DAP)
        const fert = pFertilizers[0];
        const pNeeded = remaining.p;
        const pPercent = fert.nutrients.p / 100;
        // Use Math.round instead of Math.ceil for more accurate calculation
        const amountKg = Math.round(pNeeded / pPercent);

        if (amountKg > 0) {
          // Calculate what this fertilizer provides
          const providesN = amountKg * (fert.nutrients.n / 100);
          const providesP = amountKg * (fert.nutrients.p / 100);
          const providesK = amountKg * (fert.nutrients.k / 100);

          recommendations.push({
            fertilizerId: fert.id,
            brand: fert.brand,
            company: fert.company,
            npk: fert.npk,
            amountKg,
            packageSizes: fert.packageSizes || ["50kg bag"],
            pricePer50kg: fert.pricePer50kg || 0,
            provides: {
              n: providesN,
              p: providesP,
              k: providesK
            }
          });

          // Update remaining needs (subtract what this fertilizer provides)
          remaining.p = Math.max(0, remaining.p - providesP);
          remaining.n = Math.max(0, remaining.n - providesN);
          remaining.k = Math.max(0, remaining.k - providesK);

          console.log(`📊 P fertilizer: ${amountKg}kg ${fert.brand} provides ${providesN.toFixed(1)}kg N, ${providesP.toFixed(1)}kg P`);
        }
      }
    }

    // ========== STEP 2: Meet potassium needs ==========
    if (remaining.k > 0.1) {
      // Find fertilizers with potassium (excluding the one already used if possible)
      const kFertilizers = availableFertilizers.filter(f =>
        (f.nutrients.k || 0) > 0 && f.id !== recommendations[0]?.fertilizerId
      );

      if (kFertilizers.length > 0) {
        const fert = kFertilizers[0];
        const kNeeded = remaining.k;
        const kPercent = fert.nutrients.k / 100;
        const amountKg = Math.round(kNeeded / kPercent);

        if (amountKg > 0) {
          const providesN = amountKg * (fert.nutrients.n / 100);
          const providesP = amountKg * (fert.nutrients.p / 100);
          const providesK = amountKg * (fert.nutrients.k / 100);

          recommendations.push({
            fertilizerId: fert.id,
            brand: fert.brand,
            company: fert.company,
            npk: fert.npk,
            amountKg,
            packageSizes: fert.packageSizes || ["50kg bag"],
            pricePer50kg: fert.pricePer50kg || 0,
            provides: {
              n: providesN,
              p: providesP,
              k: providesK
            }
          });

          remaining.k = Math.max(0, remaining.k - providesK);
          remaining.n = Math.max(0, remaining.n - providesN);
          remaining.p = Math.max(0, remaining.p - providesP);

          console.log(`📊 K fertilizer: ${amountKg}kg ${fert.brand} provides ${providesK.toFixed(1)}kg K`);
        }
      }
    }

    // ========== STEP 3: Meet nitrogen needs (using different fertilizers) ==========
    if (remaining.n > 0.1) {
      // Find nitrogen fertilizers (preferably NOT the same as P fertilizer)
      const nFertilizers = availableFertilizers.filter(f =>
        (f.nutrients.n || 0) > 0 && f.id !== recommendations[0]?.fertilizerId
      );

      if (nFertilizers.length > 0) {
        const fert = nFertilizers[0];
        const nNeeded = remaining.n;
        const nPercent = fert.nutrients.n / 100;
        const amountKg = Math.round(nNeeded / nPercent);

        if (amountKg > 0) {
          const providesN = amountKg * (fert.nutrients.n / 100);
          const providesP = amountKg * (fert.nutrients.p / 100);
          const providesK = amountKg * (fert.nutrients.k / 100);

          recommendations.push({
            fertilizerId: fert.id,
            brand: fert.brand,
            company: fert.company,
            npk: fert.npk,
            amountKg,
            packageSizes: fert.packageSizes || ["50kg bag"],
            pricePer50kg: fert.pricePer50kg || 0,
            provides: {
              n: providesN,
              p: providesP,
              k: providesK
            }
          });

          remaining.n = Math.max(0, remaining.n - providesN);
          remaining.p = Math.max(0, remaining.p - providesP);
          remaining.k = Math.max(0, remaining.k - providesK);

          console.log(`📊 N fertilizer: ${amountKg}kg ${fert.brand} provides ${providesN.toFixed(1)}kg N`);
        }
      }
    }

    const roundRemaining = (val: number) => Math.max(0, Math.round(val * 10) / 10);

    return {
      recommendations,
      remaining: {
        n: roundRemaining(remaining.n),
        p: roundRemaining(remaining.p),
        k: roundRemaining(remaining.k),
        s: roundRemaining(remaining.s),
        ca: roundRemaining(remaining.ca),
        mg: roundRemaining(remaining.mg),
        zn: roundRemaining(remaining.zn),
        b: roundRemaining(remaining.b)
      }
    };
  }

  // ========== CALCULATE FROM FARMER'S SOIL TEST RECOMMENDATIONS - REARRANGED ==========
  calculateFromRecommendations(
    recommendations: {
      targetYield: number;
      plantingFertilizer: string;
      plantingQuantity: number;
      topdressingFertilizer: string;
      topdressingQuantity: number;
      potassiumFertilizer: string;
      potassiumQuantity: number;
    },
    availableFertilizers: {
      planting: string[];
      topdressing: string[];
      potassium: string[];
    },
    costs: {
      plantingCost: number;
      topdressingCost: number;
      potassiumCost: number;
    }
  ): FertilizerBlendResult {

    // STEP 1: Extract nutrients from recommendations
    const nutrients = this.extractNutrientsFromRecommendations(recommendations);

    console.log("📊 Nutrients needed from recommendations:", nutrients);
    console.log("📊 Target yield:", recommendations.targetYield, "bags/acre");

    // Get fertilizer objects from database
    const plantingFertilizer = plantingFertilizers.find(f => f.id === availableFertilizers.planting[0]);
    const topdressingFertilizer = topDressingFertilizers.find(f => f.id === availableFertilizers.topdressing[0]);
    const potassiumFertilizer = topDressingFertilizers.find(f => f.id === availableFertilizers.potassium[0]);

    console.log("📦 Available fertilizers:", {
      planting: plantingFertilizer?.brand || "none",
      topdressing: topdressingFertilizer?.brand || "none",
      potassium: potassiumFertilizer?.brand || "none"
    });

    // ========== STEP 1: Calculate PLANTING fertilizer (for phosphorus) ==========
    let remainingN = nutrients.n;
    let remainingP = nutrients.p;
    let remainingK = nutrients.k;

    const plantingRecs: FertilizerRecommendation[] = [];
    const topdressingRecs: FertilizerRecommendation[] = [];

    // Calculate planting fertilizer for phosphorus needs
    if (plantingFertilizer && remainingP > 0) {
      const pPercent = plantingFertilizer.nutrients.p / 100;
      // Use Math.round for more accurate calculation
      const plantingAmount = Math.round(remainingP / pPercent);

      const providesN = plantingAmount * (plantingFertilizer.nutrients.n / 100);
      const providesP = plantingAmount * pPercent;

      plantingRecs.push({
        fertilizerId: plantingFertilizer.id,
        brand: plantingFertilizer.brand,
        company: plantingFertilizer.company,
        npk: plantingFertilizer.npk,
        amountKg: plantingAmount,
        packageSizes: plantingFertilizer.packageSizes || ["50kg bag"],
        pricePer50kg: costs.plantingCost || plantingFertilizer.pricePer50kg || 3500,
        provides: {
          n: providesN,
          p: providesP,
          k: 0
        }
      });

      // Update remaining nutrients - SUBTRACT what planting fertilizer provides
      remainingN -= providesN;
      remainingP -= providesP;

      console.log(`📊 PLANTING fertilizer: ${plantingAmount}kg ${plantingFertilizer.brand} provides ${providesN.toFixed(1)}kg N, ${providesP.toFixed(1)}kg P`);
      console.log(`📊 After planting: Remaining N: ${remainingN.toFixed(1)}kg, P: ${remainingP.toFixed(1)}kg, K: ${remainingK.toFixed(1)}kg`);
    }

    // ========== STEP 2: Calculate TOPDRESSING fertilizer (for nitrogen) ==========
    if (remainingN > 0.1 && topdressingFertilizer) {
      const nPercent = topdressingFertilizer.nutrients.n / 100;
      const topdressingAmount = Math.round(remainingN / nPercent);

      const providesN = topdressingAmount * nPercent;

      topdressingRecs.push({
        fertilizerId: topdressingFertilizer.id,
        brand: topdressingFertilizer.brand,
        company: topdressingFertilizer.company,
        npk: topdressingFertilizer.npk,
        amountKg: topdressingAmount,
        packageSizes: topdressingFertilizer.packageSizes || ["50kg bag"],
        pricePer50kg: costs.topdressingCost || topdressingFertilizer.pricePer50kg || 2800,
        provides: {
          n: providesN,
          p: 0,
          k: 0
        }
      });

      remainingN -= providesN;

      console.log(`📊 TOPDRESSING fertilizer: ${topdressingAmount}kg ${topdressingFertilizer.brand} provides ${providesN.toFixed(1)}kg N`);
      console.log(`📊 After topdressing: Remaining N: ${remainingN.toFixed(1)}kg, K: ${remainingK.toFixed(1)}kg`);
    }

    // ========== STEP 3: Calculate POTASSIUM fertilizer ==========
    if (potassiumFertilizer && remainingK > 0 && availableFertilizers.potassium[0] !== "none") {
      const kPercent = potassiumFertilizer.nutrients.k / 100;
      const potassiumAmount = Math.round(remainingK / kPercent);

      const providesK = potassiumAmount * kPercent;

      topdressingRecs.push({
        fertilizerId: potassiumFertilizer.id,
        brand: potassiumFertilizer.brand,
        company: potassiumFertilizer.company,
        npk: potassiumFertilizer.npk,
        amountKg: potassiumAmount,
        packageSizes: potassiumFertilizer.packageSizes || ["50kg bag"],
        pricePer50kg: costs.potassiumCost || potassiumFertilizer.pricePer50kg || 2800,
        provides: {
          n: 0,
          p: 0,
          k: providesK
        }
      });

      remainingK -= providesK;

      console.log(`📊 POTASSIUM fertilizer: ${potassiumAmount}kg ${potassiumFertilizer.brand} provides ${providesK.toFixed(1)}kg K`);
    }

    // Calculate total cost
    const allRecs = [...plantingRecs, ...topdressingRecs];

    // Calculate cost with proper bag + open kg pricing
    const totalCost = allRecs.reduce((sum, rec) => {
      const bagsNeeded = Math.floor(rec.amountKg / 50);
      const extraKg = rec.amountKg % 50;
      const fullBagsCost = bagsNeeded * rec.pricePer50kg;
      const extraKgCost = extraKg * (rec.pricePer50kg / 50);
      return sum + fullBagsCost + extraKgCost;
    }, 0);

    const totalNutrientsProvided = {
      n: nutrients.n - Math.max(0, remainingN),
      p: nutrients.p - Math.max(0, remainingP),
      k: nutrients.k - Math.max(0, remainingK),
      s: 0, ca: 0, mg: 0, zn: 0, b: 0
    };

    console.log(`💰 TOTAL COST: Ksh ${Math.round(totalCost).toLocaleString()}`);
    console.log(`📊 Planting recommendations: ${plantingRecs.length} items`);
    console.log(`📊 Topdressing recommendations: ${topdressingRecs.length} items`);

    return {
      plantingRecommendations: plantingRecs,
      topDressingRecommendations: topdressingRecs,
      totalNutrientsProvided,
      remainingNeeds: { n: remainingN, p: remainingP, k: remainingK, s: 0, ca: 0, mg: 0, zn: 0, b: 0 },
      totalCost: Math.round(totalCost),
      soilTestSummary: null
    };
  }

  // ========== EXTRACT NUTRIENTS FROM FERTILIZER FORMULATION ==========
  extractNutrientsFromRecommendations(rec: {
    plantingFertilizer: string;
    plantingQuantity: number;
    topdressingFertilizer: string;
    topdressingQuantity: number;
    potassiumFertilizer: string;
    potassiumQuantity: number;
  }): NutrientRequirement {

    const parseFertilizer = (name: string, quantity: number) => {
      if (!name || quantity === 0) return { n: 0, p: 0, k: 0 };

      // Handle NPK formulations like "NPK 12.24.12+5S" or "12.24.12+5S"
      const match = name.match(/(\d+)\.?(\d+)?\.?(\d+)?/);
      if (match) {
        const n = parseInt(match[1]) || 0;
        const p = parseInt(match[2]) || 0;
        const k = parseInt(match[3]) || 0;

        return {
          n: (n / 100) * quantity,
          p: (p / 100) * quantity,
          k: (k / 100) * quantity
        };
      }

      // Handle common fertilizers by name
      const lowerName = name.toLowerCase();
      if (lowerName.includes('urea')) {
        return { n: 0.46 * quantity, p: 0, k: 0 };
      }
      if (lowerName.includes('can')) {
        return { n: 0.27 * quantity, p: 0, k: 0 };
      }
      if (lowerName.includes('dap')) {
        return { n: 0.18 * quantity, p: 0.46 * quantity, k: 0 };
      }
      if (lowerName.includes('mop') || lowerName.includes('muriate')) {
        return { n: 0, p: 0, k: 0.6 * quantity };
      }

      return { n: 0, p: 0, k: 0 };
    };

    const planting = parseFertilizer(rec.plantingFertilizer, rec.plantingQuantity);
    const topdressing = parseFertilizer(rec.topdressingFertilizer, rec.topdressingQuantity);
    const potassium = parseFertilizer(rec.potassiumFertilizer, rec.potassiumQuantity);

    return {
      n: planting.n + topdressing.n + potassium.n,
      p: planting.p + topdressing.p + potassium.p,
      k: planting.k + topdressing.k + potassium.k,
      s: 0, ca: 0, mg: 0, zn: 0, b: 0
    };
  }

  // Calculate full fertilizer program (legacy method)
  calculateFertilizerProgram(
    soilTestData: any,
    cropType: string,
    targetYield: number,
    availablePlantingFertilizers: string[],
    availableTopDressingFertilizers: string[]
  ): FertilizerBlendResult {
    const soilResults = soilTestInterpreter.interpretSoilTest(soilTestData);
    const nutrientNeeds = soilTestInterpreter.calculateNutrientRequirements(
      soilResults, cropType, targetYield
    );

    const planting = this.calculateOptimalBlend(
      nutrientNeeds,
      availablePlantingFertilizers,
      'planting'
    );

    const topdressing = this.calculateOptimalBlend(
      planting.remaining,
      availableTopDressingFertilizers,
      'topdressing'
    );

    const totalNutrientsProvided = {
      n: 0, p: 0, k: 0, s: 0, ca: 0, mg: 0, zn: 0, b: 0
    };

    [...planting.recommendations, ...topdressing.recommendations].forEach(rec => {
      totalNutrientsProvided.n += rec.provides.n;
      totalNutrientsProvided.p += rec.provides.p;
      totalNutrientsProvided.k += rec.provides.k;
      if (rec.provides.s) totalNutrientsProvided.s += rec.provides.s;
      if (rec.provides.ca) totalNutrientsProvided.ca += rec.provides.ca;
      if (rec.provides.mg) totalNutrientsProvided.mg += rec.provides.mg;
    });

    const totalCost = [...planting.recommendations, ...topdressing.recommendations].reduce((sum, rec) => {
      const bagsNeeded = Math.ceil(rec.amountKg / 50);
      return sum + (bagsNeeded * (rec.pricePer50kg || 0));
    }, 0);

    return {
      plantingRecommendations: planting.recommendations,
      topDressingRecommendations: topdressing.recommendations,
      totalNutrientsProvided,
      remainingNeeds: topdressing.remaining,
      soilTestSummary: soilResults,
      totalCost
    };
  }

  // ========== GENERATE RECOMMENDATION TEXT - REARRANGED ==========
  generateRecommendationText(result: FertilizerBlendResult, cropType: string, targetYield?: number): string {
    let text = `🌱 PRECISION FERTILIZER PLAN Based on Your Soil Test:\n\n`;

    if (result.totalCost) {
      text += `Total investment: Ksh ${result.totalCost.toLocaleString()} per acre.\n\n`;
    }

    // Show PLANTING fertilizers first
    if (result.plantingRecommendations.length > 0) {
      text += `PLANTING FERTILIZERS (apply at planting):\n`;
      result.plantingRecommendations.forEach((rec: any) => {
        const bagsNeeded = Math.floor(rec.amountKg / 50);
        const extraKg = rec.amountKg % 50;

        const fullBagsCost = bagsNeeded * rec.pricePer50kg;
        const extraKgCost = extraKg * (rec.pricePer50kg / 50);
        const totalCost = fullBagsCost + extraKgCost;

        let bagText = '';
        if (bagsNeeded > 0 && extraKg > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`;
        } else if (bagsNeeded > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg`;
        } else {
          bagText = `${extraKg}kg open`;
        }

        text += `• Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})\n`;
        text += `  This is ${bagText}\n`;
        text += `  Package options: ${rec.packageSizes?.join(", ") || "50kg bag"}\n`;
        text += `  Cost: Ksh ${Math.round(totalCost).toLocaleString()}\n`;
        text += `  Provides: ${rec.provides.n.toFixed(1)} kg N, ${rec.provides.p.toFixed(1)} kg P, ${rec.provides.k.toFixed(1)} kg K\n\n`;
      });
    }

    // Show TOP DRESSING fertilizers second (includes both nitrogen and potassium)
    if (result.topDressingRecommendations.length > 0) {
      text += `TOP DRESSING FERTILIZERS (apply 3-4 weeks after planting):\n`;

      // Separate nitrogen and potassium for clarity
      const nitrogenRecs = result.topDressingRecommendations.filter((rec: any) =>
        rec.provides.n > 0 && rec.provides.k === 0
      );

      const potassiumRecs = result.topDressingRecommendations.filter((rec: any) =>
        rec.provides.k > 0
      );

      // Show nitrogen topdressing first
      nitrogenRecs.forEach((rec: any) => {
        const bagsNeeded = Math.floor(rec.amountKg / 50);
        const extraKg = rec.amountKg % 50;

        const fullBagsCost = bagsNeeded * rec.pricePer50kg;
        const extraKgCost = extraKg * (rec.pricePer50kg / 50);
        const totalCost = fullBagsCost + extraKgCost;

        let bagText = '';
        if (bagsNeeded > 0 && extraKg > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`;
        } else if (bagsNeeded > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg`;
        } else {
          bagText = `${extraKg}kg open`;
        }

        text += `• Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})\n`;
        text += `  This is ${bagText}\n`;
        text += `  Package options: ${rec.packageSizes?.join(", ") || "50kg bag"}\n`;
        text += `  Cost: Ksh ${Math.round(totalCost).toLocaleString()}\n`;
        text += `  Provides: ${rec.provides.n.toFixed(1)} kg N\n\n`;
      });

      // Show potassium topdressing next
      potassiumRecs.forEach((rec: any) => {
        const bagsNeeded = Math.floor(rec.amountKg / 50);
        const extraKg = rec.amountKg % 50;

        const fullBagsCost = bagsNeeded * rec.pricePer50kg;
        const extraKgCost = extraKg * (rec.pricePer50kg / 50);
        const totalCost = fullBagsCost + extraKgCost;

        let bagText = '';
        if (bagsNeeded > 0 && extraKg > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`;
        } else if (bagsNeeded > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg`;
        } else {
          bagText = `${extraKg}kg open`;
        }

        text += `• Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})\n`;
        text += `  This is ${bagText}\n`;
        text += `  Package options: ${rec.packageSizes?.join(", ") || "50kg bag"}\n`;
        text += `  Cost: Ksh ${Math.round(totalCost).toLocaleString()}\n`;
        text += `  Provides: ${rec.provides.k.toFixed(1)} kg K\n\n`;
      });
    }

    // Show TOTAL COST at the end
    if (result.totalCost) {
      text += `💰 TOTAL FERTILIZER INVESTMENT: Ksh ${result.totalCost.toLocaleString()} per acre\n`;
      text += `*Gross margin will be calculated based on your actual yield and costs.*\n`;
    }

    return text;
  }
}

export const fertilizerCalculator = new FertilizerCalculator();