// lib/recommendationEngine.ts
// 100% LOGIC-BASED RECOMMENDATION ENGINE with dynamic management levels
import { COUNTRY_CURRENCY_MAP } from '@/lib/config/currency';

interface RecommendationInput {
  hasSoilTest: boolean;
  soilAnalysis?: any;
  fertilizerPlan?: any;
  crop: string;
  crops: string[];
  farmerData: {
    usePlantingFertilizer?: string;
    useTopdressingFertilizer?: string;
    organicManure?: string;
    terracing?: string;
    mulching?: string;
    coverCrops?: string;
    rainwaterHarvesting?: string;
    contourFarming?: string;
    commonPests?: string;
    commonDiseases?: string;
    mainChallenge?: string;
    experience?: string;
    managementLevel?: string;
    conservationPractices?: string;
    actualYield?: number;
    pricePerUnit?: number;
    totalCosts?: number;
    country?: string;
    limePricePerBag?: number;
    recCalciticLime?: number;
  };
}

interface RecommendationOutput {
  list: string[];
  financialAdvice: string;
}

export function generateRecommendations(input: RecommendationInput): RecommendationOutput {
  const recommendations: string[] = [];
  const { hasSoilTest, soilAnalysis, fertilizerPlan, crop, farmerData } = input;
  const lowerCrop = crop.toLowerCase();
  const country = farmerData.country || 'kenya';
  const farmerName = "Farmer";

  // Helper function to format currency for display (symbol only)
  const formatCurrency = (amount: number): string => {
    const currency = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP.kenya;
    const formattedAmount = new Intl.NumberFormat(currency.locale, {
      style: 'decimal',
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces
    }).format(amount);

    return currency.position === 'before'
      ? `${currency.symbol} ${formattedAmount}`
      : `${formattedAmount} ${currency.symbol}`;
  };

  // Helper to get currency symbol
  const currencySymbol = COUNTRY_CURRENCY_MAP[country]?.symbol || 'Ksh';

  // SOIL TEST SUMMARY WITH RATINGS
  if (hasSoilTest && soilAnalysis) {
    let soilSummaryText = `SOIL TEST ANALYSIS - KNOW YOUR SOIL, GROW YOUR BUSINESS\n\n`;

    if (soilAnalysis.ph) {
      soilSummaryText += `pH: ${soilAnalysis.ph} (${soilAnalysis.phRating || 'N/A'}) - `;
      if (soilAnalysis.ph < 5.5) soilSummaryText += `Too acidic. Needs lime.\n`;
      else if (soilAnalysis.ph > 7.5) soilSummaryText += `Too alkaline. Needs sulfur/organic matter.\n`;
      else soilSummaryText += `Optimal range!\n`;
    }

    if (soilAnalysis.phosphorus) {
      soilSummaryText += `Phosphorus (P): ${soilAnalysis.phosphorus} ppm (${soilAnalysis.phosphorusRating || 'N/A'}) - `;
      if (soilAnalysis.phosphorus < 15) soilSummaryText += `Very Low. Needs DAP/TSP.\n`;
      else if (soilAnalysis.phosphorus < 30) soilSummaryText += `Low. Needs phosphorus fertilizer.\n`;
      else soilSummaryText += `Optimal.\n`;
    }

    if (soilAnalysis.potassium) {
      soilSummaryText += `Potassium (K): ${soilAnalysis.potassium} ppm (${soilAnalysis.potassiumRating || 'N/A'}) - `;
      if (soilAnalysis.potassium < 100) soilSummaryText += `Very Low. Needs MOP/KCL.\n`;
      else if (soilAnalysis.potassium < 200) soilSummaryText += `Low. Needs potassium fertilizer.\n`;
      else soilSummaryText += `Optimal.\n`;
    }

    if (soilAnalysis.calcium) {
      soilSummaryText += `Calcium (Ca): ${soilAnalysis.calcium} ppm (${soilAnalysis.calciumRating || 'N/A'}) - `;
      if (soilAnalysis.calcium < 400) soilSummaryText += `Low. Needs calcitic lime or gypsum.\n`;
      else soilSummaryText += `Adequate.\n`;
    }

    if (soilAnalysis.magnesium) {
      soilSummaryText += `Magnesium (Mg): ${soilAnalysis.magnesium} ppm (${soilAnalysis.magnesiumRating || 'N/A'}) - `;
      if (soilAnalysis.magnesium < 50) soilSummaryText += `Low. Needs dolomitic lime or Epsom salts.\n`;
      else if (soilAnalysis.magnesium > 200) soilSummaryText += `High. Avoid magnesium fertilizers.\n`;
      else soilSummaryText += `Optimal.\n`;
    }

    if (soilAnalysis.totalNitrogen) {
      soilSummaryText += `Nitrogen (N): ${soilAnalysis.totalNitrogen}% (${soilAnalysis.totalNitrogenRating || 'N/A'}) - `;
      if (soilAnalysis.totalNitrogen < 0.2) soilSummaryText += `Low. Needs more organic matter.\n`;
      else soilSummaryText += `Adequate.\n`;
    }

    if (soilAnalysis.organicMatter) {
      soilSummaryText += `Organic Matter (OM): ${soilAnalysis.organicMatter}% (${soilAnalysis.organicMatterRating || 'N/A'}) - `;
      if (soilAnalysis.organicMatter < 2) soilSummaryText += `Low. Add manure/compost.\n`;
      else if (soilAnalysis.organicMatter > 5) soilSummaryText += `Excellent! Keep adding organic matter.\n`;
      else soilSummaryText += `Good. Maintain with cover crops.\n`;
    }

    if (soilAnalysis.calcium && soilAnalysis.magnesium && soilAnalysis.magnesium > 0) {
      const caMgRatio = (soilAnalysis.calcium / soilAnalysis.magnesium).toFixed(1);
      soilSummaryText += `Ca:Mg Ratio: ${caMgRatio}:1 (Ideal is 5:1 to 10:1) - `;
      if (parseFloat(caMgRatio) < 5) soilSummaryText += `Magnesium is too high relative to calcium. Use calcitic lime.\n`;
      else if (parseFloat(caMgRatio) > 10) soilSummaryText += `Calcium is high relative to magnesium. Use dolomitic lime.\n`;
      else soilSummaryText += `Balanced!\n`;
    }

    soilSummaryText += `\nBUSINESS INSIGHT: Every ${currencySymbol} 1 invested in soil correction returns ${currencySymbol} 3-5 in higher yields!\n`;
    soilSummaryText += `TEST SOIL YEARLY to track improvements and adjust inputs.\n`;

    recommendations.push(soilSummaryText);
  }

  // CALCITIC LIME RECOMMENDATION
  if (hasSoilTest && farmerData.recCalciticLime && farmerData.recCalciticLime > 0) {
    const limeKg = farmerData.recCalciticLime;
    const limePricePerBag = farmerData.limePricePerBag || 300;
    const bagsNeeded = Math.ceil(limeKg / 50);
    const totalCost = bagsNeeded * limePricePerBag;

    let limeText = `CALCITIC LIME RECOMMENDATION FROM YOUR SOIL TEST\n\n`;
    limeText += `Based on your soil test, you need ${limeKg} kg of calcitic lime per acre.\n`;
    limeText += `This is ${bagsNeeded} bags of 50kg\n`;
    limeText += `Cost: ${formatCurrency(totalCost)} (${formatCurrency(limePricePerBag)} per bag)\n`;
    limeText += `Apply 3-4 weeks before planting and incorporate into top 10-15cm soil\n`;
    limeText += `Wait 1-2 weeks before applying nitrogen fertilizers\n\n`;

    if (soilAnalysis) {
      if (soilAnalysis.ph < 5.5) {
        limeText += `Why: Your pH is ${soilAnalysis.ph} (acidic) `;
        if (soilAnalysis.calcium && soilAnalysis.calcium < 400) {
          limeText += `and your calcium is low (${soilAnalysis.calcium} ppm). Calcitic lime fixes both problems!\n`;
        } else {
          limeText += `. Calcitic lime will raise pH and add calcium.\n`;
        }
      } else if (soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        limeText += `Why: Your calcium is low (${soilAnalysis.calcium} ppm). Calcitic lime adds calcium without adding magnesium.\n`;
      }
    }

    limeText += `\nBUSINESS CASE: Proper pH can increase nutrient uptake by 30-50%!\n`;
    limeText += `TEST SOIL YEARLY to know when to reapply.\n`;

    recommendations.push(limeText);
  }

  // FERTILIZER PLAN
  if (hasSoilTest && fertilizerPlan) {
    let fertilizerText = `PRECISION FERTILIZER INVESTMENT PLAN for your ${crop.toUpperCase()} ENTERPRISE\n\n`;

    if (fertilizerPlan.farmSize) {
      fertilizerText += `Your farm size: ${fertilizerPlan.farmSize} acre(s)\n`;
    }

    const totalFertilizerCost = fertilizerPlan.totalCost || 0;
    fertilizerText += `TOTAL FERTILIZER INVESTMENT: ${formatCurrency(totalFertilizerCost)} for your entire farm\n\n`;

    if (fertilizerPlan.plantingRecommendations?.length > 0 || fertilizerPlan.topDressingRecommendations?.length > 0) {

      if (fertilizerPlan.plantingRecommendations?.length > 0) {
        fertilizerText += `PLANTING FERTILIZERS (apply at planting)\n`;
        fertilizerPlan.plantingRecommendations.forEach((rec: any) => {
          const bagsNeeded = Math.floor(rec.amountKg / 50);
          const extraKg = rec.amountKg % 50;

          let bagText = '';
          if (bagsNeeded > 0 && extraKg > 0) {
            bagText = `${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`;
          } else if (bagsNeeded > 0) {
            bagText = `${bagsNeeded} bag(s) of 50kg`;
          } else {
            bagText = `${extraKg}kg open`;
          }

          fertilizerText += `Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})\n`;
          fertilizerText += `This is ${bagText}\n`;
          fertilizerText += `Cost: ${formatCurrency(Math.round(rec.amountKg * (rec.pricePer50kg/50)))}\n`;
          fertilizerText += `Provides: ${(rec.provides.n).toFixed(1)} kg N, ${(rec.provides.p).toFixed(1)} kg P, ${(rec.provides.k).toFixed(1)} kg K\n\n`;
        });
      }

      if (fertilizerPlan.topDressingRecommendations?.length > 0) {
        fertilizerText += `TOP DRESSING FERTILIZERS (apply 3-4 weeks after planting)\n`;
        fertilizerPlan.topDressingRecommendations.forEach((rec: any) => {
          const bagsNeeded = Math.floor(rec.amountKg / 50);
          const extraKg = rec.amountKg % 50;

          let bagText = '';
          if (bagsNeeded > 0 && extraKg > 0) {
            bagText = `${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`;
          } else if (bagsNeeded > 0) {
            bagText = `${bagsNeeded} bag(s) of 50kg`;
          } else {
            bagText = `${extraKg}kg open`;
          }

          fertilizerText += `Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})\n`;
          fertilizerText += `This is ${bagText}\n`;
          fertilizerText += `Cost: ${formatCurrency(Math.round(rec.amountKg * (rec.pricePer50kg/50)))}\n`;

          if (rec.provides.n > 0) {
            fertilizerText += `Provides: ${(rec.provides.n).toFixed(1)} kg N\n\n`;
          } else {
            fertilizerText += `Provides: ${(rec.provides.k).toFixed(1)} kg K\n\n`;
          }
        });
      }

      fertilizerText += `BUSINESS TIP: Buy sizes that match your needs to avoid waste. Every ${currencySymbol} saved is ${currencySymbol} earned!\n\n`;

      if (fertilizerPlan.perPlant) {
        const pp = fertilizerPlan.perPlant;
        fertilizerText += `---\n\n`;
        fertilizerText += `PLANT POPULATION\n`;
        fertilizerText += `Based on your spacing, you have approximately ${pp.totalPlants.toLocaleString()} plants on your ${fertilizerPlan.farmSize} acre farm.\n\n`;

        fertilizerText += `FERTILIZER PER PLANT\n`;
        fertilizerText += `DAP: ${pp.dapGrams} grams\n`;
        fertilizerText += `UREA: ${pp.ureaGrams} grams\n`;
        fertilizerText += `MOP: ${pp.mopGrams} grams\n`;
        fertilizerText += `TOTAL: ${pp.totalGrams} grams\n\n`;

        fertilizerText += `MEASUREMENT GUIDE\n`;
        fertilizerText += `${pp.dapGrams} g: ${pp.dapGuide}\n`;
        fertilizerText += `${pp.ureaGrams} g: ${pp.ureaGuide}\n`;
        fertilizerText += `${pp.mopGrams} g: ${pp.mopGuide}\n`;
        fertilizerText += `${pp.totalGrams} g: ${pp.totalGuide}\n\n`;
      }

      fertilizerText += `\nGross margin will be calculated based on your actual yield and costs.\n`;
      fertilizerText += `REMEMBER: This is your ENTERPRISE. Every input must increase your profit!\n`;
    }
    recommendations.push(fertilizerText);
  }

  // GROSS MARGIN ANALYSIS
  const actualYield = farmerData.actualYield || 27;
  const actualPrice = farmerData.pricePerUnit || 6750;
  const actualCosts = farmerData.totalCosts || 52290;

  const LOW_PERCENT = 0.33;
  const HIGH_PERCENT = 1.26;

  const lowYield = Math.round(actualYield * LOW_PERCENT);
  const lowRevenue = lowYield * actualPrice;
  const lowCosts = Math.round(actualCosts * LOW_PERCENT);
  const lowGM = lowRevenue - lowCosts;

  const mediumYield = actualYield;
  const mediumRevenue = actualYield * actualPrice;
  const mediumCosts = actualCosts;
  const mediumGM = mediumRevenue - mediumCosts;

  const highYield = Math.round(actualYield * HIGH_PERCENT);
  const highRevenue = highYield * actualPrice;
  const highCosts = Math.round(actualCosts * HIGH_PERCENT);
  const highGM = highRevenue - highCosts;

  let marginText = `GROSS MARGIN ANALYSIS FOR YOUR ${crop.toUpperCase()} ENTERPRISE (per acre)\n\n`;
  marginText += `Based on YOUR actual farm data, here's how different management levels compare\n\n`;

  marginText += `LOW MANAGEMENT (33% of your current level)\n`;
  marginText += `Yield: ${lowYield} bags × ${formatCurrency(actualPrice)} = ${formatCurrency(lowRevenue)}\n`;
  marginText += `Costs: ${formatCurrency(lowCosts)}\n`;
  marginText += `GROSS MARGIN: ${formatCurrency(lowGM)}\n\n`;

  marginText += `MEDIUM MANAGEMENT (YOUR CURRENT LEVEL)\n`;
  marginText += `Yield: ${mediumYield} bags × ${formatCurrency(actualPrice)} = ${formatCurrency(mediumRevenue)}\n`;
  marginText += `Costs: ${formatCurrency(mediumCosts)}\n`;
  marginText += `GROSS MARGIN: ${formatCurrency(mediumGM)}\n\n`;

  marginText += `HIGH MANAGEMENT (126% of your current level)\n`;
  marginText += `Yield: ${highYield} bags × ${formatCurrency(actualPrice)} = ${formatCurrency(highRevenue)}\n`;
  marginText += `Costs: ${formatCurrency(highCosts)}\n`;
  marginText += `GROSS MARGIN: ${formatCurrency(highGM)}\n\n`;

  marginText += `BUSINESS SUMMARY\n`;
  marginText += `From Low to Medium: +${Math.round((mediumGM/lowGM - 1)*100)}% profit increase\n`;
  marginText += `From Medium to High: +${Math.round((highGM/mediumGM - 1)*100)}% profit increase\n`;
  marginText += `Every ${currencySymbol} 1 invested returns ${(mediumRevenue/mediumCosts).toFixed(1)} profit at your current level\n`;
  marginText += `Your current level: ${farmerData.managementLevel || "Medium"}\n\n`;

  marginText += `BOTTOM LINE: Moving from ${farmerData.managementLevel || "Medium"} to High could put an extra ${formatCurrency(highGM - mediumGM)} in your pocket\n`;

  recommendations.push(marginText);

  // GOOD AGRICULTURAL PRACTICES
  let gapText = `GOOD AGRICULTURAL PRACTICES FOR YOUR ${crop.toUpperCase()} ENTERPRISE\n\n`;

  const gapRecs: Record<string, string> = {
    maize: `Seed: Use 10kg certified maize seed per acre. Varieties: H614, H629, PHB 3253\nLand prep: Prepare before rains. Plough twice for fine seedbed\nPlanting: Plant at onset of rains, 75cm x 25cm spacing, 5cm deep\nWeeding: 1st weeding at 2-3 weeks, 2nd at 5-6 weeks\nTopdressing: Apply at knee-high stage when soil is moist\nMaturity: 3-6 months depending on variety\nYield: 25-40 bags per acre with good management`,
    beans: `Seed: Use 20-24kg certified bean seed per acre. Varieties: Rosecoco, Canadian Wonder\nSpacing: 50cm x 10cm pure stand, 2 seeds per hole\nPlanting: Plant early in season to avoid bean fly\nWeeding: Keep field clean, avoid weeding during flowering\nMaturity: 3-4 months\nYield: 5-15 bags per acre`,
    "finger millet": `Seed: Use 1.6kg certified finger millet seed per acre. Varieties: Serere, Gulu\nLand prep: Prepare land to fine tilth\nPlanting: Plant at onset of rains, 30cm x 15cm spacing\nWeeding: 1st weeding at 2-3 weeks, 2nd at 5-6 weeks\nMaturity: 3-4 months\nYield: 8-25 bags per acre`,
    sorghum: `Seed: Use 2.8kg certified sorghum seed per acre. Varieties: Seredo, Serena\nLand prep: Prepare land to fine tilth\nPlanting: Plant at onset of rains, 60cm x 15cm spacing\nWeeding: 1st weeding at 2-3 weeks, 2nd at 5-6 weeks\nMaturity: 3-5 months\nYield: 7-35 bags per acre`
  };

  gapText += gapRecs[lowerCrop] ||
    `Use certified, disease-free seed/planting material\nPrepare land 2-3 months before planting\nPlant with first effective rains\nFollow recommended spacing\nWeed early and regularly (2-3 times per season)\nHarvest at correct maturity\nDry to correct moisture and store properly`;

  gapText += `\n\nREMEMBER: Every practice you do well puts more money in your pocket`;

  recommendations.push(gapText);

  // DISEASE MANAGEMENT
  let diseaseText = `INTEGRATED DISEASE MANAGEMENT FOR YOUR ${crop.toUpperCase()} ENTERPRISE\n\n`;

  if (farmerData.commonDiseases) {
    diseaseText += `Your reported diseases: ${farmerData.commonDiseases}\n\n`;
  }

  diseaseText += `PREVENTION (Cheaper than cure)\n`;
  diseaseText += `Use disease-resistant varieties where available\n`;
  diseaseText += `Practice crop rotation (3-4 years) for soil-borne diseases\n`;
  diseaseText += `Ensure proper spacing for air circulation\n`;
  diseaseText += `Avoid working in wet fields to prevent spread\n`;
  diseaseText += `Remove and destroy infected plants immediately\n`;
  diseaseText += `Disinfect tools between fields\n\n`;

  diseaseText += `COMMON DISEASES AND CONTROL OPTIONS\n\n`;

  if (lowerCrop === "maize") {
    diseaseText += `Maize Streak Virus\nUse resistant varieties (WH505, WH403)\nControl leaf hoppers with appropriate insecticides\nRouge out infected plants immediately\n\n`;
    diseaseText += `Maize Lethal Necrosis Disease (MLND)\nUse certified disease-free seed\nControl vectors (aphids, thrips) with yellow sticky traps\nUproot and burn infected plants\nPractice 2-3 year crop rotation with non-cereals\n\n`;
  } else {
    diseaseText += `General Disease Management Tips\nStart with certified disease-free seed/planting material\nPractice crop rotation (at least 2-3 years)\nEnsure proper spacing for air circulation\nRemove and destroy infected plants immediately\nApply preventative fungicides during humid conditions\nConsult local agricultural extension for specific recommendations\n`;
  }

  diseaseText += `\nBUSINESS CASE\n`;
  diseaseText += `Without control: Yield losses of 30-100% possible\n`;
  diseaseText += `With prevention: Cost ${formatCurrency(2000)}-${formatCurrency(5000)}/acre = SAVE ${formatCurrency(100000)}+!\n`;
  diseaseText += `Every ${currencySymbol} 1 spent on disease prevention returns ${currencySymbol} 20-50 in saved yield\n`;

  recommendations.push(diseaseText);

  // PEST MANAGEMENT
  let pestText = `INTEGRATED PEST MANAGEMENT (IPM) FOR YOUR ${crop.toUpperCase()} ENTERPRISE\n\n`;

  if (farmerData.commonPests) {
    pestText += `Your reported pests: ${farmerData.commonPests}\n`;
  }

  pestText += `PREVENTION (Cheaper than cure)\n`;
  pestText += `Practice crop rotation with non-host crops\n`;
  pestText += `Use resistant varieties where available\n`;
  pestText += `Monitor fields weekly for early detection (FREE!)\n`;
  pestText += `Conserve natural enemies (ladybirds, spiders, parasitic wasps)\n`;
  pestText += `Remove and destroy infected plants immediately\n\n`;

  pestText += `BUSINESS CALCULATION\n`;
  pestText += `Without control: Loss 40-60% yield = ${formatCurrency(80000)}-${formatCurrency(120000)} loss/acre\n`;
  pestText += `With IPM: Cost ${formatCurrency(1500)}-${formatCurrency(3000)} = SAVE ${formatCurrency(100000)}+ profit\n`;
  pestText += `Every ${currencySymbol} 1 spent on pest control returns ${currencySymbol} 30-40 in saved yield\n`;

  recommendations.push(pestText);

  // SOIL & WATER CONSERVATION
  let conservationText = `SOIL AND WATER CONSERVATION FOR YOUR ${crop.toUpperCase()} ENTERPRISE\n\n`;

  const conservationPractices = farmerData.conservationPractices ?
    farmerData.conservationPractices.split(',').map(p => p.trim()) : [];

  if (conservationPractices.length > 0 && !conservationPractices.includes("None")) {
    conservationText += `You're already using: ${conservationPractices.join(', ')}. Great job!\n\n`;
  }

  conservationText += `RECOMMENDED PRACTICES\n`;

  if (conservationPractices.includes("Organic manure")) {
    conservationText += `Organic Manure: Continue applying 5-10 tons per acre. It improves soil structure and water holding capacity.\n`;
  }
  if (conservationPractices.includes("Terracing")) {
    conservationText += `Terracing: Excellent for slopes! Reduces soil erosion by up to 80%.\n`;
  }
  if (conservationPractices.includes("Mulching")) {
    conservationText += `Mulching: Retains moisture, reduces weeding. Use crop residues - it's FREE!\n`;
  }
  if (conservationPractices.includes("Cover crops")) {
    conservationText += `Cover crops: Plant mucuna or dolichos between rows. Fixes 40kg N/acre naturally!\n`;
  }
  if (conservationPractices.includes("Rainwater harvesting")) {
    conservationText += `Rainwater harvesting: Build water pans - 1,000m³ pan costs ${formatCurrency(50000)}, lasts 10 years.\n`;
  }
  if (conservationPractices.includes("Contour farming")) {
    conservationText += `Contour farming: On slopes >5% - reduces erosion by 50% and retains water.\n`;
  }

  conservationText += `\nBUSINESS CASE\n`;
  conservationText += `Mulching saves 2 weeding rounds = ${formatCurrency(5000)}/acre saved\n`;
  conservationText += `Cover crops fix 40kg N/acre = saves ${formatCurrency(3500)} fertilizer\n`;
  conservationText += `Every ${currencySymbol} 1 invested in conservation returns ${currencySymbol} 5 in saved inputs and increased yields\n`;

  recommendations.push(conservationText);

  // FARMING AS BUSINESS
  let businessText = `FARMING AS A BUSINESS - MAXIMIZE YOUR PROFIT\n\n`;

  businessText += `1. KNOW YOUR COSTS\n`;
  businessText += `Track EVERY input: seeds, fertilizer, labour, transport, bags\n`;
  businessText += `Example maize medium: Costs ${formatCurrency(52290)}/hectare\n\n`;

  businessText += `2. BUY IN BULK (Save 20-30%)\n`;
  businessText += `DAP: 50kg bag ${formatCurrency(3300)} -> Buy 10 bags ${formatCurrency(31000)} (save ${formatCurrency(2000)})\n`;
  businessText += `CAN: 50kg bag ${formatCurrency(2500)} -> Buy 10 bags ${formatCurrency(23500)} (save ${formatCurrency(1500)})\n\n`;

  businessText += `3. FORM FARMER GROUPS\n`;
  businessText += `Bulk input purchases: Save 15-25%\n`;
  businessText += `Shared transport: Save ${formatCurrency(500)}/acre\n`;
  businessText += `Collective marketing: Get 10-20% higher prices\n\n`;

  businessText += `4. EXPONENTIAL PHASE\n`;
  businessText += `Every additional ${currencySymbol} 1 input returns ${currencySymbol} 3-5 profit\n`;
  businessText += `Keep investing - more inputs = more profits\n\n`;

  businessText += `BOTTOM LINE: Farming is a BUSINESS. Make every shilling work for you\n`;

  recommendations.push(businessText);

  // FINANCIAL ADVICE
  let financialAdvice = `FINANCIAL MANAGEMENT TIPS\n\n`;

  if (hasSoilTest && fertilizerPlan?.totalCost) {
    financialAdvice += `Your precision fertilizer investment is ${formatCurrency(fertilizerPlan.totalCost)} for your entire farm. `;
    financialAdvice += `This targeted approach typically increases yields by 30-50% with an ROI of 200-300%.\n\n`;
  }

  financialAdvice += `GROSS MARGIN CALCULATION\n`;
  financialAdvice += `Gross Margin = (Yield x Price) - (Seed + Fertilizer + Labour + Transport + Bags)\n\n`;

  financialAdvice += `CALCULATE YOUR ACTUAL GROSS MARGIN\n`;
  financialAdvice += `Use the yield and price you entered during the interview\n`;
  financialAdvice += `Add up all your actual costs:\n`;
  financialAdvice += `  Seeds: Your seed rate x seed cost\n`;
  financialAdvice += `  Fertilizer: Total kg used x price per kg\n`;
  financialAdvice += `  Labour: Ploughing + planting + weeding + harvesting\n`;
  financialAdvice += `  Transport: Number of bags x transport cost per bag\n`;
  financialAdvice += `  Bags: Number of bags x cost per bag\n\n`;

  financialAdvice += `PRO TIPS\n`;
  financialAdvice += `Track EVERY cost - know your numbers\n`;
  financialAdvice += `Compare your yields with benchmarks for your area\n`;
  financialAdvice += `Aim for higher management levels to increase profit\n`;
  financialAdvice += `Remember: Every ${currencySymbol} 1 invested should return ${currencySymbol} 3-5 profit\n`;
  financialAdvice += `TEST SOIL YEARLY to know when adjustments are needed\n`;
  financialAdvice += `BUY SIZES THAT MATCH YOUR NEED - don't waste money\n\n`;

  financialAdvice += `THIS IS YOUR BUSINESS. MAKE IT PROFITABLE\n`;

  return {
    list: recommendations,
    financialAdvice
  };
}