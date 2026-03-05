// lib/soilTestInterpreter.ts

export interface SoilTestResults {
  // ... existing fields ...

  // NEW: Recommendation fields
  targetYield?: number;
  recPlantingFertilizer?: string;
  recPlantingQuantity?: number;
  recTopdressingFertilizer?: string;
  recTopdressingQuantity?: number;
  recPotassiumFertilizer?: string;
  recPotassiumQuantity?: number;
}

export class SoilTestInterpreter {

  // Updated to include recommendations
  interpretSoilTest(data: any): SoilTestResults {
    const base = {
      // ... existing interpretation code ...
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
      recPotassiumQuantity: data.recPotassiumQuantity
    };
  }

  // NEW: Generate recommendation text using farmer's actual recommendations
  generateRecommendationText(soilResults: SoilTestResults): string {
    if (!soilResults.recPlantingFertilizer) {
      return this.generateFallbackText(soilResults);
    }

    let text = `🌱 **YOUR SOIL TEST RECOMMENDATIONS**\n\n`;
    text += `**Target Yield:** ${soilResults.targetYield || 27} bags/acre\n\n`;

    text += `**PLANTING FERTILIZER:**\n`;
    text += `• ${soilResults.recPlantingFertilizer}\n`;
    text += `• Apply ${soilResults.recPlantingQuantity}kg per acre\n\n`;

    text += `**TOPDRESSING FERTILIZER:**\n`;
    text += `• ${soilResults.recTopdressingFertilizer}\n`;
    text += `• Apply ${soilResults.recTopdressingQuantity}kg per acre\n\n`;

    text += `**POTASSIUM FERTILIZER:**\n`;
    text += `• ${soilResults.recPotassiumFertilizer}\n`;
    text += `• Apply ${soilResults.recPotassiumQuantity}kg per acre\n\n`;

    text += `**NUTRIENTS NEEDED (from these recommendations):**\n`;

    // Calculate nutrients from recommendations
    const nutrients = this.calculateNutrientsFromRecs(soilResults);

    text += `• Nitrogen (N): ${nutrients.n.toFixed(1)} kg\n`;
    text += `• Phosphorus (P): ${nutrients.p.toFixed(1)} kg\n`;
    text += `• Potassium (K): ${nutrients.k.toFixed(1)} kg\n\n`;

    text += `**Go to market and buy fertilizers that supply these exact nutrients!**`;

    return text;
  }

  calculateNutrientsFromRecs(rec: SoilTestResults): { n: number; p: number; k: number } {
    const parse = (name: string, qty: number) => {
      const match = name.match(/NPK?\s*(\d+)\.?(\d+)?\.?(\d+)?/i);
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
      if (name.toLowerCase().includes('urea')) return { n: 0.46 * qty, p: 0, k: 0 };
      if (name.toLowerCase().includes('mop')) return { n: 0, p: 0, k: 0.6 * qty };
      return { n: 0, p: 0, k: 0 };
    };

    const p = parse(rec.recPlantingFertilizer || "", rec.recPlantingQuantity || 0);
    const t = parse(rec.recTopdressingFertilizer || "", rec.recTopdressingQuantity || 0);
    const k = parse(rec.recPotassiumFertilizer || "", rec.recPotassiumQuantity || 0);

    return {
      n: p.n + t.n + k.n,
      p: p.p + t.p + k.p,
      k: p.k + t.k + k.k
    };
  }

  generateFallbackText(soilResults: SoilTestResults): string {
    return `Based on your soil test, your soil is ${soilResults.phRating} (pH ${soilResults.ph}) with ${soilResults.phosphorusRating} Phosphorus (${soilResults.phosphorus} ppm) and ${soilResults.potassiumRating} Potassium (${soilResults.potassium} ppm).`;
  }
}
// ... all your existing code ...

export const soilTestInterpreter = new SoilTestInterpreter();