// lib/soilTestInterpreter.ts
// Add these functions to your existing file

export interface FertilizerIntervention {
  nutrient: string;
  level: string;
  value: number;
  recommendation: string;
  fertilizerOptions: {
    name: string;
    amountKg: number;
    cost?: number;
    provides: Record<string, number>;
  }[];
  applicationTiming: string;
}

export class SoilTestInterpreter {

  // ... existing code ...

  // ========== GENERATE INTERVENTION FOR EACH DEFICIENT NUTRIENT ==========
  generateNutrientInterventions(soilResults: SoilTestResults, cropType: string): FertilizerIntervention[] {
    const interventions: FertilizerIntervention[] = [];

    // pH Intervention
    if (soilResults.ph < 5.5) {
      const limeNeeded = Math.ceil((6.5 - soilResults.ph) * 2000); // 2000kg per pH unit
      interventions.push({
        nutrient: "pH",
        level: soilResults.phRating,
        value: soilResults.ph,
        recommendation: `Your soil pH is ${soilResults.ph} (${soilResults.phRating}/Acidic). Apply ${limeNeeded} kg of agricultural lime per acre to raise pH to optimal levels.`,
        fertilizerOptions: [
          {
            name: "Agricultural Lime (CaCO₃)",
            amountKg: limeNeeded,
            cost: limeNeeded * 4, // Approx Ksh 4/kg
            provides: { ca: limeNeeded * 0.4 } // 40% calcium
          }
        ],
        applicationTiming: "Apply 2-3 weeks before planting and incorporate into soil"
      });
    } else if (soilResults.ph > 8.0) {
      const sulphurNeeded = Math.ceil((soilResults.ph - 7.0) * 500);
      interventions.push({
        nutrient: "pH",
        level: soilResults.phRating,
        value: soilResults.ph,
        recommendation: `Your soil pH is ${soilResults.ph} (${soilResults.phRating}/Alkaline). Apply ${sulphurNeeded} kg of elemental sulphur per acre to lower pH.`,
        fertilizerOptions: [
          {
            name: "Elemental Sulphur",
            amountKg: sulphurNeeded,
            cost: sulphurNeeded * 50,
            provides: { s: sulphurNeeded * 0.9 }
          },
          {
            name: "Gypsum (CaSO₄)",
            amountKg: sulphurNeeded * 5,
            cost: sulphurNeeded * 5 * 10,
            provides: { ca: sulphurNeeded * 5 * 0.23, s: sulphurNeeded * 5 * 0.18 }
          }
        ],
        applicationTiming: "Apply 2-3 months before planting and water well"
      });
    }

    // Phosphorus Intervention
    if (soilResults.phosphorus < 15) {
      const pNeeded = 30; // Target 30 kg P₂O₅ per acre
      const dapNeeded = Math.ceil(pNeeded / 0.46); // DAP has 46% P₂O₅
      const tspNeeded = Math.ceil(pNeeded / 0.46); // TSP also 46% P₂O₅
      const sspNeeded = Math.ceil(pNeeded / 0.20); // SSP has 20% P₂O₅

      interventions.push({
        nutrient: "Phosphorus (P)",
        level: soilResults.phosphorusRating,
        value: soilResults.phosphorus,
        recommendation: `Your soil Phosphorus is ${soilResults.phosphorus} ppm (${soilResults.phosphorusRating}). Apply ${pNeeded} kg P₂O₅ per acre using one of these options:`,
        fertilizerOptions: [
          {
            name: "DAP (18-46-0)",
            amountKg: dapNeeded,
            cost: Math.ceil(dapNeeded / 50) * 3500, // 50kg bags at Ksh 3500
            provides: { p: pNeeded, n: dapNeeded * 0.18 }
          },
          {
            name: "TSP (0-46-0)",
            amountKg: tspNeeded,
            cost: Math.ceil(tspNeeded / 50) * 3200,
            provides: { p: pNeeded }
          },
          {
            name: "SSP (0-20-0-12S)",
            amountKg: sspNeeded,
            cost: Math.ceil(sspNeeded / 50) * 2800,
            provides: { p: pNeeded, s: sspNeeded * 0.12 }
          }
        ],
        applicationTiming: "Apply at planting time, placed 5cm from seed"
      });
    } else if (soilResults.phosphorus < 30) {
      const pNeeded = 20;
      const dapNeeded = Math.ceil(pNeeded / 0.46);
      interventions.push({
        nutrient: "Phosphorus (P)",
        level: soilResults.phosphorusRating,
        value: soilResults.phosphorus,
        recommendation: `Your soil Phosphorus is ${soilResults.phosphorus} ppm (${soilResults.phosphorusRating}). Apply ${pNeeded} kg P₂O₅ per acre as maintenance.`,
        fertilizerOptions: [
          {
            name: "DAP (18-46-0)",
            amountKg: dapNeeded,
            cost: Math.ceil(dapNeeded / 50) * 3500,
            provides: { p: pNeeded, n: dapNeeded * 0.18 }
          }
        ],
        applicationTiming: "Apply at planting time"
      });
    }

    // Potassium Intervention
    if (soilResults.potassium < 100) {
      const kNeeded = 40; // Target 40 kg K₂O per acre
      const mopNeeded = Math.ceil(kNeeded / 0.60); // MOP has 60% K₂O
      const sopNeeded = Math.ceil(kNeeded / 0.50); // SOP has 50% K₂O

      interventions.push({
        nutrient: "Potassium (K)",
        level: soilResults.potassiumRating,
        value: soilResults.potassium,
        recommendation: `Your soil Potassium is ${soilResults.potassium} ppm (${soilResults.potassiumRating}). Apply ${kNeeded} kg K₂O per acre using:`,
        fertilizerOptions: [
          {
            name: "MOP (0-0-60)",
            amountKg: mopNeeded,
            cost: Math.ceil(mopNeeded / 50) * 2800,
            provides: { k: kNeeded }
          },
          {
            name: "SOP (0-0-50-18S)",
            amountKg: sopNeeded,
            cost: Math.ceil(sopNeeded / 50) * 3200,
            provides: { k: kNeeded, s: sopNeeded * 0.18 }
          }
        ],
        applicationTiming: "Apply at planting time or as split application"
      });
    } else if (soilResults.potassium < 200) {
      const kNeeded = 20;
      const mopNeeded = Math.ceil(kNeeded / 0.60);
      interventions.push({
        nutrient: "Potassium (K)",
        level: soilResults.potassiumRating,
        value: soilResults.potassium,
        recommendation: `Your soil Potassium is ${soilResults.potassium} ppm (${soilResults.potassiumRating}). Apply ${kNeeded} kg K₂O per acre as maintenance.`,
        fertilizerOptions: [
          {
            name: "MOP (0-0-60)",
            amountKg: mopNeeded,
            cost: Math.ceil(mopNeeded / 50) * 2800,
            provides: { k: kNeeded }
          }
        ],
        applicationTiming: "Apply at planting time"
      });
    }

    // Nitrogen Intervention
    if (soilResults.totalNitrogen < 0.1) {
      const nNeeded = 60; // Target 60 kg N per acre
      const ureaNeeded = Math.ceil(nNeeded / 0.46);
      const canNeeded = Math.ceil(nNeeded / 0.27);
      const asNeeded = Math.ceil(nNeeded / 0.21);

      interventions.push({
        nutrient: "Nitrogen (N)",
        level: soilResults.totalNitrogenRating,
        value: soilResults.totalNitrogen,
        recommendation: `Your soil Nitrogen is ${soilResults.totalNitrogen}% (${soilResults.totalNitrogenRating}). Apply ${nNeeded} kg N per acre as topdressing:`,
        fertilizerOptions: [
          {
            name: "UREA (46-0-0)",
            amountKg: ureaNeeded,
            cost: Math.ceil(ureaNeeded / 50) * 2800,
            provides: { n: nNeeded }
          },
          {
            name: "CAN (27-0-0)",
            amountKg: canNeeded,
            cost: Math.ceil(canNeeded / 50) * 2500,
            provides: { n: nNeeded, ca: canNeeded * 0.08 }
          },
          {
            name: "Ammonium Sulphate (21-0-0-23S)",
            amountKg: asNeeded,
            cost: Math.ceil(asNeeded / 50) * 2200,
            provides: { n: nNeeded, s: asNeeded * 0.23 }
          }
        ],
        applicationTiming: "Apply as topdressing 3-4 weeks after planting"
      });
    } else if (soilResults.totalNitrogen < 0.2) {
      const nNeeded = 40;
      const ureaNeeded = Math.ceil(nNeeded / 0.46);
      interventions.push({
        nutrient: "Nitrogen (N)",
        level: soilResults.totalNitrogenRating,
        value: soilResults.totalNitrogen,
        recommendation: `Your soil Nitrogen is ${soilResults.totalNitrogen}% (${soilResults.totalNitrogenRating}). Apply ${nNeeded} kg N per acre as topdressing.`,
        fertilizerOptions: [
          {
            name: "UREA (46-0-0)",
            amountKg: ureaNeeded,
            cost: Math.ceil(ureaNeeded / 50) * 2800,
            provides: { n: nNeeded }
          }
        ],
        applicationTiming: "Apply 3-4 weeks after planting"
      });
    }

    // Organic Matter Intervention
    if (soilResults.organicMatter < 2.0) {
      const manureNeeded = 5000; // 5 tons per acre
      interventions.push({
        nutrient: "Organic Matter",
        level: soilResults.organicMatterRating,
        value: soilResults.organicMatter,
        recommendation: `Your soil Organic Matter is ${soilResults.organicMatter}% (${soilResults.organicMatterRating}/Very Low). Apply ${manureNeeded/1000} tons of well-decomposed manure per acre.`,
        fertilizerOptions: [
          {
            name: "Farmyard Manure",
            amountKg: manureNeeded,
            cost: manureNeeded * 3, // Ksh 3/kg
            provides: { n: manureNeeded * 0.005, p: manureNeeded * 0.002, k: manureNeeded * 0.005, om: manureNeeded }
          },
          {
            name: "Compost",
            amountKg: manureNeeded,
            cost: manureNeeded * 2.5,
            provides: { n: manureNeeded * 0.007, p: manureNeeded * 0.003, k: manureNeeded * 0.006, om: manureNeeded }
          }
        ],
        applicationTiming: "Apply 2-3 weeks before planting and incorporate into soil"
      });
    } else if (soilResults.organicMatter < 3.4) {
      const manureNeeded = 3000;
      interventions.push({
        nutrient: "Organic Matter",
        level: soilResults.organicMatterRating,
        value: soilResults.organicMatter,
        recommendation: `Your soil Organic Matter is ${soilResults.organicMatter}% (${soilResults.organicMatterRating}). Apply 3 tons of manure per acre to improve soil structure.`,
        fertilizerOptions: [
          {
            name: "Farmyard Manure",
            amountKg: manureNeeded,
            cost: manureNeeded * 3,
            provides: { om: manureNeeded }
          }
        ],
        applicationTiming: "Apply before planting"
      });
    }

    // Calcium Intervention
    if (soilResults.calcium < 400) {
      const gypsumNeeded = 500;
      interventions.push({
        nutrient: "Calcium (Ca)",
        level: soilResults.calciumRating,
        value: soilResults.calcium,
        recommendation: `Your soil Calcium is ${soilResults.calcium} ppm (${soilResults.calciumRating}). Apply 500 kg gypsum per acre.`,
        fertilizerOptions: [
          {
            name: "Gypsum (CaSO₄)",
            amountKg: gypsumNeeded,
            cost: gypsumNeeded * 10,
            provides: { ca: gypsumNeeded * 0.23, s: gypsumNeeded * 0.18 }
          }
        ],
        applicationTiming: "Apply at any time, preferably before planting"
      });
    }

    // Magnesium Intervention
    if (soilResults.magnesium < 50) {
      const dolomiteNeeded = 300;
      interventions.push({
        nutrient: "Magnesium (Mg)",
        level: soilResults.magnesiumRating,
        value: soilResults.magnesium,
        recommendation: `Your soil Magnesium is ${soilResults.magnesium} ppm (${soilResults.magnesiumRating}). Apply 300 kg dolomitic lime per acre.`,
        fertilizerOptions: [
          {
            name: "Dolomitic Lime",
            amountKg: dolomiteNeeded,
            cost: dolomiteNeeded * 5,
            provides: { mg: dolomiteNeeded * 0.12, ca: dolomiteNeeded * 0.22 }
          }
        ],
        applicationTiming: "Apply 2-3 weeks before planting"
      });
    }

    // Sulphur Intervention
    if (soilResults.organicCarbon && soilResults.organicCarbon < 1.0) {
      const sulphurNeeded = 50;
      interventions.push({
        nutrient: "Sulphur (S)",
        level: soilResults.organicCarbonRating,
        value: soilResults.organicCarbon,
        recommendation: `Your soil Sulphur is low. Apply 50 kg elemental sulphur or use SSP/ASN fertilizers.`,
        fertilizerOptions: [
          {
            name: "Elemental Sulphur",
            amountKg: sulphurNeeded,
            cost: sulphurNeeded * 50,
            provides: { s: sulphurNeeded * 0.9 }
          },
          {
            name: "SSP (0-20-0-12S)",
            amountKg: 250,
            cost: 250 * 56, // Ksh 56/kg
            provides: { p: 50, s: 30 }
          }
        ],
        applicationTiming: "Apply 2-3 weeks before planting"
      });
    }

    return interventions;
  }

