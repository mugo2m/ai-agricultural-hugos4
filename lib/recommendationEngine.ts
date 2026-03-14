// lib/recommendationEngine.ts – Grouped recommendations for cleaner display
import { COUNTRY_CURRENCY_MAP } from '@/lib/config/currency';
import { cropPestDiseaseMap, PestDisease } from '@/lib/data/pestDiseaseMapping';
import { nutrientDeficiencies, findDeficiencyBySymptom, getDeficienciesForCrop } from '@/lib/data/nutrientDeficiency';

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
    deficiencySymptoms?: string;      // NEW: Farmer-reported deficiency symptoms
    deficiencyLocation?: string;      // NEW: Where symptoms appear
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

export function generateRecommendations(input: RecommendationInput): RecommendationOutput {
  const structuredList: RecommendationItem[] = [];
  const { hasSoilTest, soilAnalysis, fertilizerPlan, crop, farmerData } = input;
  const lowerCrop = crop.toLowerCase();
  const country = farmerData.country || 'kenya';

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

    structuredList.push({
      key: 'soil_test_grouped',
      params: {
        title: 'SOIL TEST ANALYSIS - KNOW YOUR SOIL, GROW YOUR BUSINESS',
        content: soilLines.join('\n'),
        insight: 'BUSINESS INSIGHT: Every {{symbol}} 1 invested in soil correction returns {{symbol}} 3-5 in higher yields!',
        yearly: 'TEST SOIL YEARLY to track improvements and adjust inputs.',
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
    if (soilAnalysis) {
      if (soilAnalysis.ph < 5.5) {
        if (soilAnalysis.calcium && soilAnalysis.calcium < 400) {
          whyText = `Why: Your pH is ${soilAnalysis.ph} (acidic) and your calcium is low (${soilAnalysis.calcium} ppm). Calcitic lime fixes both problems!`;
        } else {
          whyText = `Why: Your pH is ${soilAnalysis.ph} (acidic). Calcitic lime will raise pH and add calcium.`;
        }
      } else if (soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        whyText = `Why: Your calcium is low (${soilAnalysis.calcium} ppm). Calcitic lime adds calcium without adding magnesium.`;
      }
    }

    structuredList.push({
      key: 'calcitic_lime_grouped',
      params: {
        title: 'CALCITIC LIME RECOMMENDATION FROM YOUR SOIL TEST',
        need: `Based on your soil test, you need ${limeKg} kg of calcitic lime per acre.`,
        bags: `This is ${bagsNeeded} bags of 50kg.`,
        cost: `Cost: ${formatCurrency(totalCost)} (${formatCurrency(limePricePerBag)} per bag)`,
        why: whyText,
        application: 'Apply 3-4 weeks before planting and incorporate into top 10-15cm soil.',
        wait: 'Wait 1-2 weeks before applying nitrogen fertilizers.',
        business: 'BUSINESS CASE: Proper pH can increase nutrient uptake by 30-50%!',
        yearly: 'TEST SOIL YEARLY to know when to reapply.'
      }
    });
  }

  // ========== GROUP 3: FERTILIZER PLAN HEADER ==========
  if (hasSoilTest && fertilizerPlan) {
    structuredList.push({
      key: 'fertilizer_header_grouped',
      params: {
        title: `PRECISION FERTILIZER INVESTMENT PLAN for your ${crop.toUpperCase()} ENTERPRISE`,
        farmSize: `Your farm size: ${fertilizerPlan.farmSize} acre(s)`,
        totalInvestment: `TOTAL FERTILIZER INVESTMENT: ${formatCurrency(fertilizerPlan.totalCost || 0)} for your entire farm`
      }
    });

    // ========== GROUP 4: PLANTING FERTILIZERS ==========
    if (fertilizerPlan.plantingRecommendations?.length > 0) {
      const plantingLines: string[] = [];
      plantingLines.push('PLANTING FERTILIZERS (apply at planting)');

      fertilizerPlan.plantingRecommendations.forEach((rec: any) => {
        const bagsNeeded = Math.floor(rec.amountKg / 50);
        const extraKg = rec.amountKg % 50;
        const cost = Math.round(rec.amountKg * (rec.pricePer50kg / 50));
        plantingLines.push(
          `Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})`,
          `This is ${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`,
          `Cost: ${formatCurrency(cost)}`,
          `Provides: ${rec.provides.n.toFixed(1)} kg N, ${rec.provides.p.toFixed(1)} kg P, ${rec.provides.k.toFixed(1)} kg K`,
          ``
        );
      });

      structuredList.push({
        key: 'planting_fertilizers_grouped',
        params: { content: plantingLines.join('\n') }
      });
    }

    // ========== GROUP 5: TOPDRESSING FERTILIZERS ==========
    if (fertilizerPlan.topDressingRecommendations?.length > 0) {
      const topdressingLines: string[] = [];
      topdressingLines.push('TOP DRESSING FERTILIZERS (apply 3-4 weeks after planting)');

      fertilizerPlan.topDressingRecommendations.forEach((rec: any) => {
        const bagsNeeded = Math.floor(rec.amountKg / 50);
        const extraKg = rec.amountKg % 50;
        const cost = Math.round(rec.amountKg * (rec.pricePer50kg / 50));
        const provides = rec.provides.n > 0
          ? `Provides: ${rec.provides.n.toFixed(1)} kg N`
          : `Provides: ${rec.provides.k.toFixed(1)} kg K`;

        topdressingLines.push(
          `Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})`,
          `This is ${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`,
          `Cost: ${formatCurrency(cost)}`,
          provides,
          ``
        );
      });

      structuredList.push({
        key: 'topdressing_fertilizers_grouped',
        params: { content: topdressingLines.join('\n') }
      });
    }

    // ========== GROUP 6: PLANT POPULATION & PER PLANT ==========
    if (fertilizerPlan.perPlant) {
      const perPlant = fertilizerPlan.perPlant;
      const plantLines: string[] = [];

      plantLines.push('---');
      plantLines.push('PLANT POPULATION');
      plantLines.push(`Based on your spacing, you have approximately ${perPlant.totalPlants?.toLocaleString()} plants on your ${fertilizerPlan.farmSize} acre farm.`);
      plantLines.push('');
      plantLines.push('FERTILIZER PER PLANT');
      // UPDATED: Show measurement guide for each fertilizer individually
      plantLines.push(`DAP: ${perPlant.dapGrams} grams (${perPlant.dapGuide})`);
      plantLines.push(`UREA: ${perPlant.ureaGrams} grams (${perPlant.ureaGuide})`);
      plantLines.push(`MOP: ${perPlant.mopGrams} grams (${perPlant.mopGuide})`);
      plantLines.push(`TOTAL: ${perPlant.totalGrams} grams (${perPlant.totalGuide})`);

      structuredList.push({
        key: 'plant_population_grouped',
        params: { content: plantLines.join('\n') }
      });
    }

    // Business tip and remember
    structuredList.push({
      key: 'fertilizer_business_tip',
      params: { symbol: currencySymbol }
    });

    structuredList.push({
      key: 'fertilizer_remember',
      params: { crop: crop.toUpperCase() }
    });
  }

  // ========== GROUP 7: GROSS MARGIN ANALYSIS WITH KG VALIDATION ==========
  let actualYieldKg = farmerData.actualYieldKg || 0;
  let pricePerKg = farmerData.pricePerKg || 0;
  let actualCosts = farmerData.totalCosts || 0;

  // Set defaults based on crop if missing - UPDATED WITH 15 NEW CROPS
  if (!actualYieldKg || actualYieldKg === 0) {
    const defaultYields: Record<string, number> = {
      // Existing crops
      maize: 2000,
      beans: 1200,
      onions: 8000,
      potatoes: 10000,
      tomatoes: 15000,
      cabbages: 12000,
      kales: 8000,
      bananas: 6000,
      avocados: 2000,
      coffee: 2000,
      sugarcane: 40000,
      rice: 3000,
      sorghum: 1500,
      millet: 1200,
      groundnuts: 1000,
      cassava: 8000,
      sweetpotatoes: 7000,

      // NEW CROPS ADDED
      mangoes: 8000,
      pineapples: 20000,
      watermelons: 15000,
      carrots: 10000,
      chillies: 6000,
      spinach: 8000,
      pigeonpeas: 1000,
      bambaranuts: 800,
      yams: 12000,
      taro: 10000,
      okra: 7000,
      tea: 2500,
      macadamia: 4000,
      cocoa: 800
    };
    actualYieldKg = defaultYields[lowerCrop] || 2000;
  }

  if (!pricePerKg || pricePerKg === 0) {
    const defaultPrices: Record<string, number> = {
      // Existing crops
      maize: 40,
      beans: 80,
      onions: 50,
      potatoes: 30,
      tomatoes: 40,
      cabbages: 25,
      kales: 20,
      bananas: 30,
      avocados: 40,
      coffee: 300,
      sugarcane: 5,
      rice: 60,
      sorghum: 45,
      millet: 50,
      groundnuts: 120,
      cassava: 20,
      sweetpotatoes: 25,

      // NEW CROPS ADDED
      mangoes: 50,
      pineapples: 40,
      watermelons: 30,
      carrots: 40,
      chillies: 80,
      spinach: 25,
      pigeonpeas: 70,
      bambaranuts: 80,
      yams: 50,
      taro: 40,
      okra: 35,
      tea: 200,
      macadamia: 150,
      cocoa: 300
    };
    pricePerKg = defaultPrices[lowerCrop] || 40;
  }

  if (!actualCosts || actualCosts === 0) {
    actualCosts = fertilizerPlan?.totalCost || 25000;
  }

  const LOW_PERCENT = 0.33;
  const HIGH_PERCENT = 1.26;

  // Low management
  const lowYieldKg = Math.round(actualYieldKg * LOW_PERCENT);
  const lowRevenue = lowYieldKg * pricePerKg;
  const lowCosts = Math.round(actualCosts * LOW_PERCENT);
  const lowGM = lowRevenue - lowCosts;

  // Medium management (current)
  const mediumYieldKg = actualYieldKg;
  const mediumRevenue = actualYieldKg * pricePerKg;
  const mediumCosts = actualCosts;
  const mediumGM = mediumRevenue - mediumCosts;

  // High management
  const highYieldKg = Math.round(actualYieldKg * HIGH_PERCENT);
  const highRevenue = highYieldKg * pricePerKg;
  const highCosts = Math.round(actualCosts * HIGH_PERCENT);
  const highGM = highRevenue - highCosts;

  const gmLines: string[] = [];
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

  const lowToMediumIncrease = lowGM !== 0 ? Math.round((mediumGM / lowGM - 1) * 100) : 0;
  const mediumToHighIncrease = mediumGM !== 0 ? Math.round((highGM / mediumGM - 1) * 100) : 0;
  const roi = mediumCosts !== 0 ? (mediumRevenue / mediumCosts).toFixed(1) : "0";

  gmLines.push(`From Low to Medium: +${lowToMediumIncrease}% profit increase`);
  gmLines.push(`From Medium to High: +${mediumToHighIncrease}% profit increase`);
  gmLines.push(`Every ${currencySymbol}1 invested returns ${roi} profit at your current level`);
  gmLines.push(`Your current level: ${farmerData.managementLevel || "Medium"}`);
  gmLines.push('');
  gmLines.push('BOTTOM LINE');
  gmLines.push(`Moving from ${farmerData.managementLevel || "Medium"} to High could put an extra ${formatCurrency(highGM - mediumGM)} in your pocket`);

  structuredList.push({
    key: 'gross_margin_grouped',
    params: { content: gmLines.join('\n') }
  });

  // ========== GROUP 8: GOOD AGRICULTURAL PRACTICES (GAP) ==========
  const gapKeys: Record<string, string> = {
    // Existing crops
    maize: 'gap_maize',
    beans: 'gap_beans',
    'finger millet': 'gap_finger_millet',
    sorghum: 'gap_sorghum',
    onions: 'gap_onions',
    tomatoes: 'gap_tomatoes',
    cabbages: 'gap_cabbages',
    potatoes: 'gap_potatoes',
    bananas: 'gap_bananas',
    avocados: 'gap_avocados',
    coffee: 'gap_coffee',
    cassava: 'gap_cassava',
    'sweet potatoes': 'gap_sweet_potatoes',
    groundnuts: 'gap_groundnuts',

    // NEW CROPS ADDED
    rice: 'gap_rice',
    mangoes: 'gap_mangoes',
    pineapples: 'gap_pineapples',
    watermelons: 'gap_watermelons',
    carrots: 'gap_carrots',
    chillies: 'gap_chillies',
    spinach: 'gap_spinach',
    pigeonpeas: 'gap_pigeonpeas',
    bambaranuts: 'gap_bambaranuts',
    yams: 'gap_yams',
    taro: 'gap_taro',
    okra: 'gap_okra',
    tea: 'gap_tea',
    macadamia: 'gap_macadamia',
    cocoa: 'gap_cocoa'
  };

  // Get the gap key for this crop
  const gapKey = lowerCrop in gapKeys ? gapKeys[lowerCrop] : 'gap_generic';

  // For avocados, provide the text directly
  let gapContent = '';
  if (lowerCrop === 'avocados' || lowerCrop === 'avocado') {
    gapContent = `Seed: Use certified avocado seedlings. Varieties: Hass, Fuerte, Pinkerton
Spacing: 5m x 5m (174 trees per acre) for standard varieties
Soil: Well-drained, deep soil with pH 5.5-6.5
Planting: Plant at start of rains, dig 60cm x 60cm x 60cm holes
Fertilizer: Apply DAP at planting, CAN annually
Watering: Young trees need regular watering, mature trees are drought-tolerant
Maturity: 3-4 years for grafted trees
Yield: 100-300 kg per tree (17,000-52,000 kg per acre) with good management

AGROCHEMICAL SAFETY:
• Always wear protective gear (gloves, mask, goggles) when handling chemicals
• Follow label instructions exactly - more is NOT better
• Observe pre-harvest intervals to prevent chemical residues on fruits
• Dispose of containers properly - never reuse for food or water
• Store chemicals away from children, food, and water sources

METAL TRACEABILITY:
• Improper chemical use can leave heavy metal residues in soil and fruits
• Test soil annually to monitor metal accumulation
• Use organic amendments to bind heavy metals
• Consider organic certification for premium prices
• Keep records of all chemical applications for traceability`;
  }

  structuredList.push({
    key: 'gap_grouped',
    params: {
      title: `GOOD AGRICULTURAL PRACTICES FOR YOUR ${crop.toUpperCase()} ENTERPRISE`,
      gapKey: gapKey,
      gapContent: gapContent,
      remember: 'REMEMBER: Every practice you do well puts more money in your pocket'
    }
  });

  // ========== GROUP 9: DISEASE MANAGEMENT ==========
  if (farmerData.commonDiseases) {
    const diseaseLines: string[] = [];
    diseaseLines.push(`INTEGRATED DISEASE MANAGEMENT FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);

    // PERSONALIZED: List the farmer's specific diseases
    diseaseLines.push(`The diseases affecting your ${crop.toUpperCase()} ENTERPRISE:`);

    // Split and clean the disease list
    const diseaseList = farmerData.commonDiseases.split(',').map(d => d.trim()).filter(d => d);
    diseaseList.forEach(disease => {
      diseaseLines.push(`• ${disease}`);
    });

    diseaseLines.push('');
    diseaseLines.push('PREVENTION (Cheaper than cure)');
    diseaseLines.push('• Use disease-resistant varieties where available');
    diseaseLines.push('• Practice crop rotation (3-4 years) for soil-borne diseases');
    diseaseLines.push('• Ensure proper spacing for air circulation');
    diseaseLines.push('• Avoid working in wet fields to prevent spread');
    diseaseLines.push('• Remove and destroy infected plants immediately');
    diseaseLines.push('• Disinfect tools between fields');
    diseaseLines.push('');

    // Get diseases for this crop from the database
    // Normalize crop name for lookup (remove spaces)
    const cropLookupKey = lowerCrop.replace(/\s+/g, '');
    const cropPestsAndDiseases = cropPestDiseaseMap[cropLookupKey] || cropPestDiseaseMap[lowerCrop] || [];
    const cropDiseases = cropPestsAndDiseases.filter((pd: PestDisease) => pd.type === "disease");

    if (cropDiseases.length > 0) {
      diseaseLines.push('CONTROL OPTIONS FOR DISEASES IN YOUR FARM:');
      // Display each disease with its controls
      cropDiseases.forEach(disease => {
        diseaseLines.push('');
        diseaseLines.push(`📌 ${disease.name.toUpperCase()}`);

        // Cultural controls
        if (disease.culturalControls.length > 0) {
          diseaseLines.push('  Cultural Control:');
          disease.culturalControls.forEach(control => {
            diseaseLines.push(`  • ${control}`);
          });
        }

        // Chemical controls
        if (disease.chemicalControls.length > 0) {
          diseaseLines.push('  Chemical Control:');
          disease.chemicalControls.forEach(chem => {
            diseaseLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
            diseaseLines.push(`    Rate: ${chem.rate}`);
            diseaseLines.push(`    Timing: ${chem.timing}`);
            if (chem.safetyInterval) {
              diseaseLines.push(`    Safety: ${chem.safetyInterval}`);
            }
            if (chem.packageSizes) {
              const packageInfo = chem.packageSizes.join(' • ');
              diseaseLines.push(`    Pack sizes: ${packageInfo}`);
            }
            if (chem.status) {
              const statusText = chem.status === 'restricted' ? '⚠️ RESTRICTED' :
                                chem.status === 'banned' ? '❌ BANNED' :
                                chem.status === 'check-locally' ? '🔍 Check locally' : '✅ Active';
              diseaseLines.push(`    Status: ${statusText}`);
            }
            if (chem.notes) {
              diseaseLines.push(`    Note: ${chem.notes}`);
            }
          });
        }

        // Business note
        if (disease.businessNote) {
          diseaseLines.push(`  💼 ${disease.businessNote}`);
        }
      });
    } else {
      // Fallback to generic tips if no specific diseases found
      diseaseLines.push('GENERAL DISEASE MANAGEMENT TIPS');
      diseaseLines.push('• Start with certified disease-free seed/planting material');
      diseaseLines.push('• Practice crop rotation (at least 2-3 years)');
      diseaseLines.push('• Ensure proper spacing for air circulation');
      diseaseLines.push('• Remove and destroy infected plants immediately');
      diseaseLines.push('• Apply preventative fungicides during humid conditions');
      diseaseLines.push('• Consult local agricultural extension for specific recommendations');
    }

    diseaseLines.push('');
    diseaseLines.push('BUSINESS CASE');
    diseaseLines.push(`Without control: Yield losses of 30-100% possible`);
    diseaseLines.push(`With prevention: Cost ${formatCurrency(2000)}-${formatCurrency(5000)}/acre = SAVE ${formatCurrency(100000)}+!`);
    diseaseLines.push(`Every ${currencySymbol}1 spent on disease prevention returns ${currencySymbol}20-50 in saved yield`);

    structuredList.push({
      key: 'disease_management_grouped',
      params: { content: diseaseLines.join('\n') }
    });
  }

  // ========== GROUP 10: PEST MANAGEMENT ==========
  if (farmerData.commonPests) {
    const pestLines: string[] = [];
    pestLines.push(`INTEGRATED PEST MANAGEMENT (IPM) FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);

    // PERSONALIZED: List the farmer's specific pests
    pestLines.push(`The pests affecting your ${crop.toUpperCase()} ENTERPRISE:`);

    // Split and clean the pest list
    const pestList = farmerData.commonPests.split(',').map(p => p.trim()).filter(p => p);
    pestList.forEach(pest => {
      pestLines.push(`• ${pest}`);
    });

    pestLines.push('');
    pestLines.push('PREVENTION (Cheaper than cure)');
    pestLines.push('• Practice crop rotation with non-host crops');
    pestLines.push('• Use resistant varieties where available');
    pestLines.push('• Monitor fields weekly for early detection (FREE!)');
    pestLines.push('• Conserve natural enemies (ladybirds, spiders, parasitic wasps)');
    pestLines.push('• Remove and destroy infected plants immediately');
    pestLines.push('');

    // Get pests for this crop from the database
    // Normalize crop name for lookup (remove spaces)
    const cropLookupKey = lowerCrop.replace(/\s+/g, '');
    const cropPestsAndDiseases = cropPestDiseaseMap[cropLookupKey] || cropPestDiseaseMap[lowerCrop] || [];
    const cropPests = cropPestsAndDiseases.filter((pd: PestDisease) => pd.type === "pest");

    if (cropPests.length > 0) {
      pestLines.push('CONTROL OPTIONS FOR PESTS IN YOUR FARM:');
      // Display each pest with its controls
      cropPests.forEach(pest => {
        pestLines.push('');
        pestLines.push(`🐛 ${pest.name.toUpperCase()}`);

        // Cultural controls
        if (pest.culturalControls.length > 0) {
          pestLines.push('  Cultural Control:');
          pest.culturalControls.forEach(control => {
            pestLines.push(`  • ${control}`);
          });
        }

        // Organic controls
        if (pest.organicControls && pest.organicControls.length > 0) {
          pestLines.push('  Organic Control:');
          pest.organicControls.forEach(organic => {
            pestLines.push(`  • ${organic.method}`);
            pestLines.push(`    Preparation: ${organic.preparation}`);
            pestLines.push(`    Application: ${organic.application}`);
          });
        }

        // Chemical controls
        if (pest.chemicalControls.length > 0) {
          pestLines.push('  Chemical Control:');
          pest.chemicalControls.forEach(chem => {
            pestLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
            pestLines.push(`    Rate: ${chem.rate}`);
            pestLines.push(`    Timing: ${chem.timing}`);
            if (chem.safetyInterval) {
              pestLines.push(`    Safety: ${chem.safetyInterval}`);
            }
            if (chem.packageSizes) {
              const packageInfo = chem.packageSizes.join(' • ');
              pestLines.push(`    Pack sizes: ${packageInfo}`);
            }
            if (chem.status) {
              const statusText = chem.status === 'restricted' ? '⚠️ RESTRICTED' :
                                chem.status === 'banned' ? '❌ BANNED' :
                                chem.status === 'check-locally' ? '🔍 Check locally' : '✅ Active';
              pestLines.push(`    Status: ${statusText}`);
            }
            if (chem.notes) {
              pestLines.push(`    Note: ${chem.notes}`);
            }
          });
        }

        // Business note
        if (pest.businessNote) {
          pestLines.push(`  💼 ${pest.businessNote}`);
        }
      });
    } else {
      // Fallback to generic tips if no specific pests found
      pestLines.push('GENERAL PEST MANAGEMENT TIPS');
      pestLines.push('• Monitor fields weekly for early detection');
      pestLines.push('• Use pheromone traps for monitoring');
      pestLines.push('• Apply insecticides only when thresholds are reached');
      pestLines.push('• Rotate chemical groups to prevent resistance');
    }

    pestLines.push('');
    pestLines.push('BUSINESS CALCULATION');
    pestLines.push(`Without control: Loss 40-60% yield = ${formatCurrency(80000)}-${formatCurrency(120000)} loss/acre`);
    pestLines.push(`With IPM: Cost ${formatCurrency(1500)}-${formatCurrency(3000)} = SAVE ${formatCurrency(100000)}+ profit`);
    pestLines.push(`Every ${currencySymbol}1 spent on pest control returns ${currencySymbol}30-40 in saved yield`);

    structuredList.push({
      key: 'pest_management_grouped',
      params: { content: pestLines.join('\n') }
    });
  }

  // ========== GROUP 11: CONSERVATION ==========
  const conservationPractices = farmerData.conservationPractices ?
    farmerData.conservationPractices.split(',').map(p => p.trim()) : [];

  if (conservationPractices.length > 0) {
    const conservationLines: string[] = [];
    conservationLines.push(`SOIL AND WATER CONSERVATION FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
    conservationLines.push(`You're already using: ${conservationPractices.filter(p => p !== 'None').join(', ')}. Great job!`);
    conservationLines.push('');
    conservationLines.push('RECOMMENDED PRACTICES');
    conservationLines.push('• Organic Manure: Continue applying 5-10 tons per acre. It improves soil structure and water holding capacity.');
    conservationLines.push('• Terracing: Excellent for slopes! Reduces soil erosion by up to 80%.');
    conservationLines.push(`• Mulching: Retains moisture, reduces weeding. Use crop residues - it's FREE! (Saves ${formatCurrency(5000)}/acre)`);
    conservationLines.push(`• Cover crops: Plant mucuna or dolichos between rows. Fixes 40kg N/acre naturally! (Saves ${formatCurrency(3500)} fertilizer)`);
    conservationLines.push(`• Rainwater harvesting: Build water pans - 1,000m³ pan costs ${formatCurrency(200000)}, lasts 10 years.`);
    conservationLines.push('• Contour farming: On slopes >5% - reduces erosion by 50% and retains water.');
    conservationLines.push('');
    conservationLines.push('BUSINESS CASE');
    conservationLines.push(`Mulching saves 2 weeding rounds = ${formatCurrency(5000)}/acre saved`);
    conservationLines.push(`Cover crops fix 40kg N/acre = saves ${formatCurrency(3500)} fertilizer`);
    conservationLines.push(`Every ${currencySymbol}1 invested in conservation returns ${currencySymbol}5 in saved inputs and increased yields`);

    structuredList.push({
      key: 'conservation_grouped',
      params: { content: conservationLines.join('\n') }
    });
  }

  // ========== GROUP 12: BUSINESS ==========
  const businessLines: string[] = [];
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

  structuredList.push({
    key: 'business_grouped',
    params: { content: businessLines.join('\n') }
  });

  // ========== GROUP 13: NUTRIENT DEFICIENCY DIAGNOSIS ==========
  if (farmerData.deficiencySymptoms) {
    const defLines: string[] = [];
    defLines.push(`🔍 NUTRIENT DEFICIENCY DIAGNOSIS FOR YOUR ${crop.toUpperCase()}`);
    defLines.push(`Your reported symptoms: ${farmerData.deficiencySymptoms}`);
    if (farmerData.deficiencyLocation) {
      defLines.push(`Symptom location: ${farmerData.deficiencyLocation}`);
    }
    defLines.push('');

    // Find matching deficiencies for this crop
    const possibleDeficiencies = farmerData.deficiencySymptoms.length > 3
      ? findDeficiencyBySymptom(farmerData.deficiencySymptoms, lowerCrop)
      : getDeficienciesForCrop(lowerCrop).slice(0, 3); // Show common deficiencies if no symptoms

    if (possibleDeficiencies.length > 0) {
      defLines.push(`Possible nutrient deficiencies based on your description:`);
      defLines.push('');

      possibleDeficiencies.slice(0, 3).forEach(def => { // Show top 3 matches
        defLines.push(`📌 ${def.nutrient} (${def.nutrientSymbol}) - ${def.mobility === 'mobile' ? '⬆️ Affects older leaves first' : '⬇️ Affects new growth first'}`);
        defLines.push(`  Description: ${def.description}`);
        defLines.push(`  Visual signs:`);
        def.visualCues.slice(0, 3).forEach(cue => {
          defLines.push(`  • ${cue}`);
        });
        defLines.push(`  Recommended correction:`);
        defLines.push(`  • Fertilizer: ${def.correction.fertilizer.join(' or ')}`);
        defLines.push(`  • Rate: ${def.correction.rate}`);
        defLines.push(`  • Application: ${def.correction.application}`);
        if (def.correction.organic) {
          defLines.push(`  • Organic options: ${def.correction.organic.join(', ')}`);
        }
        defLines.push('');
      });

      if (possibleDeficiencies.length > 3) {
        defLines.push(`... and ${possibleDeficiencies.length - 3} other possible deficiencies`);
        defLines.push('');
      }
    } else {
      defLines.push(`No specific deficiencies match your exact symptoms for ${crop}.`);
      defLines.push(`Here are common nutrient issues to check:`);
      defLines.push('');

      // Show common deficiencies for this crop
      const commonDefs = getDeficienciesForCrop(lowerCrop).slice(0, 4);
      commonDefs.forEach(def => {
        defLines.push(`• ${def.nutrient} (${def.nutrientSymbol}): ${def.description}`);
      });
      defLines.push('');
    }

    defLines.push(`💼 BUSINESS TIP: Early detection of nutrient deficiencies can save 30-50% of your yield!`);
    defLines.push(`📞 For confirmation, consult your local agricultural extension officer or take a soil test.`);
    defLines.push('');
    defLines.push(`✅ RECOMMENDED NEXT STEPS:`);
    defLines.push(`1. Apply the recommended fertilizer for the most likely deficiency`);
    defLines.push(`2. Wait 7-10 days and observe if symptoms improve`);
    defLines.push(`3. If no improvement, consider a soil test for accurate diagnosis`);

    structuredList.push({
      key: 'nutrient_deficiency_grouped',
      params: { content: defLines.join('\n') }
    });
  }

  // ========== FINANCIAL ADVICE ==========
  const financialParams: Record<string, any> = { symbol: currencySymbol };
  if (hasSoilTest && fertilizerPlan?.totalCost) {
    financialParams.totalInvestment = formatCurrency(fertilizerPlan.totalCost);
  }
  const structuredFinancialAdvice: RecommendationItem = {
    key: 'financial_advice',
    params: financialParams
  };

  // Build backward-compatible string lists
  const list = structuredList.map(item => item.key + (item.params ? JSON.stringify(item.params) : ''));
  const financialAdvice = structuredFinancialAdvice.key;

  return {
    list,
    financialAdvice,
    structuredList,
    structuredFinancialAdvice
  };
}