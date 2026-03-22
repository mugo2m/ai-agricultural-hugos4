// lib/recommendationEngine.ts – Grouped recommendations with Swahili support
// This is a utility function, not a Server Action

import { COUNTRY_CURRENCY_MAP } from '@/lib/config/currency';
import { cropPestDiseaseMap, PestDisease } from '@/lib/data/pestDiseaseMapping';

interface RecommendationInput {
  hasSoilTest: boolean;
  soilAnalysis?: any;
  fertilizerPlan?: any;
  crop: string;
  crops: string[];
  farmerData: {
    farmerName?: string;
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
    deficiencySymptoms?: string;
    deficiencyLocation?: string;
    mainChallenge?: string;
    experience?: string;
    managementLevel?: string;
    conservationPractices?: string;
    actualYieldKg?: number;
    pricePerKg?: number;
    totalCosts?: number;
    country?: string;
    limePricePerBag?: number;
    recCalciticLime?: number;
    plantsDamaged?: number;
    language?: string;
  };
}

interface RecommendationOutput {
  list: string[];
  financialAdvice: string;
  structuredList: RecommendationItem[];
  structuredFinancialAdvice: RecommendationItem;
}

interface RecommendationItem {
  key: string;
  params?: Record<string, any>;
}

export async function generateRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
  const structuredList: RecommendationItem[] = [];
  const { hasSoilTest, soilAnalysis, fertilizerPlan, crop, farmerData } = input;
  const lowerCrop = crop.toLowerCase();
  const country = farmerData.country || 'kenya';
  const language = farmerData.language || 'en';
  const isSwahili = language === 'sw';

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

  const currencySymbol = COUNTRY_CURRENCY_MAP[country]?.symbol || 'Ksh';

  // ========== GROUP 1: SOIL TEST ANALYSIS ==========
  if (hasSoilTest && soilAnalysis) {
    const soilLines: string[] = [];

    if (isSwahili) {
      soilLines.push(`{{ph}}: ${soilAnalysis.ph || '?'} (${soilAnalysis.phRating === 'Very Low' ? '{{very_low}}' : soilAnalysis.phRating === 'Low' ? '{{low}}' : soilAnalysis.phRating})`);
      if (soilAnalysis.ph < 5.5) soilLines.push(`– {{too_acidic}}`);
      soilLines.push(`{{phosphorus}}: ${soilAnalysis.phosphorus || '?'} ppm (${soilAnalysis.phosphorusRating === 'Very Low' ? '{{very_low}}' : soilAnalysis.phosphorusRating})`);
      if (soilAnalysis.phosphorus < 15) soilLines.push(`– {{needs_phosphorus}}`);
      soilLines.push(`{{potassium}}: ${soilAnalysis.potassium || '?'} ppm (${soilAnalysis.potassiumRating === 'Very Low' ? '{{very_low}}' : soilAnalysis.potassiumRating})`);
      if (soilAnalysis.potassium < 100) soilLines.push(`– {{needs_potassium}}`);
      soilLines.push(`{{calcium}}: ${soilAnalysis.calcium || '?'} ppm (${soilAnalysis.calciumRating === 'Very Low' ? '{{very_low}}' : soilAnalysis.calciumRating})`);
      soilLines.push(`{{magnesium}}: ${soilAnalysis.magnesium || '?'} ppm (${soilAnalysis.magnesiumRating === 'Very Low' ? '{{very_low}}' : soilAnalysis.magnesiumRating})`);
      soilLines.push(`{{nitrogen}}: ${soilAnalysis.totalNitrogen || '?'}% (${soilAnalysis.totalNitrogenRating === 'Very Low' ? '{{very_low}}' : soilAnalysis.totalNitrogenRating})`);
      soilLines.push(`{{organic_matter}}: ${soilAnalysis.organicMatter || '?'}% (${soilAnalysis.organicMatterRating === 'Very Low' ? '{{very_low}}' : soilAnalysis.organicMatterRating})`);
    } else {
      soilLines.push(`pH: ${soilAnalysis.ph || '?'} (${soilAnalysis.phRating || ''})`);
      if (soilAnalysis.ph < 5.5) soilLines.push(`– Too acidic. Needs lime.`);
      else if (soilAnalysis.ph > 7.5) soilLines.push(`– Too alkaline. Needs sulfur/organic matter.`);
      soilLines.push(`Phosphorus (P): ${soilAnalysis.phosphorus || '?'} ppm (${soilAnalysis.phosphorusRating || ''})`);
      if (soilAnalysis.phosphorus < 15) soilLines.push(`– Low. Needs phosphorus fertilizer.`);
      soilLines.push(`Potassium (K): ${soilAnalysis.potassium || '?'} ppm (${soilAnalysis.potassiumRating || ''})`);
      if (soilAnalysis.potassium < 100) soilLines.push(`– Low. Needs potassium fertilizer.`);
      soilLines.push(`Calcium (Ca): ${soilAnalysis.calcium || '?'} ppm (${soilAnalysis.calciumRating || ''})`);
      soilLines.push(`Magnesium (Mg): ${soilAnalysis.magnesium || '?'} ppm (${soilAnalysis.magnesiumRating || ''})`);
      soilLines.push(`Nitrogen (N): ${soilAnalysis.totalNitrogen || '?'}% (${soilAnalysis.totalNitrogenRating || ''})`);
      soilLines.push(`Organic Matter (OM): ${soilAnalysis.organicMatter || '?'}% (${soilAnalysis.organicMatterRating || ''})`);
    }

    structuredList.push({
      key: 'soil_test_grouped',
      params: {
        title: isSwahili ? '{{soil_analysis_title}}' : 'SOIL TEST ANALYSIS - KNOW YOUR SOIL, GROW YOUR BUSINESS',
        content: soilLines.join('\n'),
        insight: isSwahili ? '{{soil_business_insight}}' : `BUSINESS INSIGHT: Every ${currencySymbol} 1 invested in soil correction returns ${currencySymbol} 3-5 in higher yields!`,
        yearly: isSwahili ? '{{soil_test_yearly}}' : 'TEST SOIL YEARLY to track improvements and adjust inputs.',
        symbol: currencySymbol
      }
    });
  }

  // ========== GROUP 2: CALCITIC LIME ==========
  if (hasSoilTest && farmerData.recCalciticLime && farmerData.recCalciticLime > 0) {
    const limeKg = farmerData.recCalciticLime;
    const limePricePerBag = farmerData.limePricePerBag || 300;
    const bagsNeeded = Math.ceil(limeKg / 50);
    const totalCost = bagsNeeded * limePricePerBag;

    let whyText = '';
    if (isSwahili) {
      if (soilAnalysis && soilAnalysis.ph < 5.5 && soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        whyText = '{{calcitic_lime_why_acidic_low_ca}}';
      } else if (soilAnalysis && soilAnalysis.ph < 5.5) {
        whyText = '{{calcitic_lime_why_acidic}}';
      } else if (soilAnalysis && soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        whyText = '{{calcitic_lime_why_low_ca}}';
      }
    } else {
      if (soilAnalysis && soilAnalysis.ph < 5.5 && soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        whyText = `Why: Your pH is ${soilAnalysis.ph} (acidic) and your calcium is low (${soilAnalysis.calcium} ppm). Calcitic lime fixes both problems!`;
      } else if (soilAnalysis && soilAnalysis.ph < 5.5) {
        whyText = `Why: Your pH is ${soilAnalysis.ph} (acidic). Calcitic lime will raise pH and add calcium.`;
      } else if (soilAnalysis && soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        whyText = `Why: Your calcium is low (${soilAnalysis.calcium} ppm). Calcitic lime adds calcium without adding magnesium.`;
      }
    }

    structuredList.push({
      key: 'calcitic_lime_grouped',
      params: {
        title: isSwahili ? '{{calcitic_lime_title}}' : 'CALCITIC LIME RECOMMENDATION FROM YOUR SOIL TEST',
        need: isSwahili ? '{{calcitic_lime_need}}' : `Based on your soil test, you need ${limeKg} kg of calcitic lime per acre.`,
        bags: isSwahili ? '{{calcitic_lime_bags}}' : `This is ${bagsNeeded} bags of 50kg.`,
        cost: isSwahili ? '{{calcitic_lime_cost}}' : `Cost: ${formatCurrency(totalCost)} (${formatCurrency(limePricePerBag)} per bag)`,
        why: whyText,
        application: isSwahili ? '{{calcitic_lime_application}}' : 'Apply 3-4 weeks before planting and incorporate into top 10-15cm soil.',
        wait: isSwahili ? '{{calcitic_lime_wait}}' : 'Wait 1-2 weeks before applying nitrogen fertilizers.',
        business: isSwahili ? '{{calcitic_lime_business_case}}' : 'BUSINESS CASE: Proper pH can increase nutrient uptake by 30-50%!',
        yearly: isSwahili ? '{{soil_test_yearly_reapply}}' : 'TEST SOIL YEARLY to know when to reapply.',
        kg: limeKg,
        bags: bagsNeeded,
        total: formatCurrency(totalCost),
        perBag: formatCurrency(limePricePerBag),
        ph: soilAnalysis?.ph,
        ca: soilAnalysis?.calcium
      }
    });
  }

  // ========== GROUP 3: FERTILIZER PLAN HEADER ==========
  if (hasSoilTest && fertilizerPlan) {
    structuredList.push({
      key: 'fertilizer_header_grouped',
      params: {
        title: isSwahili ? '{{fertilizer_plan_title}}' : `PRECISION FERTILIZER INVESTMENT PLAN for your ${crop.toUpperCase()} ENTERPRISE`,
        farmSize: isSwahili ? '{{fertilizer_plan_farm_size}}' : `Your farm size: ${fertilizerPlan.farmSize} acre(s)`,
        totalInvestment: isSwahili ? '{{fertilizer_plan_total_investment}}' : `TOTAL FERTILIZER INVESTMENT: ${formatCurrency(fertilizerPlan.totalCost || 0)} for your entire farm`,
        crop: crop.toUpperCase(),
        size: fertilizerPlan.farmSize,
        amount: formatCurrency(fertilizerPlan.totalCost || 0)
      }
    });
  }

  // ========== GROUP 4: PLANTING FERTILIZERS ==========
  if (hasSoilTest && fertilizerPlan && fertilizerPlan.plantingRecommendations?.length > 0) {
    const plantingLines: string[] = [];
    plantingLines.push(isSwahili ? '{{fertilizer_planting_section}}' : 'PLANTING FERTILIZERS (apply at planting)');

    fertilizerPlan.plantingRecommendations.forEach((rec: any) => {
      const bagsNeeded = Math.floor(rec.amountKg / 50);
      const extraKg = rec.amountKg % 50;
      const cost = Math.round(rec.amountKg * (rec.pricePer50kg / 50));

      const providesParts = [];
      if (rec.provides.n > 0) providesParts.push(`${rec.provides.n.toFixed(1)} kg N`);
      if (rec.provides.p > 0) providesParts.push(`${rec.provides.p.toFixed(1)} kg P`);
      if (rec.provides.k > 0) providesParts.push(`${rec.provides.k.toFixed(1)} kg K`);

      if (isSwahili) {
        plantingLines.push(
          `{{buy}} ${rec.amountKg} {{kg_of}} ${rec.brand} (${rec.npk})`,
          `{{this_is}} ${bagsNeeded} {{bags_of_50kg}} ${extraKg}{{kg_open}}`,
          `{{cost}} ${formatCurrency(cost)}`,
          `{{provides}}: ${providesParts.join(', ')}`,
          ``
        );
      } else {
        plantingLines.push(
          `Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})`,
          `This is ${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`,
          `Cost: ${formatCurrency(cost)}`,
          `Provides: ${providesParts.join(', ')}`,
          ``
        );
      }
    });

    structuredList.push({
      key: 'planting_fertilizers_grouped',
      params: { content: plantingLines.join('\n') }
    });
  }

  // ========== GROUP 5: TOP DRESSING FERTILIZERS ==========
  if (hasSoilTest && fertilizerPlan && fertilizerPlan.topDressingRecommendations?.length > 0) {
    const topdressingLines: string[] = [];
    topdressingLines.push(isSwahili ? '{{fertilizer_topdressing_section}}' : 'TOP DRESSING FERTILIZERS (apply 3-4 weeks after planting)');

    fertilizerPlan.topDressingRecommendations.forEach((rec: any) => {
      const bagsNeeded = Math.floor(rec.amountKg / 50);
      const extraKg = rec.amountKg % 50;
      const cost = Math.round(rec.amountKg * (rec.pricePer50kg / 50));

      const providesParts = [];
      if (rec.provides.n > 0) providesParts.push(`${rec.provides.n.toFixed(1)} kg N`);
      if (rec.provides.k > 0) providesParts.push(`${rec.provides.k.toFixed(1)} kg K`);

      if (isSwahili) {
        topdressingLines.push(
          `{{buy}} ${rec.amountKg} {{kg_of}} ${rec.brand} (${rec.npk})`,
          `{{this_is}} ${bagsNeeded} {{bags_of_50kg}} ${extraKg}{{kg_open}}`,
          `{{cost}} ${formatCurrency(cost)}`,
          `{{provides}}: ${providesParts.join(', ')}`,
          ``
        );
      } else {
        topdressingLines.push(
          `Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})`,
          `This is ${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`,
          `Cost: ${formatCurrency(cost)}`,
          `Provides: ${providesParts.join(', ')}`,
          ``
        );
      }
    });

    structuredList.push({
      key: 'topdressing_fertilizers_grouped',
      params: { content: topdressingLines.join('\n') }
    });
  }

  // ========== GROUP 6: PLANT POPULATION ==========
  if (hasSoilTest && fertilizerPlan && fertilizerPlan.perPlant) {
    const perPlant = fertilizerPlan.perPlant;
    const plantLines: string[] = [];

    plantLines.push(isSwahili ? '{{plant_population_title}}' : '---\nPLANT POPULATION');
    plantLines.push(isSwahili ? '{{plant_population}}' : `Based on your spacing, you have approximately ${perPlant.totalPlants?.toLocaleString()} plants on your ${fertilizerPlan.farmSize} acre farm.`);
    plantLines.push('');
    plantLines.push(isSwahili ? '{{fertilizer_per_plant_title}}' : 'FERTILIZER PER PLANT');
    plantLines.push(isSwahili ? '{{fertilizer_per_plant_dap}}' : `DAP: ${perPlant.dapGrams} grams (${perPlant.dapGuide})`);
    plantLines.push(isSwahili ? '{{fertilizer_per_plant_urea}}' : `UREA: ${perPlant.ureaGrams} grams (${perPlant.ureaGuide})`);
    plantLines.push(isSwahili ? '{{fertilizer_per_plant_mop}}' : `MOP: ${perPlant.mopGrams} grams (${perPlant.mopGuide})`);
    plantLines.push(isSwahili ? '{{fertilizer_per_plant_total}}' : `TOTAL: ${perPlant.totalGrams} grams (${perPlant.totalGuide})`);

    structuredList.push({
      key: 'plant_population_grouped',
      params: {
        content: plantLines.join('\n'),
        totalPlants: perPlant.totalPlants?.toLocaleString(),
        farmSize: fertilizerPlan.farmSize,
        grams: perPlant.dapGrams,
        ureaGrams: perPlant.ureaGrams,
        mopGrams: perPlant.mopGrams,
        totalGrams: perPlant.totalGrams
      }
    });
  }

  // ========== GROUP 7: BUSINESS TIP ==========
  structuredList.push({
    key: 'fertilizer_business_tip',
    params: { symbol: currencySymbol }
  });

  // ========== GROUP 8: FERTILIZER REMEMBER ==========
  structuredList.push({
    key: 'fertilizer_remember',
    params: { crop: crop.toUpperCase() }
  });

  // ========== GROUP 9: GROSS MARGIN ANALYSIS ==========
  let actualYieldKg = farmerData.actualYieldKg || 0;
  let pricePerKg = farmerData.pricePerKg || 0;
  let actualCosts = farmerData.totalCosts || 0;

  if (!actualYieldKg || actualYieldKg === 0) {
    const defaultYields: Record<string, number> = {
      maize: 2000, beans: 1200, onions: 8000, potatoes: 10000, tomatoes: 15000,
      cabbages: 12000, kales: 8000, bananas: 6000, avocados: 2000, coffee: 2000,
      sugarcane: 40000, rice: 3000, sorghum: 1500, millet: 1200, groundnuts: 1000,
      cassava: 8000, sweetpotatoes: 7000, mangoes: 8000, pineapples: 20000,
      watermelons: 15000, carrots: 10000, chillies: 6000, spinach: 8000,
      pigeonpeas: 1000, bambaranuts: 800, yams: 12000, taro: 10000, okra: 7000,
      tea: 2500, macadamia: 4000, cocoa: 800
    };
    actualYieldKg = defaultYields[lowerCrop] || 2000;
  }

  if (!pricePerKg || pricePerKg === 0) {
    const defaultPrices: Record<string, number> = {
      maize: 40, beans: 80, onions: 50, potatoes: 30, tomatoes: 40,
      cabbages: 25, kales: 20, bananas: 30, avocados: 40, coffee: 300,
      sugarcane: 5, rice: 60, sorghum: 45, millet: 50, groundnuts: 120,
      cassava: 20, sweetpotatoes: 25, mangoes: 50, pineapples: 40,
      watermelons: 30, carrots: 40, chillies: 80, spinach: 25,
      pigeonpeas: 70, bambaranuts: 80, yams: 50, taro: 40, okra: 35,
      tea: 200, macadamia: 150, cocoa: 300
    };
    pricePerKg = defaultPrices[lowerCrop] || 40;
  }

  if (!actualCosts || actualCosts === 0) {
    actualCosts = fertilizerPlan?.totalCost || 25000;
  }

  const LOW_PERCENT = 0.33;
  const HIGH_PERCENT = 1.26;

  const lowYieldKg = Math.round(actualYieldKg * LOW_PERCENT);
  const lowRevenue = lowYieldKg * pricePerKg;
  const lowCosts = Math.round(actualCosts * LOW_PERCENT);
  const lowGM = lowRevenue - lowCosts;

  const mediumYieldKg = actualYieldKg;
  const mediumRevenue = actualYieldKg * pricePerKg;
  const mediumCosts = actualCosts;
  const mediumGM = mediumRevenue - mediumCosts;

  const highYieldKg = Math.round(actualYieldKg * HIGH_PERCENT);
  const highRevenue = highYieldKg * pricePerKg;
  const highCosts = Math.round(actualCosts * HIGH_PERCENT);
  const highGM = highRevenue - highCosts;

  const gmLines: string[] = [];

  if (isSwahili) {
    gmLines.push('{{gross_margin_title}}');
    gmLines.push('{{gross_margin_intro}}');
    gmLines.push('');
    gmLines.push('{{low_management}}');
    gmLines.push('{{yield}} {{lowYield}} {{kg_times}} {{price}} = {{lowRevenue}}');
    gmLines.push('{{costs}} {{lowCosts}}');
    gmLines.push('{{gross_margin}} {{lowGM}}');
    gmLines.push('');
    gmLines.push('{{medium_management}}');
    gmLines.push('{{yield}} {{mediumYield}} {{kg_times}} {{price}} = {{mediumRevenue}}');
    gmLines.push('{{costs}} {{mediumCosts}}');
    gmLines.push('{{gross_margin}} {{mediumGM}}');
    gmLines.push('');
    gmLines.push('{{high_management}}');
    gmLines.push('{{yield}} {{highYield}} {{kg_times}} {{price}} = {{highRevenue}}');
    gmLines.push('{{costs}} {{highCosts}}');
    gmLines.push('{{gross_margin}} {{highGM}}');
    gmLines.push('');
    gmLines.push('{{business_summary}}');
  } else {
    gmLines.push(`GROSS MARGIN ANALYSIS FOR YOUR ${crop.toUpperCase()} ENTERPRISE (per acre)`);
    gmLines.push('Based on YOUR actual farm data, here\'s how different management levels compare');
    gmLines.push('');
    gmLines.push('LOW MANAGEMENT (33% of your current level)');
    gmLines.push(`Yield: ${lowYieldKg.toLocaleString()} kg × ${formatCurrency(pricePerKg)} = ${formatCurrency(lowRevenue)}`);
    gmLines.push(`Costs: ${formatCurrency(lowCosts)}`);
    gmLines.push(`GROSS MARGIN: ${formatCurrency(lowGM)}`);
    gmLines.push('');
    gmLines.push('MEDIUM MANAGEMENT (YOUR CURRENT LEVEL)');
    gmLines.push(`Yield: ${mediumYieldKg.toLocaleString()} kg × ${formatCurrency(pricePerKg)} = ${formatCurrency(mediumRevenue)}`);
    gmLines.push(`Costs: ${formatCurrency(mediumCosts)}`);
    gmLines.push(`GROSS MARGIN: ${formatCurrency(mediumGM)}`);
    gmLines.push('');
    gmLines.push('HIGH MANAGEMENT (126% of your current level)');
    gmLines.push(`Yield: ${highYieldKg.toLocaleString()} kg × ${formatCurrency(pricePerKg)} = ${formatCurrency(highRevenue)}`);
    gmLines.push(`Costs: ${formatCurrency(highCosts)}`);
    gmLines.push(`GROSS MARGIN: ${formatCurrency(highGM)}`);
    gmLines.push('');
    gmLines.push('BUSINESS SUMMARY');
  }

  const lowToMediumIncrease = lowGM !== 0 ? Math.round((mediumGM / lowGM - 1) * 100) : 0;
  const mediumToHighIncrease = mediumGM !== 0 ? Math.round((highGM / mediumGM - 1) * 100) : 0;
  const roi = mediumCosts !== 0 ? (mediumRevenue / mediumCosts).toFixed(1) : "0";

  if (isSwahili) {
    gmLines.push('{{from_low_to_medium}}');
    gmLines.push('{{from_medium_to_high}}');
    gmLines.push('{{every_invested}}');
    gmLines.push('{{your_current_level}}');
    gmLines.push('');
    gmLines.push('{{bottom_line}}');
    gmLines.push('{{moving_from}}');
  } else {
    gmLines.push(`From Low to Medium: +${lowToMediumIncrease}% profit increase`);
    gmLines.push(`From Medium to High: +${mediumToHighIncrease}% profit increase`);
    gmLines.push(`Every ${currencySymbol}1 invested returns ${roi} profit at your current level`);
    gmLines.push(`Your current level: ${farmerData.managementLevel || "Medium"}`);
    gmLines.push('');
    gmLines.push('BOTTOM LINE');
    gmLines.push(`Moving from ${farmerData.managementLevel || "Medium"} to High could put an extra ${formatCurrency(highGM - mediumGM)} in your pocket`);
  }

  structuredList.push({
    key: 'gross_margin_grouped',
    params: {
      content: gmLines.join('\n'),
      crop: crop.toUpperCase(),
      lowYield: lowYieldKg.toLocaleString(),
      mediumYield: mediumYieldKg.toLocaleString(),
      highYield: highYieldKg.toLocaleString(),
      price: formatCurrency(pricePerKg),
      lowRevenue: formatCurrency(lowRevenue),
      mediumRevenue: formatCurrency(mediumRevenue),
      highRevenue: formatCurrency(highRevenue),
      lowCosts: formatCurrency(lowCosts),
      mediumCosts: formatCurrency(mediumCosts),
      highCosts: formatCurrency(highCosts),
      lowGM: formatCurrency(lowGM),
      mediumGM: formatCurrency(mediumGM),
      highGM: formatCurrency(highGM),
      percentLowToMedium: lowToMediumIncrease,
      percentMediumToHigh: mediumToHighIncrease,
      roi: roi,
      level: farmerData.managementLevel || (isSwahili ? "Kati" : "Medium"),
      from: farmerData.managementLevel || (isSwahili ? "Kati" : "Medium"),
      amount: formatCurrency(highGM - mediumGM),
      symbol: currencySymbol
    }
  });

  // ========== GROUP 10: GAP ==========
  const gapKeys: Record<string, string> = {
    maize: 'gap_maize', beans: 'gap_beans', 'finger millet': 'gap_finger_millet',
    sorghum: 'gap_sorghum', onions: 'gap_onions', tomatoes: 'gap_tomatoes',
    cabbages: 'gap_cabbages', potatoes: 'gap_potatoes', bananas: 'gap_bananas',
    avocados: 'gap_avocados', coffee: 'gap_coffee', cassava: 'gap_cassava',
    'sweet potatoes': 'gap_sweet_potatoes', groundnuts: 'gap_groundnuts',
    rice: 'gap_rice', mangoes: 'gap_mangoes', pineapples: 'gap_pineapples',
    watermelons: 'gap_watermelons', carrots: 'gap_carrots', chillies: 'gap_chillies',
    spinach: 'gap_spinach', pigeonpeas: 'gap_pigeonpeas', bambaranuts: 'gap_bambaranuts',
    yams: 'gap_yams', taro: 'gap_taro', okra: 'gap_okra', tea: 'gap_tea',
    macadamia: 'gap_macadamia', cocoa: 'gap_cocoa'
  };

  const gapKey = lowerCrop in gapKeys ? gapKeys[lowerCrop] : 'gap_generic';

  structuredList.push({
    key: 'gap_grouped',
    params: {
      title: isSwahili ? '{{gap_title}}' : `GOOD AGRICULTURAL PRACTICES FOR YOUR ${crop.toUpperCase()} ENTERPRISE`,
      gapKey: gapKey,
      gapContent: '',
      remember: isSwahili ? '{{gap_remember}}' : 'REMEMBER: Every practice you do well puts more money in your pocket',
      crop: crop.toUpperCase()
    }
  });

  // ========== GROUP 11: DISEASE MANAGEMENT ==========
  if (farmerData.commonDiseases) {
    const diseaseLines: string[] = [];
    diseaseLines.push(isSwahili ? '{{disease_management_title}}' : `INTEGRATED DISEASE MANAGEMENT FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
    diseaseLines.push(isSwahili ? '{{disease_reported}}' : `The diseases affecting your ${crop.toUpperCase()} ENTERPRISE:`);

    const diseaseList = farmerData.commonDiseases.split(',').map(d => d.trim()).filter(d => d);
    diseaseList.forEach(disease => { diseaseLines.push(`• ${disease}`); });
    diseaseLines.push('');
    diseaseLines.push(isSwahili ? '{{disease_prevention_title}}' : 'PREVENTION (Cheaper than cure)');
    diseaseLines.push(isSwahili ? '{{disease_prevention_list}}' : '• Use disease-resistant varieties where available\n• Practice crop rotation (3-4 years) for soil-borne diseases\n• Ensure proper spacing for air circulation\n• Avoid working in wet fields to prevent spread\n• Remove and destroy infected plants immediately\n• Disinfect tools between fields');
    diseaseLines.push('');

    const cropLookupKey = lowerCrop.replace(/\s+/g, '');
    const cropPestsAndDiseases = cropPestDiseaseMap[cropLookupKey] || cropPestDiseaseMap[lowerCrop] || [];
    const cropDiseases = cropPestsAndDiseases.filter((pd: PestDisease) => pd.type === "disease");

    if (cropDiseases.length > 0) {
      diseaseLines.push(isSwahili ? '{{disease_control_title}}' : 'CONTROL OPTIONS FOR DISEASES IN YOUR FARM:');
      cropDiseases.forEach(disease => {
        diseaseLines.push('');
        diseaseLines.push(`📌 ${disease.name.toUpperCase()}`);

        if (disease.culturalControls.length > 0) {
          diseaseLines.push(isSwahili ? '{{disease_cultural_control}}' : '  Cultural Control:');
          disease.culturalControls.forEach(control => {
            const diseaseKey = disease.name.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
            const controlKey = control.toLowerCase()
              .replace(/[^a-z0-9]/g, '_')
              .replace(/_+/g, '_')
              .replace(/^_|_$/g, '');
            const fullKey = `disease_cultural_${diseaseKey}_${controlKey}`.substring(0, 100);

            if (isSwahili) {
              diseaseLines.push(`  • {{${fullKey}}}`);
            } else {
              diseaseLines.push(`  • ${control}`);
            }
          });
        }

        if (disease.chemicalControls.length > 0) {
          diseaseLines.push(isSwahili ? '{{disease_chemical_control}}' : '  Chemical Control:');
          disease.chemicalControls.forEach(chem => {
            if (isSwahili) {
              diseaseLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              diseaseLines.push(`    {{disease_rate}}: ${chem.rate}`);
              diseaseLines.push(`    {{disease_timing}}: ${chem.timing}`);
              if (chem.safetyInterval) diseaseLines.push(`    {{disease_safety}}: ${chem.safetyInterval}`);
              if (chem.packageSizes) diseaseLines.push(`    {{disease_pack_sizes}}: ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? '{{disease_restricted}}' : chem.status === 'banned' ? '{{disease_banned}}' : '{{disease_active}}';
              diseaseLines.push(`    {{disease_status}}: ${statusText}`);
              if (chem.notes) diseaseLines.push(`    {{disease_note}}: ${chem.notes}`);
            } else {
              diseaseLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              diseaseLines.push(`    Rate: ${chem.rate}`);
              diseaseLines.push(`    Timing: ${chem.timing}`);
              if (chem.safetyInterval) diseaseLines.push(`    Safety: ${chem.safetyInterval}`);
              if (chem.packageSizes) diseaseLines.push(`    Pack sizes: ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? '⚠️ RESTRICTED' : chem.status === 'banned' ? '❌ BANNED' : '✅ Active';
              diseaseLines.push(`    Status: ${statusText}`);
              if (chem.notes) diseaseLines.push(`    Note: ${chem.notes}`);
            }
          });
        }
        if (disease.businessNote) diseaseLines.push(`  💼 ${disease.businessNote}`);
      });
    }

    diseaseLines.push('');
    diseaseLines.push(isSwahili ? '{{disease_business_case_title}}' : 'BUSINESS CASE');
    diseaseLines.push(isSwahili ? '{{disease_business_case}}' : `Without control: Yield losses of 30-100% possible\nWith prevention: Cost ${formatCurrency(2000)}-${formatCurrency(5000)}/acre = SAVE ${formatCurrency(100000)}+!\nEvery ${currencySymbol}1 spent on disease prevention returns ${currencySymbol}20-50 in saved yield`);

    structuredList.push({
      key: 'disease_management_grouped',
      params: {
        content: diseaseLines.join('\n'),
        crop: crop.toUpperCase(),
        diseases: farmerData.commonDiseases,
        low: formatCurrency(2000),
        high: formatCurrency(5000),
        saved: formatCurrency(100000),
        symbol: currencySymbol
      }
    });
  }

  // ========== GROUP 12: PEST MANAGEMENT ==========
  if (farmerData.commonPests) {
    const pestLines: string[] = [];
    pestLines.push(isSwahili ? '{{pest_management_title}}' : `INTEGRATED PEST MANAGEMENT (IPM) FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
    pestLines.push(isSwahili ? '{{pest_reported}}' : `The pests affecting your ${crop.toUpperCase()} ENTERPRISE:`);

    const pestList = farmerData.commonPests.split(',').map(p => p.trim()).filter(p => p);
    pestList.forEach(pest => { pestLines.push(`• ${pest}`); });
    pestLines.push('');
    pestLines.push(isSwahili ? '{{pest_prevention_title}}' : 'PREVENTION (Cheaper than cure)');
    pestLines.push(isSwahili ? '{{pest_prevention_list}}' : '• Practice crop rotation with non-host crops\n• Use resistant varieties where available\n• Monitor fields weekly for early detection (FREE!)\n• Conserve natural enemies (ladybirds, spiders, parasitic wasps)\n• Remove and destroy infected plants immediately');
    pestLines.push('');

    const cropLookupKey = lowerCrop.replace(/\s+/g, '');
    const cropPestsAndDiseases = cropPestDiseaseMap[cropLookupKey] || cropPestDiseaseMap[lowerCrop] || [];
    const cropPests = cropPestsAndDiseases.filter((pd: PestDisease) => pd.type === "pest");

    if (cropPests.length > 0) {
      pestLines.push(isSwahili ? '{{pest_control_options}}' : 'CONTROL OPTIONS FOR PESTS IN YOUR FARM:');
      cropPests.forEach(pest => {
        pestLines.push('');
        pestLines.push(`🐛 ${pest.name.toUpperCase()}`);

        if (pest.culturalControls.length > 0) {
          pestLines.push(isSwahili ? '{{pest_cultural_control}}' : '  Cultural Control:');
          pest.culturalControls.forEach(control => {
            const pestKey = pest.name.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
            const controlKey = control.toLowerCase()
              .replace(/[^a-z0-9]/g, '_')
              .replace(/_+/g, '_')
              .replace(/^_|_$/g, '');
            const fullKey = `pest_cultural_${pestKey}_${controlKey}`.substring(0, 100);

            if (isSwahili) {
              pestLines.push(`  • {{${fullKey}}}`);
            } else {
              pestLines.push(`  • ${control}`);
            }
          });
        }

        if (pest.organicControls && pest.organicControls.length > 0) {
          pestLines.push(isSwahili ? '{{pest_organic_control}}' : '  Organic Control:');
          pest.organicControls.forEach(organic => {
            if (isSwahili) {
              pestLines.push(`  • ${organic.method}`);
              pestLines.push(`    {{pest_preparation}}: ${organic.preparation}`);
              pestLines.push(`    {{pest_application}}: ${organic.application}`);
            } else {
              pestLines.push(`  • ${organic.method}`);
              pestLines.push(`    Preparation: ${organic.preparation}`);
              pestLines.push(`    Application: ${organic.application}`);
            }
          });
        }

        if (pest.chemicalControls.length > 0) {
          pestLines.push(isSwahili ? '{{pest_chemical_control}}' : '  Chemical Control:');
          pest.chemicalControls.forEach(chem => {
            if (isSwahili) {
              pestLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              pestLines.push(`    {{pest_rate}}: ${chem.rate}`);
              pestLines.push(`    {{pest_timing}}: ${chem.timing}`);
              if (chem.safetyInterval) pestLines.push(`    {{pest_safety}}: ${chem.safetyInterval}`);
              if (chem.packageSizes) pestLines.push(`    {{pest_pack_sizes}}: ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? '{{pest_restricted}}' : chem.status === 'banned' ? '{{pest_banned}}' : '{{pest_active}}';
              pestLines.push(`    {{pest_status}}: ${statusText}`);
              if (chem.notes) pestLines.push(`    {{pest_note}}: ${chem.notes}`);
            } else {
              pestLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              pestLines.push(`    Rate: ${chem.rate}`);
              pestLines.push(`    Timing: ${chem.timing}`);
              if (chem.safetyInterval) pestLines.push(`    Safety: ${chem.safetyInterval}`);
              if (chem.packageSizes) pestLines.push(`    Pack sizes: ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? '⚠️ RESTRICTED' : chem.status === 'banned' ? '❌ BANNED' : '✅ Active';
              pestLines.push(`    Status: ${statusText}`);
              if (chem.notes) pestLines.push(`    Note: ${chem.notes}`);
            }
          });
        }
        if (pest.businessNote) pestLines.push(`  💼 ${pest.businessNote}`);
      });
    }

    pestLines.push('');
    pestLines.push(isSwahili ? '{{pest_business_calc_title}}' : 'BUSINESS CALCULATION');
    pestLines.push(isSwahili ? '{{pest_business_calc}}' : `Without control: Loss 40-60% yield = ${formatCurrency(80000)}-${formatCurrency(120000)} loss/acre\nWith IPM: Cost ${formatCurrency(1500)}-${formatCurrency(3000)} = SAVE ${formatCurrency(100000)}+ profit\nEvery ${currencySymbol}1 spent on pest control returns ${currencySymbol}30-40 in saved yield`);

    structuredList.push({
      key: 'pest_management_grouped',
      params: {
        content: pestLines.join('\n'),
        crop: crop.toUpperCase(),
        pests: farmerData.commonPests,
        lowLoss: formatCurrency(80000),
        highLoss: formatCurrency(120000),
        lowCost: formatCurrency(1500),
        highCost: formatCurrency(3000),
        saved: formatCurrency(100000),
        symbol: currencySymbol
      }
    });
  }

  // ========== GROUP 13: DAMAGE REPORT ==========
  if (farmerData.plantsDamaged && farmerData.plantsDamaged > 0) {
    structuredList.push({
      key: 'damage_report_grouped',
      params: {
        title: isSwahili ? '{{damage_report_title}}' : `DAMAGE REPORT FOR YOUR ${crop.toUpperCase()} ENTERPRISE`,
        plantsDamaged: farmerData.plantsDamaged,
        message: isSwahili ? '{{damage_message}}' : `You reported ${farmerData.plantsDamaged} plants damaged beyond recovery. This information helps us track farm health trends.`,
        advice: isSwahili ? '{{damage_advice}}' : 'Consider reviewing your pest and disease management strategies to prevent future losses.',
        followUp: isSwahili ? '{{damage_followup}}' : 'For personalized advice on reducing plant damage, ask our Q&A system about pest control or disease prevention.',
        crop: crop.toUpperCase(),
        plants: farmerData.plantsDamaged
      }
    });
  }

  // ========== GROUP 14: CONSERVATION ==========
  const conservationPractices = farmerData.conservationPractices ?
    farmerData.conservationPractices.split(',').map(p => p.trim()) : [];

  if (conservationPractices.length > 0) {
    const conservationLines: string[] = [];
    conservationLines.push(isSwahili ? '{{conservation_title}}' : `SOIL AND WATER CONSERVATION FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
    conservationLines.push(isSwahili ? '{{conservation_already_using}}' : `You're already using: ${conservationPractices.filter(p => p !== 'None').join(', ')}. Great job!`);
    conservationLines.push('');
    conservationLines.push(isSwahili ? '{{conservation_recommended_title}}' : 'RECOMMENDED PRACTICES');
    conservationLines.push(isSwahili ? '{{conservation_organic_manure}}' : '• Organic Manure: Continue applying 5-10 tons per acre. It improves soil structure and water holding capacity.');
    conservationLines.push(isSwahili ? '{{conservation_terracing}}' : '• Terracing: Excellent for slopes! Reduces soil erosion by up to 80%.');
    conservationLines.push(isSwahili ? '{{conservation_mulching}}' : `• Mulching: Retains moisture, reduces weeding. Use crop residues - it's FREE! (Saves ${formatCurrency(5000)}/acre)`);
    conservationLines.push(isSwahili ? '{{conservation_cover_crops}}' : `• Cover crops: Plant mucuna or dolichos between rows. Fixes 40kg N/acre naturally! (Saves ${formatCurrency(3500)} fertilizer)`);
    conservationLines.push(isSwahili ? '{{conservation_rainwater}}' : `• Rainwater harvesting: Build water pans - 1,000m³ pan costs ${formatCurrency(200000)}, lasts 10 years.`);
    conservationLines.push(isSwahili ? '{{conservation_contour}}' : '• Contour farming: On slopes >5% - reduces erosion by 50% and retains water.');
    conservationLines.push('');
    conservationLines.push(isSwahili ? '{{conservation_business_case_title}}' : 'BUSINESS CASE');
    conservationLines.push(isSwahili ? '{{conservation_business_case}}' : `Mulching saves 2 weeding rounds = ${formatCurrency(5000)}/acre saved\nCover crops fix 40kg N/acre = saves ${formatCurrency(3500)} fertilizer\nEvery ${currencySymbol}1 invested in conservation returns ${currencySymbol}5 in saved inputs and increased yields`);

    structuredList.push({
      key: 'conservation_grouped',
      params: {
        content: conservationLines.join('\n'),
        crop: crop.toUpperCase(),
        practices: conservationPractices.filter(p => p !== 'None').join(', '),
        mulchingSaved: formatCurrency(5000),
        coverCropsSaved: formatCurrency(3500),
        amount: formatCurrency(200000),
        symbol: currencySymbol
      }
    });
  }

  // ========== GROUP 15: BUSINESS ==========
  const businessLines: string[] = [];

  if (isSwahili) {
    businessLines.push('{{business_title}}');
    businessLines.push('');
    businessLines.push('{{business_know_costs_title}}');
    businessLines.push('{{business_know_costs_list}}');
    businessLines.push('{{business_know_costs_example}}');
    businessLines.push('');
    businessLines.push('{{business_buy_bulk_title}}');
    businessLines.push('{{business_buy_bulk_dap}}');
    businessLines.push('{{business_buy_bulk_can}}');
    businessLines.push('');
    businessLines.push('{{business_form_groups_title}}');
    businessLines.push('{{business_form_groups_list}}');
    businessLines.push('{{business_form_groups_transport}}');
    businessLines.push('');
    businessLines.push('{{business_exponential_title}}');
    businessLines.push('{{business_exponential}}');
    businessLines.push('');
    businessLines.push('{{business_bottom_line}}');
  } else {
    businessLines.push('FARMING AS A BUSINESS - MAXIMIZE YOUR PROFIT');
    businessLines.push('');
    businessLines.push('1. KNOW YOUR COSTS');
    businessLines.push('Track EVERY input: seeds, fertilizer, labour, transport, bags');
    businessLines.push(`Example maize medium: Costs ${formatCurrency(40000)}/hectare`);
    businessLines.push('');
    businessLines.push('2. BUY IN BULK (Save 20-30%)');
    businessLines.push(`DAP: 50kg bag ${formatCurrency(3500)} -> Buy 10 bags ${formatCurrency(31500)} (save ${formatCurrency(3500)})`);
    businessLines.push(`CAN: 50kg bag ${formatCurrency(3200)} -> Buy 10 bags ${formatCurrency(28800)} (save ${formatCurrency(3200)})`);
    businessLines.push('');
    businessLines.push('3. FORM FARMER GROUPS');
    businessLines.push('Bulk input purchases: Save 15-25%');
    businessLines.push(`Shared transport: Save ${formatCurrency(5000)}/acre`);
    businessLines.push('Collective marketing: Get 10-20% higher prices');
    businessLines.push('');
    businessLines.push('4. EXPONENTIAL PHASE');
    businessLines.push(`Every additional ${currencySymbol}1 input returns ${currencySymbol}3-5 profit`);
    businessLines.push('Keep investing - more inputs = more profits');
    businessLines.push('');
    businessLines.push(`BOTTOM LINE: Farming is a BUSINESS. Make every ${currencySymbol} work for you`);
  }

  structuredList.push({
    key: 'business_grouped',
    params: {
      content: businessLines.join('\n'),
      amount: formatCurrency(40000),
      single: formatCurrency(3500),
      ten: formatCurrency(31500),
      saved: formatCurrency(3500),
      symbol: currencySymbol
    }
  });

  // ========== FINANCIAL ADVICE ==========
  const financialParams: Record<string, any> = { symbol: currencySymbol };
  if (hasSoilTest && fertilizerPlan?.totalCost) {
    financialParams.totalInvestment = formatCurrency(fertilizerPlan.totalCost);
  }
  const structuredFinancialAdvice: RecommendationItem = {
    key: 'financial_advice',
    params: financialParams
  };

  const list = structuredList.map(item => item.key + (item.params ? JSON.stringify(item.params) : ''));
  const financialAdvice = structuredFinancialAdvice.key;

  return {
    list,
    financialAdvice,
    structuredList,
    structuredFinancialAdvice
  };
}