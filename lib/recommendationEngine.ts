// lib/recommendationEngine.ts
// 100% LOGIC-BASED RECOMMENDATION ENGINE with Bungoma Farm Management Guidelines

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

  // ========== RECOMMENDATION 1: SOIL TEST / FERTILIZER ==========
  if (hasSoilTest && fertilizerPlan) {
    let fertilizerText = `🌱 PRECISION FERTILIZER PLAN Based on Your Soil Test:\n\n`;
    fertilizerText += `Total investment: Ksh ${fertilizerPlan.totalCost?.toLocaleString() || 0} per acre.\n\n`;

    // Check for plantingRecommendations and topDressingRecommendations from the new structure
    if (fertilizerPlan.plantingRecommendations?.length > 0 || fertilizerPlan.topDressingRecommendations?.length > 0) {

      if (fertilizerPlan.plantingRecommendations?.length > 0) {
        fertilizerText += `PLANTING FERTILIZERS (apply at planting):\n`;
        fertilizerPlan.plantingRecommendations.forEach((rec: any) => {
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

          fertilizerText += `• Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})\n`;
          fertilizerText += `  This is ${bagText}\n`;
          fertilizerText += `  Package options: ${rec.packageSizes?.join(", ") || "50kg bag"}\n`;
          fertilizerText += `  Cost: Ksh ${Math.round(totalCost).toLocaleString()}\n`;
          fertilizerText += `  Provides: ${rec.provides.n.toFixed(1)} kg N, ${rec.provides.p.toFixed(1)} kg P, ${rec.provides.k.toFixed(1)} kg K\n\n`;
        });
      }

      if (fertilizerPlan.topDressingRecommendations?.length > 0) {
        fertilizerText += `TOP DRESSING FERTILIZERS (apply 3-4 weeks after planting):\n`;
        fertilizerPlan.topDressingRecommendations.forEach((rec: any) => {
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

          fertilizerText += `• Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})\n`;
          fertilizerText += `  This is ${bagText}\n`;
          fertilizerText += `  Package options: ${rec.packageSizes?.join(", ") || "50kg bag"}\n`;
          fertilizerText += `  Cost: Ksh ${Math.round(totalCost).toLocaleString()}\n`;

          if (rec.npk.includes("0-0-60") || rec.npk.includes("MOP") || rec.brand.includes("MOP")) {
            fertilizerText += `  Provides: ${rec.provides.k.toFixed(1)} kg K\n\n`;
          } else {
            fertilizerText += `  Provides: ${rec.provides.n.toFixed(1)} kg N\n\n`;
          }
        });
      }

      // Don't add business summary here - it will be handled by the gross margin calculation elsewhere
      fertilizerText += `\n*Gross margin will be calculated based on your actual yield and costs.*\n`;
    } else if (fertilizerPlan.interventions?.length > 0) {
      // Fallback to old structure
      fertilizerText += `Deficient nutrients identified:\n`;
      fertilizerPlan.interventions.forEach((inv: any) => {
        fertilizerText += `• ${inv.nutrient}: ${inv.value} (${inv.level})\n`;
      });

      fertilizerText += `\nRecommended fertilizer blend:\n`;
      if (fertilizerPlan.plantingFertilizers?.length > 0) {
        fertilizerText += `\nPLANTING FERTILIZERS (apply at planting):\n`;
        fertilizerPlan.plantingFertilizers.forEach((p: any) => {
          const bagsNeeded = Math.ceil(p.selected.amountKg / 50);
          fertilizerText += `• ${p.selected.name}: ${p.selected.amountKg}kg per acre\n`;
          fertilizerText += `  Buy: ${bagsNeeded} bag(s) of 50kg\n`;
          fertilizerText += `  Package options: ${p.selected.packageSizes?.join(", ") || "50kg bag"}\n`;
          fertilizerText += `  Cost: Ksh ${p.selected.cost?.toLocaleString()}\n`;
        });
      }
      if (fertilizerPlan.topdressingFertilizers?.length > 0) {
        fertilizerText += `\nTOPDRESSING FERTILIZERS (apply 3-4 weeks after planting):\n`;
        fertilizerPlan.topdressingFertilizers.forEach((t: any) => {
          const bagsNeeded = Math.ceil(t.selected.amountKg / 50);
          fertilizerText += `• ${t.selected.name}: ${t.selected.amountKg}kg per acre\n`;
          fertilizerText += `  Buy: ${bagsNeeded} bag(s) of 50kg\n`;
          fertilizerText += `  Package options: ${t.selected.packageSizes?.join(", ") || "50kg bag"}\n`;
          fertilizerText += `  Cost: Ksh ${t.selected.cost?.toLocaleString()}\n`;
        });
      }
    }
    recommendations.push(fertilizerText);
  } else {
    let generalFertilizer = `🌱 GENERAL FERTILIZER RECOMMENDATION FOR ${crop.toUpperCase()}:\n\n`;
    generalFertilizer += `Based on Bungoma Farm Management Guidelines:\n\n`;

    // Crop-specific fertilizer recommendations
    const fertRecs: Record<string, string> = {
      maize: `MAIZE:
• Planting: Apply 150kg DAP per hectare (3 bags of 50kg) @ Ksh 3,300/bag = Ksh 9,900
• Topdressing: Apply 300kg CAN per hectare (6 bags of 50kg) @ Ksh 2,500/bag = Ksh 15,000
• Total investment: Ksh 24,900/hectare (Ksh 10,000/acre)
• Add 2.5 tons manure/acre if available (Ksh 7,500)`,

      beans: `BEANS:
• Planting only: Apply 250kg DAP per hectare (5 bags of 50kg) @ Ksh 3,300/bag = Ksh 16,500
• No topdressing needed - beans fix their own nitrogen!
• Add 2.5 tons manure/acre for better yields`,

      tomatoes: `TOMATOES:
• Planting: Apply 200kg DAP per hectare (4 bags of 50kg) @ Ksh 3,300/bag = Ksh 13,200
• Topdressing 1: 100kg CAN at transplanting (2 bags) @ Ksh 2,500/bag = Ksh 5,000
• Topdressing 2: 200kg CAN at flowering (4 bags) @ Ksh 2,500/bag = Ksh 10,000
• Total investment: Ksh 28,200/hectare`,

      "finger millet": `FINGER MILLET:
• Planting: Apply 50kg DAP per hectare (1 bag of 50kg) @ Ksh 3,300/bag = Ksh 3,300
• Topdressing: Apply 100kg CAN per hectare (2 bags of 50kg) @ Ksh 2,500/bag = Ksh 5,000
• Total investment: Ksh 8,300/hectare`,

      sorghum: `SORGHUM:
• Planting: Apply 50kg DAP per hectare (1 bag of 50kg) @ Ksh 3,300/bag = Ksh 3,300
• Topdressing: Apply 100kg CAN per hectare (2 bags of 50kg) @ Ksh 2,500/bag = Ksh 5,000
• Total investment: Ksh 8,300/hectare`
    };

    generalFertilizer += fertRecs[lowerCrop] ||
      `• Apply 150kg DAP per hectare at planting\n• Topdress with 200kg CAN per hectare 3-4 weeks after planting\n• Add 2.5 tons manure per acre for soil health`;

    generalFertilizer += `\n\n💡 PRO TIPS:\n`;
    generalFertilizer += `• Buy fertilizers in bulk with neighbors to save transport costs\n`;
    generalFertilizer += `• Consider a soil test for precision recommendations - saves up to 30% on fertilizer costs!\n`;
    generalFertilizer += `• Every Ksh 1 invested in fertilizer returns Ksh 3-5 profit - we're still in exponential phase!`;

    recommendations.push(generalFertilizer);
  }

  // ========== RECOMMENDATION 2: GOOD AGRICULTURAL PRACTICES ==========
  let gapText = `🌾 GOOD AGRICULTURAL PRACTICES FOR ${crop.toUpperCase()}:\n\n`;

  // Crop-specific GAP
  const gapRecs: Record<string, string> = {
    maize: `• Seed: Use 10kg certified maize seed per acre (Ksh 1,800). Varieties: H614, H629, PHB 3253
• Land prep: Prepare before rains. Plough twice for fine seedbed
• Planting: Plant at onset of rains, 75cm x 25cm spacing, 5cm deep
• Weeding: 1st weeding at 2-3 weeks, 2nd at 5-6 weeks
• Topdressing: Apply at knee-high stage when soil is moist
• Maturity: 3-6 months depending on variety
• Yield: 25-40 bags per acre with good management`,

    beans: `• Seed: Use 20-24kg certified bean seed per acre (Ksh 3,000). Varieties: Rosecoco, Canadian Wonder
• Spacing: 50cm x 10cm pure stand, 2 seeds per hole
• Planting: Plant early in season to avoid bean fly
• Weeding: Keep field clean, avoid weeding during flowering
• Maturity: 3-4 months
• Yield: 5-15 bags per acre`,

    "finger millet": `• Seed: Use 1.6kg certified finger millet seed per acre (Ksh 500). Varieties: Serere, Gulu
• Land prep: Prepare land to fine tilth
• Planting: Plant at onset of rains, 30cm x 15cm spacing
• Weeding: 1st weeding at 2-3 weeks, 2nd at 5-6 weeks
• Maturity: 3-4 months
• Yield: 8-25 bags per acre`,

    sorghum: `• Seed: Use 2.8kg certified sorghum seed per acre (Ksh 900). Varieties: Seredo, Serena
• Land prep: Prepare land to fine tilth
• Planting: Plant at onset of rains, 60cm x 15cm spacing
• Weeding: 1st weeding at 2-3 weeks, 2nd at 5-6 weeks
• Maturity: 3-5 months
• Yield: 7-35 bags per acre`
  };

  gapText += gapRecs[lowerCrop] ||
    `• Use certified, disease-free seed/planting material
• Prepare land 2-3 months before planting
• Plant with first effective rains
• Follow recommended spacing
• Weed early and regularly (2-3 times per season)
• Harvest at correct maturity
• Dry to correct moisture and store properly`;

  recommendations.push(gapText);

  // ========== RECOMMENDATION 3: INTEGRATED PEST MANAGEMENT ==========
  let pestText = `🐛 INTEGRATED PEST MANAGEMENT (IPM):\n\n`;

  if (farmerData.commonPests) {
    pestText += `Your reported pests: ${farmerData.commonPests}\n`;
  }
  if (farmerData.commonDiseases) {
    pestText += `Your reported diseases: ${farmerData.commonDiseases}\n\n`;
  }

  pestText += `PREVENTION (Cheaper than cure):\n`;
  pestText += `• Practice crop rotation with non-host crops\n`;
  pestText += `• Use resistant varieties where available\n`;
  pestText += `• Monitor fields weekly for early detection (FREE!)\n`;
  pestText += `• Conserve natural enemies (ladybirds, spiders, parasitic wasps)\n`;
  pestText += `• Remove and destroy infected plants immediately\n\n`;

  pestText += `CONTROL OPTIONS WITH PACKAGE SIZES:\n\n`;

  if (lowerCrop === "maize") {
    pestText += `Fall Armyworm:\n`;
    pestText += `• Rocket 44EC: 100ml (Ksh 350/0.5 acre), 250ml (Ksh 800/1.25 acres), 500ml (Ksh 1,500/2.5 acres)\n`;
    pestText += `• Emacot 5WG: 10g (Ksh 250/0.5 acre), 20g (Ksh 480/1 acre)\n`;
    pestText += `• Business: Buy 500ml pack - save 20% vs buying 100ml!\n\n`;

    pestText += `Stalk Borer:\n`;
    pestText += `• Bulldock granules: 500g (Ksh 600/acre), 1kg (Ksh 1,100/2 acres)\n`;
    pestText += `• Organic: Ash application - FREE!\n\n`;

    pestText += `Larger Grain Borer (Storage):\n`;
    pestText += `• Actellic Gold Dust: 100g (Ksh 150/2 bags), 500g (Ksh 700/10 bags)\n`;
    pestText += `• Hermetic bags: Ksh 250 each - protects Ksh 6,750 grain (2,600% ROI!)\n`;
  } else if (lowerCrop === "beans") {
    pestText += `Bean Fly:\n`;
    pestText += `• Diazinon 60EC: 100ml (Ksh 350/acre), 250ml (Ksh 800/2.5 acres)\n`;
    pestText += `• Cultural: Plant early, use certified seed\n\n`;

    pestText += `Aphids:\n`;
    pestText += `• Dimethoate 40EC: 100ml (Ksh 300/acre), 250ml (Ksh 700/2.5 acres)\n`;
    pestText += `• Organic: Neem spray - 50ml per 20L water\n\n`;

    pestText += `Anthracnose:\n`;
    pestText += `• Mancozeb 80WP: 100g (Ksh 400/acre), 500g (Ksh 1,800/5 acres)\n`;
    pestText += `• Cultural: Use disease-free seed, crop rotation\n`;
  }

  pestText += `\n📊 BUSINESS CALCULATION:\n`;
  pestText += `• Without control: Loss 40-60% yield = Ksh 80,000-120,000 loss/acre\n`;
  pestText += `• With IPM: Cost Ksh 1,500-3,000 = SAVE Ksh 100,000+ profit!\n`;
  pestText += `• Every Ksh 1 spent on pest control returns Ksh 30-40 in saved yield!`;

  recommendations.push(pestText);

  // ========== RECOMMENDATION 4: GROSS MARGIN ANALYSIS - UPDATED TO USE FARMER'S ACTUAL DATA ==========
  let marginText = `💰 GROSS MARGIN ANALYSIS FOR ${crop.toUpperCase()} (per acre):\n\n`;
  marginText += `*Note: Your actual gross margin will be calculated based on the yield and cost figures you provided during the interview.*\n\n`;
  marginText += `LOW MANAGEMENT (Reference):\n`;
  marginText += `• Yield: 10 bags × Ksh 6,750 = Ksh 67,500\n`;
  marginText += `• Costs: Ksh 23,310\n`;
  marginText += `• GROSS MARGIN: Ksh 44,190\n\n`;

  marginText += `MEDIUM MANAGEMENT (Reference):\n`;
  marginText += `• Yield: 40 bags × Ksh 6,750 = Ksh 270,000\n`;
  marginText += `• Costs: Ksh 52,290\n`;
  marginText += `• GROSS MARGIN: Ksh 217,710\n\n`;

  marginText += `HIGH MANAGEMENT (Reference):\n`;
  marginText += `• Yield: 75 bags × Ksh 6,750 = Ksh 506,250\n`;
  marginText += `• Costs: Ksh 72,570\n`;
  marginText += `• GROSS MARGIN: Ksh 433,680\n\n`;

  marginText += `📊 BUSINESS SUMMARY:\n`;
  marginText += `• Compare your actual results with these benchmarks\n`;
  marginText += `• Track ALL your costs to know your true profit\n`;
  marginText += `• Every Ksh 1 invested should return Ksh 3-5 profit!\n`;
  marginText += `• Your current level: ${farmerData.managementLevel || "Medium"}\n`;

  recommendations.push(marginText);

  // ========== RECOMMENDATION 5: SOIL & WATER CONSERVATION ==========
  let conservationText = `💧 SOIL & WATER CONSERVATION:\n\n`;

  const practices = [];
  if (farmerData.terracing === "yes") practices.push("terracing");
  if (farmerData.mulching === "yes") practices.push("mulching");
  if (farmerData.coverCrops === "yes") practices.push("cover crops");
  if (farmerData.rainwaterHarvesting === "yes") practices.push("rainwater harvesting");
  if (farmerData.contourFarming === "yes") practices.push("contour farming");

  if (practices.length > 0) {
    conservationText += `✅ You're already using: ${practices.join(', ')}. Great job!\n\n`;
  }

  conservationText += `RECOMMENDED PRACTICES:\n`;
  conservationText += `• Mulching: Retains moisture, reduces weeding - use crop residues (FREE!)\n`;
  conservationText += `• Cover crops: Plant mucuna or dolichos between maize rows - fixes nitrogen, suppresses weeds\n`;
  conservationText += `  - Mucuna seed: 5kg/acre (Ksh 1,500) provides FREE fertilizer!\n`;
  conservationText += `• Contour farming: On slopes >5% - reduces erosion by 50%\n`;
  conservationText += `• Rainwater harvesting: Build water pans - 1,000m3 pan costs Ksh 50,000, lasts 10 years\n\n`;

  conservationText += `📊 BUSINESS CASE:\n`;
  conservationText += `• Mulching saves 2 weeding rounds = Ksh 5,000/acre saved!\n`;
  conservationText += `• Cover crops fix 40kg N/acre = saves Ksh 3,500 fertilizer!\n`;
  conservationText += `• Every Ksh 1 invested in conservation returns Ksh 5 in saved inputs and increased yields!`;

  recommendations.push(conservationText);

  // ========== RECOMMENDATION 6: FARMING AS BUSINESS ==========
  let businessText = `📈 FARMING AS A BUSINESS - MAXIMIZE YOUR PROFIT:\n\n`;

  businessText += `1. KNOW YOUR COSTS:\n`;
  businessText += `• Track EVERY input: seeds, fertilizer, labour, transport, bags\n`;
  businessText += `• Example maize medium: Costs Ksh 52,290/hectare\n\n`;

  businessText += `2. BUY IN BULK (Save 20-30%):\n`;
  businessText += `• DAP: 50kg bag Ksh 3,300 → Buy 10 bags Ksh 31,000 (save Ksh 2,000)\n`;
  businessText += `• CAN: 50kg bag Ksh 2,500 → Buy 10 bags Ksh 23,500 (save Ksh 1,500)\n`;
  businessText += `• Pesticides: 500ml pack saves 20% vs 100ml\n\n`;

  businessText += `3. FORM FARMER GROUPS:\n`;
  businessText += `• Bulk input purchases: Save 15-25%\n`;
  businessText += `• Shared transport: Save Ksh 500/acre\n`;
  businessText += `• Collective marketing: Get 10-20% higher prices\n\n`;

  businessText += `4. WE'RE STILL IN EXPONENTIAL PHASE:\n`;
  businessText += `• Every additional Ksh 1 input returns Ksh 3-5 profit\n`;
  businessText += `• We haven't reached diminishing returns yet!\n`;
  businessText += `• Keep investing - more inputs = more profits!\n\n`;

  businessText += `👉 BOTTOM LINE: Farming is a BUSINESS. Make every shilling work for you!`;

  recommendations.push(businessText);

  // ========== FINANCIAL ADVICE - UPDATED TO USE FARMER'S ACTUAL DATA ==========
  let financialAdvice = `💰 FINANCIAL MANAGEMENT TIPS:\n\n`;

  if (hasSoilTest && fertilizerPlan?.totalCost) {
    financialAdvice += `Your precision fertilizer investment is Ksh ${fertilizerPlan.totalCost.toLocaleString()} per acre. `;
    financialAdvice += `This targeted approach typically increases yields by 30-50% with an ROI of 200-300%.\n\n`;
  }

  financialAdvice += `GROSS MARGIN CALCULATION:\n`;
  financialAdvice += `Gross Margin = (Yield × Price) - (Seed + Fertilizer + Labour + Transport + Bags)\n\n`;

  // Remove the hardcoded maize example and replace with generic guidance
  financialAdvice += `CALCULATE YOUR ACTUAL GROSS MARGIN:\n`;
  financialAdvice += `• Use the yield and price you entered during the interview\n`;
  financialAdvice += `• Add up all your actual costs:\n`;
  financialAdvice += `  - Seeds: Your seed rate × seed cost\n`;
  financialAdvice += `  - Fertilizer: Total kg used × price per kg\n`;
  financialAdvice += `  - Labour: Ploughing + planting + weeding + harvesting\n`;
  financialAdvice += `  - Transport: Number of bags × transport cost per bag\n`;
  financialAdvice += `  - Bags: Number of bags × cost per bag\n\n`;

  financialAdvice += `PRO TIPS:\n`;
  financialAdvice += `• Track EVERY cost - know your numbers!\n`;
  financialAdvice += `• Compare your yields with benchmarks for your area\n`;
  financialAdvice += `• Aim for higher management levels to increase profit\n`;
  financialAdvice += `• Remember: Every Ksh 1 invested should return Ksh 3-5 profit!`;

  return {
    list: recommendations,
    financialAdvice
  };
}