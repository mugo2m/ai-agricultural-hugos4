// lib/fertilizerCalculator.ts
import { SoilTestResults, NutrientRequirement, FertilizerRecommendation, FertilizerBlendResult } from '@/types/soilTest';
import { plantingFertilizers, getPlantingFertilizerById } from './fertilizers/plantingFertilizers';
import { topDressingFertilizers, getTopDressingFertilizerById } from './fertilizers/topDressingFertilizers';
import { soilTestInterpreter } from './soilTestInterpreter';
import { calculatePlantsPerAcre, calculateTotalPlants, calculateFertilizerPerPlant, getMeasurementGuide } from './utils';
import { COUNTRY_CURRENCY_MAP } from '@/lib/config/currency';

export class FertilizerCalculator {

  // Helper to format currency for DISPLAY (symbol only)
  private formatCurrencyForDisplay(amount: number, country: string = 'kenya'): string {
    const currency = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP.kenya;

    const formattedAmount = new Intl.NumberFormat(currency.locale, {
      style: 'decimal',
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces
    }).format(amount);

    return currency.position === 'before'
      ? `${currency.symbol} ${formattedAmount}`
      : `${formattedAmount} ${currency.symbol}`;
  }

  // Helper to format currency for SPEECH (full name)
  private formatCurrencyForSpeech(amount: number, country: string = 'kenya'): string {
    const currency = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP.kenya;
    return `${currency.name} ${amount.toLocaleString()}`;
  }

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
    const fertilizerDb = applicationType === 'planting' ? plantingFertilizers : topDressingFertilizers;
    const availableFertilizers = fertilizerDb.filter(f => availableFertilizerIds.includes(f.id));

    let remaining = { ...nutrientNeeds };
    const recommendations: FertilizerRecommendation[] = [];

