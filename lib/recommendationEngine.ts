// lib/recommendationEngine.ts
// 100% LOGIC-BASED RECOMMENDATION ENGINE

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

  // ========== RECOMMENDATION 1: SOIL TEST / FERTILIZER ==========
  if (hasSoilTest && fertilizerPlan) {
    let fertilizerText = `**🌱 Precision Fertilizer Plan Based on Your Soil Test:**\n\n`;
    fertilizerText += `Total investment: Ksh ${fertilizerPlan.totalCost?.toLocaleString() || 0} per acre.\n\n`;

    if (fertilizerPlan.interventions?.length > 0) {
      fertilizerText += `**Deficient nutrients identified:**\n`;
      fertilizerPlan.interventions.forEach((inv: any) => {
        fertilizerText += `• ${inv.nutrient}: ${inv.value} (${inv.level})\n`;
      });

      fertilizerText += `\n**Recommended fertilizer blend:**\n`;
      if (fertilizerPlan.plantingFertilizers?.length > 0) {
        fertilizerText += `\n🌱 **PLANTING FERTILIZERS (apply at planting):**\n`;
        fertilizerPlan.plantingFertilizers.forEach((p: any) => {
          fertilizerText += `• ${p.selected.name}: ${p.selected.amountKg}kg per acre\n`;
          fertilizerText += `  Cost: Ksh ${p.selected.cost?.toLocaleString()}\n`;
        });
      }
      if (fertilizerPlan.topdressingFertilizers?.length > 0) {
        fertilizerText += `\n🌾 **TOPDRESSING FERTILIZERS (apply 3-4 weeks after planting):**\n`;
        fertilizerPlan.topdressingFertilizers.forEach((t: any) => {
          fertilizerText += `• ${t.selected.name}: ${t.selected.amountKg}kg per acre\n`;
          fertilizerText += `  Cost: Ksh ${t.selected.cost?.toLocaleString()}\n`;
        });
      }
    }
    recommendations.push(fertilizerText);
  } else {
    let generalFertilizer = `**🌱 General Fertilizer Recommendation for ${crop}:**\n\n`;
    generalFertilizer += `For optimal production in your area without soil test results, consider:\n\n`;

    if (crop === "maize") {
      generalFertilizer += `• Apply 50kg DAP per acre at planting (provides 23kg P₂O₅ + 9kg N)\n`;
      generalFertilizer += `• Topdress with 50kg CAN or 25kg UREA per acre 3-4 weeks after planting\n`;
    } else if (crop === "beans") {
      generalFertilizer += `• Apply 50kg DAP per acre at planting\n`;
      generalFertilizer += `• Topdressing not usually needed for beans\n`;
    } else if (crop === "coffee") {
      generalFertilizer += `• Apply 100kg NPK 17-17-17 per acre twice yearly (start and mid-rains)\n`;
      generalFertilizer += `• Topdress with 100kg CAN per acre during rainy seasons\n`;
    } else {
      generalFertilizer += `• Apply 50kg DAP or NPK 23-23-0 per acre at planting\n`;
      generalFertilizer += `• Topdress with 50kg CAN per acre 3-4 weeks after planting\n`;
    }

    generalFertilizer += `\n🌱 **Add 5 tons well-decomposed manure per acre to improve soil structure.**\n\n`;
    generalFertilizer += `💡 **TIP:** Consider doing a soil test for precision recommendations that could save you up to 30% on fertilizer costs!`;

    recommendations.push(generalFertilizer);
  }

  // ========== RECOMMENDATION 2: GOOD AGRICULTURAL PRACTICES ==========
  let gapText = `**🌾 Good Agricultural Practices for ${crop}:**\n\n`;
  gapText += `• Use certified, disease-free seed/planting material\n`;
  gapText += `• Prepare land 2-3 months before planting - plough twice for fine seedbed\n`;
  gapText += `• Plant with the first effective rains for maximum yield\n`;
  gapText += `• Follow recommended spacing: ${getSpacing(crop)}\n`;
  gapText += `• Weed early and regularly (2-3 times per season)\n`;
  gapText += `• Harvest at correct maturity and handle carefully to reduce losses\n`;
  gapText += `• Dry to correct moisture and store in clean, dry conditions\n`;
  recommendations.push(gapText);

  // ========== RECOMMENDATION 3: INTEGRATED PEST & DISEASE MANAGEMENT ==========
  let pestText = `**🐛 Integrated Pest & Disease Management:**\n\n`;

  if (farmerData.commonPests) {
    pestText += `**Your reported pests:** ${farmerData.commonPests}\n`;
  }
  if (farmerData.commonDiseases) {
    pestText += `**Your reported diseases:** ${farmerData.commonDiseases}\n\n`;
  }

  pestText += `**Prevention strategies:**\n`;
  pestText += `• Practice crop rotation with non-host crops\n`;
  pestText += `• Use resistant varieties where available\n`;
  pestText += `• Monitor fields weekly for early detection\n`;
  pestText += `• Conserve natural enemies (ladybirds, spiders, parasitic wasps)\n`;
  pestText += `• Remove and destroy infected plants immediately\n\n`;

  pestText += `**Specific control for ${crop}:**\n`;
  if (crop === "maize") {
    pestText += `• Fall armyworm: Scout early, use neem-based products, spray Emamectin if severe\n`;
    pestText += `• Stalk borer: Apply Bulldock granules in plant funnel\n`;
    pestText += `• Maize streak virus: Use resistant varieties, control leaf hoppers\n`;
  } else if (crop === "beans") {
    pestText += `• Bean fly: Plant early, use certified seed, spray Diazinon if severe\n`;
    pestText += `• Aphids: Use Dimethoate or neem spray, conserve ladybirds\n`;
    pestText += `• Anthracnose: Use disease-free seed, spray Mancozeb preventatively\n`;
  } else if (crop === "coffee") {
    pestText += `• Coffee berry borer: Regular harvesting, trap trees, spray only when necessary\n`;
    pestText += `• Leaf rust: Spray copper-based fungicides preventatively during wet season\n`;
    pestText += `• CBD: Spray Daconil or Delan 3-4 times per season\n`;
  } else if (crop === "tomatoes") {
    pestText += `• Whiteflies: Use yellow sticky traps, spray Decis if populations high\n`;
    pestText += `• Late blight: Spray Ridomil or Mancozeb preventatively every 7-10 days in wet weather\n`;
  } else if (crop === "potatoes") {
    pestText += `• Late blight: Spray Ridomil or Mancozeb preventatively, especially during wet periods\n`;
    pestText += `• Tuber moth: Hill properly, harvest promptly, store in cool conditions\n`;
  }

  recommendations.push(pestText);

  // ========== RECOMMENDATION 4: INTEGRATED SOIL FERTILITY MANAGEMENT ==========
  let soilFertilityText = `**🌱 Integrated Soil Fertility Management:**\n\n`;
  soilFertilityText += `• Combine inorganic fertilizers with organic materials (manure, compost)\n`;
  soilFertilityText += `• Practice crop rotation with legumes (beans, cowpeas) to fix nitrogen\n`;
  soilFertilityText += `• Incorporate crop residues back into the soil after harvest\n`;
  soilFertilityText += `• Use cover crops (lablab, mucuna) during fallow periods\n`;
  soilFertilityText += `• Maintain soil pH between 5.5-7.0 for optimal nutrient availability\n`;

  if (!farmerData.organicManure || farmerData.organicManure === "no") {
    soilFertilityText += `\n💡 **Consider adding 5-10 tons of well-decomposed manure per acre** to improve soil organic matter and water holding capacity.\n`;
  }

  recommendations.push(soilFertilityText);

  // ========== RECOMMENDATION 5: SOIL & WATER CONSERVATION ==========
  let conservationText = `**💧 Soil & Water Conservation Practices:**\n\n`;

  const practices = [];
  if (farmerData.terracing === "yes") practices.push("terracing");
  if (farmerData.mulching === "yes") practices.push("mulching");
  if (farmerData.coverCrops === "yes") practices.push("cover crops");
  if (farmerData.rainwaterHarvesting === "yes") practices.push("rainwater harvesting");
  if (farmerData.contourFarming === "yes") practices.push("contour farming");

  if (practices.length > 0) {
    conservationText += `✅ **You're already using:** ${practices.join(', ')}. Great job!\n\n`;
  }

  const missing = [];
  if (farmerData.terracing !== "yes" && isSlopingLand()) missing.push("terracing on slopes");
  if (farmerData.mulching !== "yes") missing.push("mulching to retain moisture");
  if (farmerData.coverCrops !== "yes") missing.push("cover crops during off-season");
  if (farmerData.rainwaterHarvesting !== "yes") missing.push("rainwater harvesting structures");
  if (farmerData.contourFarming !== "yes") missing.push("contour farming on gentle slopes");

  if (missing.length > 0) {
    conservationText += `**Consider adopting:** ${missing.slice(0, 3).join(', ')}.\n\n`;
  }

  conservationText += `**Recommended practices:**\n`;
  conservationText += `• Maintain soil cover with mulch or crop residues to reduce erosion\n`;
  conservationText += `• Construct terraces on slopes >5% to prevent soil loss\n`;
  conservationText += `• Build water pans/ponds to collect runoff for dry season irrigation\n`;
  conservationText += `• Plant along contours on gentle slopes to slow water runoff\n`;

  recommendations.push(conservationText);

  // ========== RECOMMENDATION 6: CLIMATE-SMART AGRICULTURE ==========
  let climateText = `**🌦️ Climate-Smart Agriculture Practices:**\n\n`;
  climateText += `• Use drought-tolerant varieties when available\n`;
  climateText += `• Practice early planting to escape mid-season dry spells\n`;
  climateText += `• Integrate trees on farm (agroforestry) for shade and moisture retention\n`;
  climateText += `• Install weather monitoring or use agricultural weather forecasts\n`;
  climateText += `• Diversify crops to spread risk across seasons\n`;
  climateText += `• Consider crop insurance to protect against climate risks\n`;
  climateText += `• Practice minimum tillage to preserve soil moisture\n`;
  recommendations.push(climateText);

  // ========== FINANCIAL ADVICE ==========
  let financialAdvice = `**💰 Financial Management Tips:**\n\n`;

  if (hasSoilTest && fertilizerPlan?.totalCost) {
    financialAdvice += `Your precision fertilizer investment is Ksh ${fertilizerPlan.totalCost.toLocaleString()} per acre. `;
    financialAdvice += `This targeted approach typically increases yields by 30-50% with an ROI of 200-300%.\n\n`;
  } else {
    financialAdvice += `• Track all input costs (seeds, fertilizer, labor) to calculate your actual profit margins\n`;
    financialAdvice += `• Consider forming a farmer group for bulk input purchases at lower prices\n`;
    financialAdvice += `• Explore market options beyond the farm gate for better prices\n`;
    financialAdvice += `• Keep records of yields and prices to identify your most profitable crops\n\n`;
  }

  financialAdvice += `**Simple profit calculation:**\n`;
  financialAdvice += `Gross Margin = (Yield × Price) - (Seed + Fertilizer + Labour + Transport + Bags)\n\n`;

  financialAdvice += `**Example for maize at medium management:**\n`;
  financialAdvice += `Revenue: 40 bags × Ksh 6,750 = Ksh 270,000\n`;
  financialAdvice += `Costs: Ksh 52,290\n`;
  financialAdvice += `Gross Margin: Ksh 217,710 per acre\n`;

  return {
    list: recommendations,
    financialAdvice
  };
}

// Helper function for spacing
function getSpacing(crop: string): string {
  const spacingMap: Record<string, string> = {
    maize: "75cm x 25cm (1 seed/hole) or 75cm x 50cm (2 seeds/hole)",
    beans: "50cm x 10cm (pure stand) or 50cm x 15cm (mixed)",
    coffee: "2.75m x 2.75m (about 1,300 trees/acre)",
    bananas: "3m x 3m (about 450 suckers/acre)",
    potatoes: "75cm x 30cm",
    tomatoes: "60cm x 45cm",
    cabbage: "60cm x 45cm",
    onions: "30cm x 10cm",
    sugarcane: "1.5m x 0.5m (about 12,000 setts/acre)",
    cassava: "1m x 1m (about 4,000 cuttings/acre)",
    sweet_potatoes: "90cm x 30cm (on ridges)"
  };

  return spacingMap[crop.toLowerCase()] || "the recommended spacing for your area";
}

function isSlopingLand(): boolean {
  // This would ideally come from farmer data
  // For now, return true as a general recommendation
  return true;
}