  // ========== GENERATE COMPLETE FERTILIZER PLAN ==========
  generateCompleteFertilizerPlan(
    soilResults: SoilTestResults,
    cropType: string,
    availableFertilizers?: string[]
  ): {
    interventions: FertilizerIntervention[];
    plantingFertilizers: any[];
    topdressingFertilizers: any[];
    totalCost: number;
    summary: string;
  } {
    const interventions = this.generateNutrientInterventions(soilResults, cropType);

    const plantingFertilizers: any[] = [];
    const topdressingFertilizers: any[] = [];
    let totalCost = 0;

    interventions.forEach(intervention => {
      // Select the best option (first one by default)
      const selectedOption = intervention.fertilizerOptions[0];
      if (selectedOption) {
        totalCost += selectedOption.cost || 0;

        if (intervention.nutrient === "Nitrogen (N)") {
          topdressingFertilizers.push({
            nutrient: intervention.nutrient,
            selected: selectedOption,
            timing: intervention.applicationTiming
          });
        } else {
          plantingFertilizers.push({
            nutrient: intervention.nutrient,
            selected: selectedOption,
            timing: intervention.applicationTiming
          });
        }
      }
    });

    const summary = this.generatePlanSummary(interventions, plantingFertilizers, topdressingFertilizers, totalCost);

    return {
      interventions,
      plantingFertilizers,
      topdressingFertilizers,
      totalCost,
      summary
    };
  }