    if (remaining.p > 0.1) {
      const pFertilizers = availableFertilizers.filter(f => (f.nutrients.p || 0) > 0);

      if (pFertilizers.length > 0) {
        const fert = pFertilizers[0];
        const pNeeded = remaining.p;
        const pPercent = fert.nutrients.p / 100;
        const amountKg = Math.round(pNeeded / pPercent);

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

          remaining.p = Math.max(0, remaining.p - providesP);
          remaining.n = Math.max(0, remaining.n - providesN);
          remaining.k = Math.max(0, remaining.k - providesK);
        }
      }
    }

    if (remaining.k > 0.1) {
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
        }
      }
    }

    if (remaining.n > 0.1) {
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

  // Calculate from recommendations
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
    farmSize: number = 1,
    spacing?: { rowCm: number; plantCm: number; seedsPerHole: number; label: string },
    country: string = 'kenya'
  ): FertilizerBlendResult & {
    perAcrePlanting?: FertilizerRecommendation[];
    perAcreTopdressing?: FertilizerRecommendation[];
    farmSize?: number;
    perPlant?: any;
  } {

    const nutrientsPerAcre = this.extractNutrientsFromRecommendations(recommendations);

    const plantingFertilizer = plantingFertilizers.find(f => f.id === availableFertilizers.planting[0]);
    const topdressingFertilizer = topDressingFertilizers.find(f => f.id === availableFertilizers.topdressing[0]);
    const potassiumFertilizer = topDressingFertilizers.find(f => f.id === availableFertilizers.potassium[0]);

    let remainingNPerAcre = nutrientsPerAcre.n;
    let remainingPPerAcre = nutrientsPerAcre.p;
    let remainingKPerAcre = nutrientsPerAcre.k;

    const plantingRecsPerAcre: FertilizerRecommendation[] = [];
    const topdressingRecsPerAcre: FertilizerRecommendation[] = [];

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

      remainingNPerAcre -= providesNPerAcre;
      remainingPPerAcre -= providesPPerAcre;
    }

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
    }

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
    }

    const plantingRecs = plantingRecsPerAcre.map(rec => ({
      ...rec,
      amountKg: Math.round(rec.amountKg * farmSize)
    }));

    const topdressingRecs = topdressingRecsPerAcre.map(rec => ({
      ...rec,
      amountKg: Math.round(rec.amountKg * farmSize)
    }));

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

    let perPlantInfo = null;
    if (spacing) {
      const plantsPerAcre = calculatePlantsPerAcre({
        rowCm: spacing.rowCm,
        plantCm: spacing.plantCm,
        seedsPerHole: spacing.seedsPerHole
      });

      const totalPlants = calculateTotalPlants(plantsPerAcre, farmSize);

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
    }

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

  // Extract nutrients from fertilizer formulation
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

  // Generate recommendation text
  generateRecommendationText(result: any, cropType: string, targetYield?: number, country: string = 'kenya'): string {
    let text = `PRECISION FERTILIZER PLAN BASED ON YOUR SOIL TEST\n\n`;

    if (result.farmSize) {
      text += `Your farm size: ${result.farmSize} acre(s)\n`;
    }

    if (result.totalCost) {
      text += `Total investment: ${this.formatCurrencyForDisplay(result.totalCost, country)} for your entire farm\n\n`;
    }

    if (result.plantingRecommendations?.length > 0) {
      text += `PLANTING FERTILIZERS (apply at planting)\n`;
      result.plantingRecommendations.forEach((rec: any) => {
        const bagsNeeded = Math.floor(rec.amountKg / 50);
        const extraKg = rec.amountKg % 50;
        const pricePerKg = rec.pricePer50kg / 50;

        const totalCost = (bagsNeeded * rec.pricePer50kg) + (extraKg * pricePerKg);

        let bagText = '';
        if (bagsNeeded > 0 && extraKg > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`;
        } else if (bagsNeeded > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg`;
        } else {
          bagText = `${extraKg}kg open`;
        }

        text += `Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})\n`;
        text += `This is ${bagText}\n`;
        text += `Cost: ${this.formatCurrencyForDisplay(Math.round(totalCost), country)}\n`;
        text += `Provides: ${(rec.provides.n).toFixed(1)} kg N, ${(rec.provides.p).toFixed(1)} kg P, ${(rec.provides.k).toFixed(1)} kg K\n\n`;
      });
    }

    if (result.topDressingRecommendations?.length > 0) {
      text += `TOP DRESSING FERTILIZERS (apply 3-4 weeks after planting)\n`;
      result.topDressingRecommendations.forEach((rec: any) => {
        const bagsNeeded = Math.floor(rec.amountKg / 50);
        const extraKg = rec.amountKg % 50;
        const pricePerKg = rec.pricePer50kg / 50;

        const totalCost = (bagsNeeded * rec.pricePer50kg) + (extraKg * pricePerKg);

        let bagText = '';
        if (bagsNeeded > 0 && extraKg > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`;
        } else if (bagsNeeded > 0) {
          bagText = `${bagsNeeded} bag(s) of 50kg`;
        } else {
          bagText = `${extraKg}kg open`;
        }

        text += `Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})\n`;
        text += `This is ${bagText}\n`;
        text += `Cost: ${this.formatCurrencyForDisplay(Math.round(totalCost), country)}\n`;

        if (rec.provides.n > 0) {
          text += `Provides: ${(rec.provides.n).toFixed(1)} kg N\n\n`;
        } else {
          text += `Provides: ${(rec.provides.k).toFixed(1)} kg K\n\n`;
        }
      });
    }

    text += `TOTAL FERTILIZER INVESTMENT: ${this.formatCurrencyForDisplay(result.totalCost, country)} for your ${result.farmSize || 1} acre farm\n\n`;

    if (result.perPlant) {
      const pp = result.perPlant;

      text += `---\n\n`;
      text += `PLANT POPULATION\n`;
      text += `Based on your spacing, you have approximately ${pp.totalPlants.toLocaleString()} plants on your ${result.farmSize} acre farm.\n\n`;

      text += `FERTILIZER PER PLANT\n`;
      text += `DAP: ${pp.dapGrams} grams\n`;
      text += `UREA: ${pp.ureaGrams} grams\n`;
      text += `MOP: ${pp.mopGrams} grams\n`;
      text += `TOTAL: ${pp.totalGrams} grams\n\n`;

      text += `MEASUREMENT GUIDE\n`;
      text += `${pp.dapGrams} g: ${pp.dapGuide}\n`;
      text += `${pp.ureaGrams} g: ${pp.ureaGuide}\n`;
      text += `${pp.mopGrams} g: ${pp.mopGuide}\n`;
      text += `${pp.totalGrams} g: ${pp.totalGuide}\n\n`;
    }

    text += `Gross margin will be calculated based on your actual yield and costs.\n`;

    return text;
  }
}

export const fertilizerCalculator = new FertilizerCalculator();