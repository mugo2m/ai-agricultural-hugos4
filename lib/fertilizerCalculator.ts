// lib/fertilizerCalculator.ts
// Core calculation logic for converting soil tests to fertilizer kg

import { SoilTestResults, NutrientRequirement, FertilizerRecommendation, FertilizerBlendResult } from '@/types/soilTest';
import { plantingFertilizers, getPlantingFertilizerById } from './fertilizers/plantingFertilizers';
import { topDressingFertilizers, getTopDressingFertilizerById } from './fertilizers/topDressingFertilizers';
import { soilTestInterpreter } from './soilTestInterpreter';
// Import spacing and per-plant utilities
import { calculatePlantsPerAcre, calculateTotalPlants, calculateFertilizerPerPlant, getMeasurementGuide } from './utils';

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
        // Use Math.round for accurate calculation
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

  // ========== CALCULATE FROM FARMER'S SOIL TEST RECOMMENDATIONS ==========
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
    },
    // Add farmSize parameter
    farmSize: number = 1,
    // Add spacing parameter for per-plant calculations
    spacing?: { rowCm: number; plantCm: number; seedsPerHole: number; label: string }
  ): FertilizerBlendResult & {
    perAcrePlanting?: FertilizerRecommendation[];
    perAcreTopdressing?: FertilizerRecommendation[];
    farmSize?: number;
    perPlant?: any;
  } {

    // STEP 1: Extract nutrients from recommendations (PER ACRE)
    const nutrientsPerAcre = this.extractNutrientsFromRecommendations(recommendations);

    console.log("📊 Nutrients needed PER ACRE:", nutrientsPerAcre);
    console.log("📊 Target yield:", recommendations.targetYield, "bags/acre");
    console.log("📊 Farm size:", farmSize, "acres");

    // Get fertilizer objects from database
    const plantingFertilizer = plantingFertilizers.find(f => f.id === availableFertilizers.planting[0]);
    const topdressingFertilizer = topDressingFertilizers.find(f => f.id === availableFertilizers.topdressing[0]);
    const potassiumFertilizer = topDressingFertilizers.find(f => f.id === availableFertilizers.potassium[0]);

    console.log("📦 Available fertilizers:", {
      planting: plantingFertilizer?.brand || "none",
      topdressing: topdressingFertilizer?.brand || "none",
      potassium: potassiumFertilizer?.brand || "none"
    });

    // ========== STEP 1: Calculate PLANTING fertilizer PER ACRE ==========
    let remainingNPerAcre = nutrientsPerAcre.n;
    let remainingPPerAcre = nutrientsPerAcre.p;
    let remainingKPerAcre = nutrientsPerAcre.k;

    const plantingRecsPerAcre: FertilizerRecommendation[] = [];
    const topdressingRecsPerAcre: FertilizerRecommendation[] = [];

    // Calculate planting fertilizer for phosphorus needs (PER ACRE)
    if (plantingFertilizer && remainingPPerAcre > 0) {
      const pPercent = plantingFertilizer.nutrients.p / 100;
      const plantingAmountPerAcre = Math.round(remainingPPerAcre / pPercent);

      const providesNPerAcre = plantingAmountPerAcre * (plantingFertilizer.nutrients.n / 100);
      const providesPPerAcre = plantingAmountPerAcre * pPercent;

      plantingRecsPerAcre.push({
        fertilizerId: plantingFertilizer.id,
        brand: plantingFertilizer.brand,
        company: plantingFertilizer.company,
        npk: plantingFertilizer.npk,
        amountKg: plantingAmountPerAcre,
        packageSizes: plantingFertilizer.packageSizes || ["50kg bag"],
        pricePer50kg: costs.plantingCost || plantingFertilizer.pricePer50kg || 3500,
        provides: {
          n: providesNPerAcre,
          p: providesPPerAcre,
          k: 0
        }
      });

      // ✅ CRITICAL: Subtract planting fertilizer N from total
      remainingNPerAcre -= providesNPerAcre;
      remainingPPerAcre -= providesPPerAcre;

      console.log(`📊 PLANTING fertilizer PER ACRE: ${plantingAmountPerAcre}kg provides ${providesNPerAcre.toFixed(1)}kg N`);
      console.log(`📊 After planting: Remaining N per acre: ${remainingNPerAcre.toFixed(1)}kg`);
    }

    // ========== STEP 2: Calculate TOPDRESSING fertilizer PER ACRE ==========
    if (remainingNPerAcre > 0.1 && topdressingFertilizer) {
      const nPercent = topdressingFertilizer.nutrients.n / 100;
      const topdressingAmountPerAcre = Math.round(remainingNPerAcre / nPercent);

      const providesNPerAcre = topdressingAmountPerAcre * nPercent;

      topdressingRecsPerAcre.push({
        fertilizerId: topdressingFertilizer.id,
        brand: topdressingFertilizer.brand,
        company: topdressingFertilizer.company,
        npk: topdressingFertilizer.npk,
        amountKg: topdressingAmountPerAcre,
        packageSizes: topdressingFertilizer.packageSizes || ["50kg bag"],
        pricePer50kg: costs.topdressingCost || topdressingFertilizer.pricePer50kg || 2800,
        provides: {
          n: providesNPerAcre,
          p: 0,
          k: 0
        }
      });

      remainingNPerAcre -= providesNPerAcre;

      console.log(`📊 TOPDRESSING fertilizer PER ACRE: ${topdressingAmountPerAcre}kg provides ${providesNPerAcre.toFixed(1)}kg N`);
    }

    // ========== STEP 3: Calculate POTASSIUM fertilizer PER ACRE ==========
    if (potassiumFertilizer && remainingKPerAcre > 0 && availableFertilizers.potassium[0] !== "none") {
      const kPercent = potassiumFertilizer.nutrients.k / 100;
      const potassiumAmountPerAcre = Math.round(remainingKPerAcre / kPercent);

      const providesKPerAcre = potassiumAmountPerAcre * kPercent;

      topdressingRecsPerAcre.push({
        fertilizerId: potassiumFertilizer.id,
        brand: potassiumFertilizer.brand,
        company: potassiumFertilizer.company,
        npk: potassiumFertilizer.npk,
        amountKg: potassiumAmountPerAcre,
        packageSizes: potassiumFertilizer.packageSizes || ["50kg bag"],
        pricePer50kg: costs.potassiumCost || potassiumFertilizer.pricePer50kg || 2800,
        provides: {
          n: 0,
          p: 0,
          k: providesKPerAcre
        }
      });

      remainingKPerAcre -= providesKPerAcre;

      console.log(`📊 POTASSIUM fertilizer PER ACRE: ${potassiumAmountPerAcre}kg provides ${providesKPerAcre.toFixed(1)}kg K`);
    }

    // ========== STEP 4: Scale to FARM SIZE ==========
    const plantingRecs = plantingRecsPerAcre.map(rec => ({
      ...rec,
      amountKg: Math.round(rec.amountKg * farmSize)
    }));

    const topdressingRecs = topdressingRecsPerAcre.map(rec => ({
      ...rec,
      amountKg: Math.round(rec.amountKg * farmSize)
    }));

    // Calculate total cost for entire farm with proper breakdown
    const allRecs = [...plantingRecs, ...topdressingRecs];
    const totalCost = allRecs.reduce((sum, rec) => {
      const bagsNeeded = Math.floor(rec.amountKg / 50);
      const extraKg = rec.amountKg % 50;
      const fullBagsCost = bagsNeeded * rec.pricePer50kg;
      const extraKgCost = extraKg * (rec.pricePer50kg / 50);
      return sum + fullBagsCost + extraKgCost;
    }, 0);

    const totalNutrientsProvided = {
      n: nutrientsPerAcre.n * farmSize - Math.max(0, remainingNPerAcre * farmSize),
      p: nutrientsPerAcre.p * farmSize - Math.max(0, remainingPPerAcre * farmSize),
      k: nutrientsPerAcre.k * farmSize - Math.max(0, remainingKPerAcre * farmSize),
      s: 0, ca: 0, mg: 0, zn: 0, b: 0
    };

    // ========== STEP 5: Calculate per-plant information if spacing provided ==========
    let perPlantInfo = null;
    if (spacing) {
      const plantsPerAcre = calculatePlantsPerAcre({
        rowCm: spacing.rowCm,
        plantCm: spacing.plantCm,
        seedsPerHole: spacing.seedsPerHole
      });

      const totalPlants = calculateTotalPlants(plantsPerAcre, farmSize);

      // Get per-acre amounts for each fertilizer type
      const dapPerAcre = plantingRecsPerAcre.find(r => r.brand.includes('DAP'))?.amountKg || 0;
      const ureaPerAcre = topdressingRecsPerAcre.find(r => r.brand.includes('UREA'))?.amountKg || 0;
      const mopPerAcre = topdressingRecsPerAcre.find(r => r.brand.includes('MOP'))?.amountKg || 0;

      const perPlant = calculateFertilizerPerPlant(
        dapPerAcre * farmSize,
        ureaPerAcre * farmSize,
        mopPerAcre * farmSize,
        totalPlants
      );

      perPlantInfo = {
        plantsPerAcre,
        totalPlants,
        dapGrams: perPlant.dapGrams,
        ureaGrams: perPlant.ureaGrams,
        mopGrams: perPlant.mopGrams,
        totalGrams: perPlant.totalGrams,
        dapGuide: getMeasurementGuide(perPlant.dapGrams),
        ureaGuide: getMeasurementGuide(perPlant.ureaGrams),
        mopGuide: getMeasurementGuide(perPlant.mopGrams),
        totalGuide: getMeasurementGuide(perPlant.totalGrams)
      };

      console.log(`📊 Plants per acre: ${plantsPerAcre.toLocaleString()}`);
      console.log(`📊 Total plants: ${totalPlants.toLocaleString()}`);
      console.log(`📊 Per plant: DAP ${perPlant.dapGrams}g, UREA ${perPlant.ureaGrams}g, MOP ${perPlant.mopGrams}g`);
    }

    console.log(`💰 TOTAL COST for ${farmSize} acre(s): Ksh ${Math.round(totalCost).toLocaleString()}`);

    return {
      plantingRecommendations: plantingRecs,
      topDressingRecommendations: topdressingRecs,
      perAcrePlanting: plantingRecsPerAcre,
      perAcreTopdressing: topdressingRecsPerAcre,
      totalNutrientsProvided,
      remainingNeeds: {
        n: remainingNPerAcre * farmSize,
        p: remainingPPerAcre * farmSize,
        k: remainingKPerAcre * farmSize,
        s: 0, ca: 0, mg: 0, zn: 0, b: 0
      },
      totalCost: Math.round(totalCost),
      farmSize,
      perPlant: perPlantInfo,
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

  // ========== GENERATE RECOMMENDATION TEXT - IMPROVED DISPLAY ==========
  generateRecommendationText(result: any, cropType: string, targetYield?: number): string {
    let text = `🌱 PRECISION FERTILIZER PLAN Based on Your Soil Test:\n\n`;

    if (result.farmSize) {
      text += `Your farm size: ${result.farmSize} acre(s)\n`;
    }

    if (result.totalCost) {
      text += `Total investment: Ksh ${result.totalCost.toLocaleString()} for your entire farm.\n\n`;
    }

    // Show PLANTING fertilizers
    if (result.plantingRecommendations?.length > 0) {
      text += `PLANTING FERTILIZERS (apply at planting):\n`;
      result.plantingRecommendations.forEach((rec: any) => {
        const bagsNeeded = Math.floor(rec.amountKg / 50);
        const extraKg = rec.amountKg % 50;
        const pricePerKg = rec.pricePer50kg / 50;

        const fullBagsCost = bagsNeeded * rec.pricePer50kg;
        const extraKgCost = extraKg * pricePerKg;
        const totalCost = fullBagsCost + extraKgCost;

        let bagText = '';
        let costBreakdown = '';

        if (bagsNeeded > 0 && extraKg > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`;
          costBreakdown = ` (${bagsNeeded} bag × Ksh ${rec.pricePer50kg.toLocaleString()} + ${extraKg}kg × Ksh ${Math.round(pricePerKg).toLocaleString()})`;
        } else if (bagsNeeded > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg`;
          costBreakdown = ` (${bagsNeeded} bag × Ksh ${rec.pricePer50kg.toLocaleString()})`;
        } else {
          bagText = `${extraKg}kg open`;
          costBreakdown = ` (${extraKg}kg × Ksh ${Math.round(pricePerKg).toLocaleString()})`;
        }

        text += `• Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})\n`;
        text += `  This is ${bagText}\n`;
        text += `  Package options: ${rec.packageSizes?.join(", ") || "50kg bag"}\n`;
        text += `  Cost: Ksh ${Math.round(totalCost).toLocaleString()}${costBreakdown}\n`;
        text += `  Provides: ${(rec.provides.n * (result.farmSize || 1)).toFixed(1)} kg N, ${(rec.provides.p * (result.farmSize || 1)).toFixed(1)} kg P, ${(rec.provides.k * (result.farmSize || 1)).toFixed(1)} kg K\n\n`;
      });
    }

    // Show TOP DRESSING fertilizers
    if (result.topDressingRecommendations?.length > 0) {
      text += `TOP DRESSING FERTILIZERS (apply 3-4 weeks after planting):\n`;

      result.topDressingRecommendations.forEach((rec: any) => {
        const bagsNeeded = Math.floor(rec.amountKg / 50);
        const extraKg = rec.amountKg % 50;
        const pricePerKg = rec.pricePer50kg / 50;

        const fullBagsCost = bagsNeeded * rec.pricePer50kg;
        const extraKgCost = extraKg * pricePerKg;
        const totalCost = fullBagsCost + extraKgCost;

        let bagText = '';
        let costBreakdown = '';

        if (bagsNeeded > 0 && extraKg > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`;
          costBreakdown = ` (${bagsNeeded} bag × Ksh ${rec.pricePer50kg.toLocaleString()} + ${extraKg}kg × Ksh ${Math.round(pricePerKg).toLocaleString()})`;
        } else if (bagsNeeded > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg`;
          costBreakdown = ` (${bagsNeeded} bag × Ksh ${rec.pricePer50kg.toLocaleString()})`;
        } else {
          bagText = `${extraKg}kg open`;
          costBreakdown = ` (${extraKg}kg × Ksh ${Math.round(pricePerKg).toLocaleString()})`;
        }

        text += `• Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})\n`;
        text += `  This is ${bagText}\n`;
        text += `  Package options: ${rec.packageSizes?.join(", ") || "50kg bag"}\n`;
        text += `  Cost: Ksh ${Math.round(totalCost).toLocaleString()}${costBreakdown}\n`;

        if (rec.provides.n > 0) {
          text += `  Provides: ${(rec.provides.n * (result.farmSize || 1)).toFixed(1)} kg N\n\n`;
        } else {
          text += `  Provides: ${(rec.provides.k * (result.farmSize || 1)).toFixed(1)} kg K\n\n`;
        }
      });
    }

    text += `💰 TOTAL FERTILIZER INVESTMENT: Ksh ${result.totalCost?.toLocaleString()} for your ${result.farmSize || 1} acre farm\n\n`;

    // ========== PER PLANT CALCULATION ==========
    if (result.perPlant) {
      const pp = result.perPlant;

      text += `---\n\n`;
      text += `### PLANT POPULATION\n`;
      text += `Based on your spacing, you have approximately **${pp.totalPlants.toLocaleString()} plants** on your ${result.farmSize} acre farm.\n\n`;

      text += `### FERTILIZER PER PLANT (CONSTANT for any farm size)\n`;
      text += `| Fertilizer | Per Plant |\n`;
      text += `|------------|-----------|\n`;
      text += `| DAP | **${pp.dapGrams} grams** |\n`;
      text += `| UREA | **${pp.ureaGrams} grams** |\n`;
      text += `| MOP | **${pp.mopGrams} grams** |\n`;
      text += `| **TOTAL** | **${pp.totalGrams} grams** |\n\n`;

      text += `### 📏 MEASUREMENT GUIDE\n`;
      text += `| Amount | Visual Guide |\n`;
      text += `|--------|--------------|\n`;
      text += `| **${pp.dapGrams} g** | ${pp.dapGuide} |\n`;
      text += `| **${pp.ureaGrams} g** | ${pp.ureaGuide} |\n`;
      text += `| **${pp.mopGrams} g** | ${pp.mopGuide} |\n`;
      text += `| **${pp.totalGrams} g** | ${pp.totalGuide} |\n\n`;
    }

    text += `*Gross margin will be calculated based on your actual yield and costs.*\n`;

    return text;
  }
}

export const fertilizerCalculator = new FertilizerCalculator();