  // ========== GENERATE HUMAN-READABLE SUMMARY ==========
  generatePlanSummary(
    interventions: FertilizerIntervention[],
    planting: any[],
    topdressing: any[],
    totalCost: number
  ): string {
    let summary = "🌱 **YOUR PRECISION FERTILIZER PLAN**\n\n";

    if (interventions.length === 0) {
      return "✅ Your soil nutrient levels are optimal. No fertilizer interventions needed at this time.";
    }

    summary += `Based on your soil test, the following nutrients are deficient:\n\n`;

    interventions.forEach(intervention => {
      summary += `⚠️ **${intervention.nutrient}**: ${intervention.value} (${intervention.level})\n`;
    });

    summary += `\n**INTERVENTIONS:**\n\n`;

    planting.forEach((item, index) => {
      summary += `${index + 1}. **${item.nutrient} Deficiency**\n`;
      summary += `   Apply **${item.selected.amountKg} kg** of **${item.selected.name}**\n`;
      summary += `   Cost: Ksh ${item.selected.cost?.toLocaleString()}\n`;
      summary += `   Provides: ${Object.entries(item.selected.provides).map(([k, v]) => `${v} kg ${k}`).join(', ')}\n`;
      summary += `   Timing: ${item.timing}\n\n`;
    });

    if (topdressing.length > 0) {
      summary += `**TOPDRESSING APPLICATIONS:**\n\n`;
      topdressing.forEach((item, index) => {
        summary += `• Apply **${item.selected.amountKg} kg** of **${item.selected.name}**\n`;
        summary += `  Cost: Ksh ${item.selected.cost?.toLocaleString()}\n`;
        summary += `  Timing: ${item.timing}\n\n`;
      });
    }

    summary += `**TOTAL INVESTMENT: Ksh ${totalCost.toLocaleString()} per acre**\n\n`;
    summary += `**EXPECTED BENEFITS:**\n`;
    summary += `• Corrected nutrient deficiencies\n`;
    summary += `• Improved crop yield (estimated 30-50% increase)\n`;
    summary += `• Better crop quality and stress tolerance\n`;

    return summary;
  }
}

export const soilTestInterpreter = new SoilTestInterpreter();