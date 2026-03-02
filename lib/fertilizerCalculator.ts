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
    applicationType: 'planting' | 'topdressing'
  ): {
    recommendations: FertilizerRecommendation[];
    remaining: NutrientRequirement;
  } {
    // Get available fertilizers from database
    const fertilizerDb = applicationType === 'planting' ? plantingFertilizers : topDressingFertilizers;
    const availableFertilizers = fertilizerDb.filter(f => availableFertilizerIds.includes(f.id));

    // Sort by phosphorus content first (most limiting)
    const sortedFertilizers = [...availableFertilizers].sort((a, b) =>
      (b.nutrients.p || 0) - (a.nutrients.p || 0)
    );

    let remaining = { ...nutrientNeeds };
    const recommendations: FertilizerRecommendation[] = [];

    // First pass: Meet phosphorus needs (hardest to find)
    for (const fert of sortedFertilizers) {
      if (remaining.p <= 0.1) continue; // Close enough
      if (!fert.nutrients.p || fert.nutrients.p === 0) continue;

      // Calculate how much of this fertilizer to meet P needs
      const pNeeded = remaining.p;
      const pPercent = fert.nutrients.p / 100;
      const amountKg = Math.ceil(pNeeded / pPercent);

      if (amountKg > 0) {
        recommendations.push({
          fertilizerId: fert.id,
          brand: fert.brand,
          company: fert.company,
          npk: fert.npk,
          amountKg,
          provides: {
            n: amountKg * (fert.nutrients.n / 100),
            p: amountKg * (fert.nutrients.p / 100),
            k: amountKg * (fert.nutrients.k / 100),
            s: fert.nutrients.s ? amountKg * (fert.nutrients.s / 100) : 0,
            ca: fert.nutrients.ca ? amountKg * (fert.nutrients.ca / 100) : 0,
            mg: fert.nutrients.mg ? amountKg * (fert.nutrients.mg / 100) : 0
          }
        });

        // Update remaining needs
        remaining.p -= amountKg * pPercent;
        remaining.n -= amountKg * (fert.nutrients.n / 100);
        remaining.k -= amountKg * (fert.nutrients.k / 100);
        if (fert.nutrients.s) remaining.s -= amountKg * (fert.nutrients.s / 100);
        if (fert.nutrients.ca) remaining.ca -= amountKg * (fert.nutrients.ca / 100);
        if (fert.nutrients.mg) remaining.mg -= amountKg * (fert.nutrients.mg / 100);
      }
    }

    // Second pass: Meet potassium needs
    for (const fert of sortedFertilizers) {
      if (remaining.k <= 0.1) continue;
      if (!fert.nutrients.k || fert.nutrients.k === 0) continue;

      const kNeeded = remaining.k;
      const kPercent = fert.nutrients.k / 100;
      const amountKg = Math.ceil(kNeeded / kPercent);

      if (amountKg > 0) {
        recommendations.push({
          fertilizerId: fert.id,
          brand: fert.brand,
          company: fert.company,
          npk: fert.npk,
          amountKg,
          provides: {
            n: amountKg * (fert.nutrients.n / 100),
            p: amountKg * (fert.nutrients.p / 100),
            k: amountKg * (fert.nutrients.k / 100),
            s: fert.nutrients.s ? amountKg * (fert.nutrients.s / 100) : 0
          }
        });

        remaining.k -= amountKg * kPercent;
        remaining.n -= amountKg * (fert.nutrients.n / 100);
        remaining.p -= amountKg * (fert.nutrients.p / 100);
      }
    }

    // Third pass: Meet nitrogen needs
    for (const fert of sortedFertilizers) {
      if (remaining.n <= 0.1) continue;
      if (!fert.nutrients.n || fert.nutrients.n === 0) continue;

      const nNeeded = remaining.n;
      const nPercent = fert.nutrients.n / 100;
      const amountKg = Math.ceil(nNeeded / nPercent);

      if (amountKg > 0) {
        recommendations.push({
          fertilizerId: fert.id,
          brand: fert.brand,
          company: fert.company,
          npk: fert.npk,
          amountKg,
          provides: {
            n: amountKg * (fert.nutrients.n / 100),
            p: amountKg * (fert.nutrients.p / 100),
            k: amountKg * (fert.nutrients.k / 100)
          }
        });

        remaining.n -= amountKg * nPercent;
      }
    }

    // Round remaining values
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

  // Calculate full fertilizer program
  calculateFertilizerProgram(
    soilTestData: any,
    cropType: string,
    targetYield: number,
    availablePlantingFertilizers: string[],
    availableTopDressingFertilizers: string[]
  ): FertilizerBlendResult {
    // Interpret soil test
    const soilResults = soilTestInterpreter.interpretSoilTest(soilTestData);

    // Calculate nutrient requirements
    const nutrientNeeds = soilTestInterpreter.calculateNutrientRequirements(
      soilResults, cropType, targetYield
    );

    // Calculate planting blend
    const planting = this.calculateOptimalBlend(
      nutrientNeeds,
      availablePlantingFertilizers,
      'planting'
    );

    // Calculate topdressing blend (for remaining N and K)
    const topdressing = this.calculateOptimalBlend(
      planting.remaining,
      availableTopDressingFertilizers,
      'topdressing'
    );

    // Calculate total nutrients provided
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

    return {
      plantingRecommendations: planting.recommendations,
      topDressingRecommendations: topdressing.recommendations,
      totalNutrientsProvided,
      remainingNeeds: topdressing.remaining,
      soilTestSummary: soilResults
    };
  }

  // Generate human-readable recommendation
  generateRecommendationText(result: FertilizerBlendResult, cropType: string): string {
    let text = `🌱 **FERTILIZER RECOMMENDATION FOR ${cropType.toUpperCase()}**\n\n`;

    // Soil test summary
    text += `**Soil Test Summary:**\n`;
    text += `- pH: ${result.soilTestSummary.ph} (${result.soilTestSummary.phRating})\n`;
    text += `- Phosphorus: ${result.soilTestSummary.phosphorus} ppm (${result.soilTestSummary.phosphorusRating})\n`;
    text += `- Potassium: ${result.soilTestSummary.potassium} ppm (${result.soilTestSummary.potassiumRating})\n`;
    text += `- Organic Matter: ${result.soilTestSummary.organicMatter}% (${result.soilTestSummary.organicMatterRating})\n\n`;

    // Planting recommendations
    if (result.plantingRecommendations.length > 0) {
      text += `**PLANTING FERTILIZERS (Apply at planting):**\n`;
      result.plantingRecommendations.forEach(rec => {
        text += `- Buy **${rec.amountKg} kg** of **${rec.brand}** (${rec.npk})\n`;
        text += `  From: ${rec.company}\n`;
        text += `  Provides: ${rec.provides.n.toFixed(1)} kg N, ${rec.provides.p.toFixed(1)} kg P, ${rec.provides.k.toFixed(1)} kg K\n`;
      });
      text += `\n`;
    }

    // Top dressing recommendations
    if (result.topDressingRecommendations.length > 0) {
      text += `**TOP DRESSING FERTILIZERS (Apply 3-4 weeks after planting):**\n`;
      result.topDressingRecommendations.forEach(rec => {
        text += `- Buy **${rec.amountKg} kg** of **${rec.brand}** (${rec.npk})\n`;
        text += `  From: ${rec.company}\n`;
        text += `  Provides: ${rec.provides.n.toFixed(1)} kg N, ${rec.provides.k.toFixed(1)} kg K\n`;
      });
      text += `\n`;
    }

    // Total nutrients summary
    text += `**Total Nutrients Applied:**\n`;
    text += `- Nitrogen (N): ${result.totalNutrientsProvided.n.toFixed(1)} kg\n`;
    text += `- Phosphorus (P): ${result.totalNutrientsProvided.p.toFixed(1)} kg\n`;
    text += `- Potassium (K): ${result.totalNutrientsProvided.k.toFixed(1)} kg\n`;
    if (result.totalNutrientsProvided.s > 0) {
      text += `- Sulphur (S): ${result.totalNutrientsProvided.s.toFixed(1)} kg\n`;
    }

    return text;
  }
}

export const fertilizerCalculator = new FertilizerCalculator();