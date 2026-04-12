// app/api/vapi/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { soilTestInterpreter } from "@/lib/soilTestInterpreter";
import { fertilizerCalculator } from "@/lib/fertilizerCalculator";
import { generateRecommendations } from "@/lib/recommendationEngine";
import { calculateGrossMarginFromFarmerData, convertToKg, validateYield, validatePrice } from "@/lib/utils";
import { getSpacingOptions } from "@/lib/data/spacing";
import { getPlantingFertilizersByCrop } from "@/lib/fertilizers/plantingFertilizers";
import { getTopDressingFertilizersByCrop } from "@/lib/fertilizers/topDressingFertilizers";
import { getPlantingAdvice, getPlantingAdviceText } from "@/lib/data/plantingDates";

console.log("Farmer Session Generation Route Loaded");

// ========== COMPREHENSIVE DEFAULT YIELDS (bags per acre for common units) ==========
const defaultYieldsBags: Record<string, number> = {
  // Cereals & grains
  maize: 27, rice: 30, wheat: 25, barley: 25, sorghum: 20, millet: 18,
  "finger millet": 18, teff: 15, triticale: 25, oats: 20, buckwheat: 15,
  quinoa: 18, fonio: 12, spelt: 20, kamut: 20, "amaranth grain": 12,
  // Pulses & legumes
  beans: 12, cowpeas: 10, "green grams": 10, groundnuts: 15, "soya beans": 15,
  pigeonpeas: 12, bambaranuts: 10, chickpea: 10, lentil: 10, "faba bean": 12,
  peanut: 15,
  // Root & tuber crops (bags of 50kg)
  cassava: 120, "sweet potatoes": 100, "irish potatoes": 100, yams: 80, taro: 80,
  ginger: 60, turmeric: 50, horseradish: 40, parsnip: 60, turnip: 60, rutabaga: 60,
  // Vegetables (90kg bags for heavy vegetables, 50kg for leafy)
  tomatoes: 150, onions: 80, carrots: 100, cabbages: 100, kales: 80,
  capsicums: 80, chillies: 60, brinjals: 80, "french beans": 50, "garden peas": 40,
  spinach: 80, okra: 70, lettuce: 80, broccoli: 60, cauliflower: 60,
  celery: 80, leeks: 80, beetroot: 80, radish: 80, pumpkin: 100,
  courgettes: 80, cucumbers: 100, "pumpkin leaves": 80, "sweet potato leaves": 80,
  "ethiopian kale": 80, "jute mallow": 60, "spider plant": 60, "african nightshade": 50,
  amaranth: 40, arugula: 50, asparagus: 30, artichoke: 50, rhubarb: 80,
  wasabi: 50, "bok choy": 80, "collard greens": 80, "mustard greens": 60,
  "swiss chard": 80, radicchio: 60, escarole: 60, frisee: 60, "turnip greens": 60,
  // Fruits (90kg bags)
  bananas: 60, mangoes: 80, avocados: 20, oranges: 100, pineapples: 200,
  watermelons: 150, pawpaws: 100, "passion fruit": 80, grapefruit: 100, lemons: 100,
  limes: 80, guava: 80, jackfruit: 50, breadfruit: 50, pomegranate: 60,
  "star fruit": 80, coconut: 30, cashew: 20, macadamia: 40, fig: 60,
  "date palm": 50, mulberry: 40, lychee: 50, persimmon: 60, gooseberry: 40,
  currant: 30, elderberry: 30, rambutan: 50, durian: 80, mangosteen: 40,
  longan: 50, marula: 40,
  // Cash crops (90kg bags for coffee/tea, etc.)
  coffee: 20, tea: 25, cocoa: 8, cotton: 20, sunflower: 15, simsim: 8,
  sugarcane: 400, tobacco: 20, sisal: 50, pyrethrum: 10, "oil palm": 80,
  rubber: 5,
  // Herbs & spices (50kg bags)
  vanilla: 8, "black pepper": 15, cardamom: 10, cinnamon: 15, cloves: 8,
  coriander: 10, basil: 20, mint: 20, rosemary: 20, thyme: 20, oregano: 20,
  sage: 20, dill: 10, fennel: 20, lavender: 10, chamomile: 10, echinacea: 10,
  ginseng: 8, goldenseal: 8, "stinging nettle": 50, moringa: 50, stevia: 10,
  fenugreek: 8, cumin: 5, caraway: 5, anise: 5, lovage: 20, marjoram: 20,
  tarragon: 20, sorrel: 20, chervil: 20, savory: 20, calendula: 10, nasturtium: 20,
  borage: 20, "st. john's wort": 10, valerian: 10,
  // Forage grasses (tons, not bags – we'll treat as 100kg bags for simplicity)
  brachiaria: 100, "buffel grass": 60, "guinea grass": 80, "italian ryegrass": 80,
  "napier grass": 200, "napier hybrid": 250, "orchard grass": 80, "rhodes grass": 80,
  "timothy grass": 80, "forage sorghum": 150, leucaena: 80, calliandra: 80,
  sesbania: 80, cenchrus: 60,
  // Other
  bamboo: 50, "aloe vera": 100, "oyster nut": 20, watercress: 50, ramie: 30,
  flax: 10, hemp: 20, jute: 20, kenaf: 20, "slender leaf": 40
};

function getCropDefaultYield(crop: string): number {
  const key = crop.toLowerCase();
  return defaultYieldsBags[key] || 20;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const cookieLanguage = request.cookies.get('preferred-language')?.value;
    const bodyLanguage = body.language;
    const userLanguage = bodyLanguage || cookieLanguage || 'en';
    console.log(`🌐 Generating recommendations in language: ${userLanguage}`);

    const {
      farmerName,
      phoneNumber,
      subCounty,
      ward,
      village,
      totalFarmSize,
      cultivatedAcres,
      waterSources,
      crops,
      cropVarieties,
      cropAcres,
      plantingDate,
      seedSource,
      spacing,
      seedRate,
      usePlantingFertilizer,
      plantingFertilizerType,
      plantingFertilizerQuantity,
      useTopdressingFertilizer,
      topdressingFertilizerType,
      topdressingFertilizerQuantity,
      commonPests,
      commonDiseases,
      actualYield,
      yieldUnit,
      storageMethod,
      ploughingCost,
      plantingLabourCost,
      weedingCost,
      harvestingCost,
      transportCostPerKg,
      emptyBags,
      bagCost,
      hasDoneSoilTest,

      soilTestDate,
      soilTestPH,
      soilTestPHRating,
      soilTestP,
      soilTestPRating,
      soilTestK,
      soilTestKRating,
      soilTestNPercent,
      soilTestNPercentRating,
      soilTestCa,
      soilTestCaRating,
      soilTestMg,
      soilTestMgRating,
      soilTestNa,
      soilTestNaRating,
      soilTestOC,
      soilTestOCRating,
      soilTestOM,
      soilTestOMRating,
      soilTestCEC,
      soilTestCECRating,

      targetYield,
      recCalciticLime,
      recDolomiticLime,           // NEW
      recPlantingFertilizer,
      recPlantingQuantity,
      recTopdressingFertilizer,
      recTopdressingQuantity,
      recPotassiumFertilizer,
      recPotassiumQuantity,

      plantingFertilizerNutrients,
      topdressingFertilizerNutrients,
      potassiumFertilizerNutrients,

      plantingFertilizerToUse,
      plantingFertilizerCost,
      topdressingFertilizerToUse,
      topdressingFertilizerCost,
      potassiumFertilizerToUse,
      potassiumFertilizerCost,

      plantingFertilizerQuantity: plantingFertilizerQuantityKg,
      topdressingFertilizerQuantity: topdressingFertilizerQuantityKg,
      potassiumFertilizerQuantity: potassiumFertilizerQuantityKg,

      calciticLimePricePerBag,
      dolomiticLimePricePerBag,   // NEW
      plantsDamaged,
      seedCost,
      pricePerUnit,
      priceUnit,
      season,
      county,
      acres,
      averageHarvest,
      harvestUnit,
      conservationPractices,
      useCertifiedSeed,
      seedQuantity,
      userid,
      country,

      deficiencySymptoms,
      deficiencyLocation,

      wantsNutritionBenefits,     // NEW
    } = body;

    if (!crops || !county || !userid) {
      return NextResponse.json(
        { error: "Missing required fields: crops, county, userid are required" },
        { status: 400 }
      );
    }

    const cropsArray = crops.split(",").map((c: string) => c.trim());
    const primaryCrop = cropsArray[0];
    const farmSize = parseFloat(cropAcres) || parseFloat(acres) || 1;

    // ========== PLANTING ADVICE ==========
    let plantingAdvice = null;
    let plantingAdviceText = null;

    if (plantingDate && primaryCrop && country) {
      const advice = getPlantingAdvice(primaryCrop, country, county, plantingDate);
      const adviceText = getPlantingAdviceText(primaryCrop, country, county, plantingDate);
      plantingAdvice = advice;
      plantingAdviceText = adviceText;
      console.log(`🌱 Planting advice for ${primaryCrop} in ${country}/${county}: ${advice}`);
    }

    // ========== VALIDATE YIELD AND PRICE ==========
    let validatedYield = parseFloat(actualYield) || parseFloat(averageHarvest) || 0;
    let validatedPrice = parseFloat(pricePerUnit) || 0;
    let yieldWarnings: string[] = [];
    let priceWarnings: string[] = [];

    if (validatedYield > 0 && primaryCrop) {
      const yieldInKg = convertToKg(primaryCrop, validatedYield, yieldUnit || harvestUnit || "kg");
      const yieldValidation = validateYield(primaryCrop, yieldInKg, farmSize);
      if (!yieldValidation.valid && yieldValidation.message) {
        yieldWarnings.push(yieldValidation.message);
        if (yieldValidation.suggested) {
          validatedYield = yieldValidation.suggested / farmSize;
        }
      }
    }

    if (validatedPrice > 0 && primaryCrop) {
      const pricePerKg = convertToKg(primaryCrop, validatedPrice, priceUnit || "kg") / validatedPrice;
      const priceValidation = validatePrice(primaryCrop, pricePerKg);
      if (!priceValidation.valid && priceValidation.message) {
        priceWarnings.push(priceValidation.message);
        if (priceValidation.suggested) {
          validatedPrice = priceValidation.suggested;
        }
      }
    }

    // ========== SPACING VALIDATION ==========
    let spacingInfo = null;
    let spacingWarning: string | null = null;

    if (spacing && primaryCrop) {
      const spacingOptions = getSpacingOptions(primaryCrop);
      const selectedSpacing = spacingOptions.find(s => s.label === spacing);
      if (selectedSpacing) {
        spacingInfo = {
          rowCm: selectedSpacing.rowCm,
          plantCm: selectedSpacing.plantCm,
          seedsPerHole: selectedSpacing.seedsPerHole,
          label: selectedSpacing.label,
          plantsPerAcre: selectedSpacing.plantsPerAcre
        };

        const { validatePlantPopulation } = await import('@/lib/utils');
        const popValidation = validatePlantPopulation(primaryCrop, selectedSpacing.plantsPerAcre);
        if (!popValidation.valid) {
          spacingWarning = popValidation.message;
        }
      }
    }

    // ========== SOIL TEST ANALYSIS ==========
    let soilAnalysis = null;
    let fertilizerPlan = null;

    if (hasDoneSoilTest === "Yes" && soilTestDate) {
      try {
        const soilTestData = {
          testDate: soilTestDate,
          ph: parseFloat(soilTestPH) || 0,
          phosphorus: parseFloat(soilTestP) || 0,
          potassium: parseFloat(soilTestK) || 0,
          calcium: parseFloat(soilTestCa) || 0,
          magnesium: parseFloat(soilTestMg) || 0,
          sodium: parseFloat(soilTestNa) || 0,
          totalNitrogen: parseFloat(soilTestNPercent) || 0,
          organicCarbon: parseFloat(soilTestOC) || 0,
          organicMatter: parseFloat(soilTestOM) || 0,
          cec: parseFloat(soilTestCEC) || 0,
          phRating: soilTestPHRating || '',
          phosphorusRating: soilTestPRating || '',
          potassiumRating: soilTestKRating || '',
          calciumRating: soilTestCaRating || '',
          magnesiumRating: soilTestMgRating || '',
          sodiumRating: soilTestNaRating || '',
          totalNitrogenRating: soilTestNPercentRating || '',
          organicCarbonRating: soilTestOCRating || '',
          organicMatterRating: soilTestOMRating || '',
          cecRating: soilTestCECRating || '',
          targetYield: targetYield ? parseFloat(targetYield) : null,
          recCalciticLime: recCalciticLime ? parseFloat(recCalciticLime) : null,
          recPlantingFertilizer: recPlantingFertilizer || null,
          recPlantingQuantity: recPlantingQuantity ? parseFloat(recPlantingQuantity) : null,
          recTopdressingFertilizer: recTopdressingFertilizer || null,
          recTopdressingQuantity: recTopdressingQuantity ? parseFloat(recTopdressingQuantity) : null,
          recPotassiumFertilizer: recPotassiumFertilizer || null,
          recPotassiumQuantity: recPotassiumQuantity ? parseFloat(recPotassiumQuantity) : null,
          plantingFertilizerNutrients: plantingFertilizerNutrients || null,
          topdressingFertilizerNutrients: topdressingFertilizerNutrients || null,
          potassiumFertilizerNutrients: potassiumFertilizerNutrients || null,
          crops: primaryCrop,
          cropAcres: farmSize
        };

        soilAnalysis = soilTestInterpreter.interpretSoilTest(soilTestData);

        if (soilAnalysis) {
          soilAnalysis.ph = parseFloat(soilTestPH) || 0;
          soilAnalysis.phosphorus = parseFloat(soilTestP) || 0;
          soilAnalysis.potassium = parseFloat(soilTestK) || 0;
          soilAnalysis.calcium = parseFloat(soilTestCa) || 0;
          soilAnalysis.magnesium = parseFloat(soilTestMg) || 0;
          soilAnalysis.sodium = parseFloat(soilTestNa) || 0;
          soilAnalysis.totalNitrogen = parseFloat(soilTestNPercent) || 0;
          soilAnalysis.organicCarbon = parseFloat(soilTestOC) || 0;
          soilAnalysis.organicMatter = parseFloat(soilTestOM) || 0;
          soilAnalysis.cec = parseFloat(soilTestCEC) || 0;

          soilAnalysis.phRating = soilTestPHRating || '';
          soilAnalysis.phosphorusRating = soilTestPRating || '';
          soilAnalysis.potassiumRating = soilTestKRating || '';
          soilAnalysis.calciumRating = soilTestCaRating || '';
          soilAnalysis.magnesiumRating = soilTestMgRating || '';
          soilAnalysis.sodiumRating = soilTestNaRating || '';
          soilAnalysis.totalNitrogenRating = soilTestNPercentRating || '';
          soilAnalysis.organicCarbonRating = soilTestOCRating || '';
          soilAnalysis.organicMatterRating = soilTestOMRating || '';
          soilAnalysis.cecRating = soilTestCECRating || '';

          soilAnalysis.plantingFertilizerNutrients = plantingFertilizerNutrients || null;
          soilAnalysis.topdressingFertilizerNutrients = topdressingFertilizerNutrients || null;
          soilAnalysis.potassiumFertilizerNutrients = potassiumFertilizerNutrients || null;
          soilAnalysis.crop = primaryCrop;
          soilAnalysis.farmSize = farmSize;
        }

        if (soilTestData.recPlantingFertilizer && plantingFertilizerToUse) {
          fertilizerPlan = fertilizerCalculator.calculateFromRecommendations(
            {
              targetYield: soilTestData.targetYield ||
                soilTestInterpreter.getYieldCategory(primaryCrop, 'medium') * 1000 || 2000,
              plantingFertilizer: soilTestData.recPlantingFertilizer,
              plantingQuantity: soilTestData.recPlantingQuantity || 100,
              topdressingFertilizer: soilTestData.recTopdressingFertilizer || "",
              topdressingQuantity: soilTestData.recTopdressingQuantity || 0,
              potassiumFertilizer: soilTestData.recPotassiumFertilizer || "",
              potassiumQuantity: soilTestData.recPotassiumQuantity || 0
            },
            {
              planting: plantingFertilizerToUse ? [plantingFertilizerToUse] : [],
              topdressing: topdressingFertilizerToUse ? [topdressingFertilizerToUse] : [],
              potassium: potassiumFertilizerToUse ? [potassiumFertilizerToUse] : []
            },
            {
              plantingCost: plantingFertilizerCost ? parseFloat(plantingFertilizerCost) : 0,
              topdressingCost: topdressingFertilizerCost ? parseFloat(topdressingFertilizerCost) : 0,
              potassiumCost: potassiumFertilizerCost ? parseFloat(potassiumFertilizerCost) : 0
            },
            farmSize,
            spacingInfo,
            country || 'kenya',
            primaryCrop
          );
        }
      } catch (error) {
        console.error("Error processing soil test:", error);
      }
    }

    // ========== GROSS MARGIN CALCULATION ==========
    let grossMargin = null;
    try {
      const defaultYieldBags = getCropDefaultYield(primaryCrop);
      const grossMarginInput = {
        crop: primaryCrop,
        cropAcres: farmSize,
        actualYield: validatedYield || defaultYieldBags,
        yieldUnit: yieldUnit || harvestUnit || "90kg bags",
        pricePerUnit: validatedPrice || 6750,
        priceUnit: priceUnit || "kg",
        seedRate: parseFloat(seedRate) || parseFloat(seedQuantity) || 10,
        seedCost: parseFloat(seedCost) || 180,
        plantingFertilizerCost: plantingFertilizerCost ? parseFloat(plantingFertilizerCost) : 6400,
        plantingFertilizerQuantity: parseFloat(plantingFertilizerQuantityKg) || 52,
        topdressingFertilizerCost: topdressingFertilizerCost ? parseFloat(topdressingFertilizerCost) : 6000,
        topdressingFertilizerQuantity: parseFloat(topdressingFertilizerQuantityKg) || 96,
        potassiumFertilizerCost: potassiumFertilizerCost ? parseFloat(potassiumFertilizerCost) : 2850,
        potassiumFertilizerQuantity: parseFloat(potassiumFertilizerQuantityKg) || 50,
        ploughingCost: parseFloat(ploughingCost) || 7000,
        plantingLabourCost: parseFloat(plantingLabourCost) || 2000,
        weedingCost: parseFloat(weedingCost) || 2500,
        harvestingCost: parseFloat(harvestingCost) || 2000,
        transportCostPerKg: parseFloat(transportCostPerKg) || 5,
        transportUnit: "kg",
        emptyBags: parseFloat(emptyBags) || 0,
        bagCost: parseFloat(bagCost) || 40
      };
      grossMargin = calculateGrossMarginFromFarmerData(grossMarginInput);
    } catch (error) {
      console.error("Error calculating gross margin:", error);
    }

    // ========== GENERATE RECOMMENDATIONS ==========
    const recommendationsOutput = await generateRecommendations({
      hasSoilTest: hasDoneSoilTest === "Yes",
      soilAnalysis,
      fertilizerPlan,
      crop: primaryCrop,
      crops: cropsArray,
      farmerData: {
        farmerName: farmerName || 'Farmer',
        usePlantingFertilizer,
        useTopdressingFertilizer,
        conservationPractices,
        commonPests,
        commonDiseases,
        managementLevel: "Medium",
        actualYieldKg: validatedYield ? convertToKg(primaryCrop, validatedYield, yieldUnit || harvestUnit || "kg") : null,
        pricePerKg: validatedPrice ? convertToKg(primaryCrop, validatedPrice, priceUnit || "kg") / validatedPrice : null,
        totalCosts: grossMargin?.totalCosts || null,
        country: country || 'kenya',
        limePricePerBag: calciticLimePricePerBag ? parseFloat(calciticLimePricePerBag) : 300,
        recCalciticLime: recCalciticLime ? parseFloat(recCalciticLime) : 0,
        recDolomiticLime: recDolomiticLime ? parseFloat(recDolomiticLime) : 0,
        dolomiticLimePricePerBag: dolomiticLimePricePerBag ? parseFloat(dolomiticLimePricePerBag) : 300,
        plantsDamaged: plantsDamaged ? parseInt(plantsDamaged) : null,
        language: userLanguage,
        deficiencySymptoms,
        deficiencyLocation,
        spacing: spacing,
        storageMethod: storageMethod,
        wantsNutritionBenefits: wantsNutritionBenefits === true || wantsNutritionBenefits === "Yes",   // NEW
      }
    });

    // ========== SAVE TO FIRESTORE ==========
    const sessionRef = db.collection("farmer_sessions").doc();
    const sessionId = sessionRef.id;

    const farmerSession = {
      id: sessionId,
      userId: userid,
      language: userLanguage,
      farmerName,
      phoneNumber,
      county,
      subCounty,
      ward,
      village,
      country: country || 'kenya',
      totalFarmSize: totalFarmSize ? parseFloat(totalFarmSize) : null,
      cultivatedAcres: farmSize,
      waterSources: waterSources ? waterSources.split(',').map((s: string) => s.trim()) : [],
      crops: cropsArray,
      primaryCrop,
      cropVarieties,
      cropAcres: farmSize,
      plantingDate,
      plantingAdvice,
      plantingAdviceText,
      seedSource,
      spacing,
      spacingInfo,
      spacingWarning,
      seedRate: parseFloat(seedRate) || parseFloat(seedQuantity) || null,
      seedCost: seedCost ? parseFloat(seedCost) : null,

      plantingFertilizer: {
        used: usePlantingFertilizer === "yes",
        type: plantingFertilizerType || null,
        quantity: plantingFertilizerQuantityKg ? parseFloat(plantingFertilizerQuantityKg) : null,
        cost: plantingFertilizerCost ? parseFloat(plantingFertilizerCost) : null,
        nutrients: plantingFertilizerNutrients || null
      },
      topdressingFertilizer: {
        used: useTopdressingFertilizer === "yes",
        type: topdressingFertilizerType || null,
        quantity: topdressingFertilizerQuantityKg ? parseFloat(topdressingFertilizerQuantityKg) : null,
        cost: topdressingFertilizerCost ? parseFloat(topdressingFertilizerCost) : null,
        nutrients: topdressingFertilizerNutrients || null
      },
      potassiumFertilizer: {
        used: potassiumFertilizerToUse ? true : false,
        type: potassiumFertilizerToUse || null,
        quantity: potassiumFertilizerQuantityKg ? parseFloat(potassiumFertilizerQuantityKg) : null,
        cost: potassiumFertilizerCost ? parseFloat(potassiumFertilizerCost) : null,
        nutrients: potassiumFertilizerNutrients || null
      },

      commonPests: commonPests ? commonPests.split(',').map((p: string) => p.trim()) : [],
      commonDiseases: commonDiseases ? commonDiseases.split(',').map((d: string) => d.trim()) : [],
      plantsDamaged: plantsDamaged ? parseInt(plantsDamaged) : null,

      yieldData: {
        actual: validatedYield || null,
        unit: yieldUnit || harvestUnit || "kg",
        inKg: validatedYield ? convertToKg(primaryCrop, validatedYield, yieldUnit || harvestUnit || "kg") : null,
        pricePerUnit: validatedPrice || null,
        pricePerKg: validatedPrice ? convertToKg(primaryCrop, validatedPrice, priceUnit || "kg") / validatedPrice : null,
        priceUnit: priceUnit || "kg",
        warnings: [...yieldWarnings, ...priceWarnings]
      },

      storageMethod,
      labourCosts: {
        ploughing: parseFloat(ploughingCost) || null,
        planting: parseFloat(plantingLabourCost) || null,
        weeding: parseFloat(weedingCost) || null,
        harvesting: parseFloat(harvestingCost) || null
      },
      transportCostPerKg: parseFloat(transportCostPerKg) || null,
      emptyBags: parseFloat(emptyBags) || null,
      bagCost: parseFloat(bagCost) || null,

      conservationPractices: conservationPractices ? conservationPractices.split(',').map((p: string) => p.trim()) : [],

      limePricePerBag: calciticLimePricePerBag ? parseFloat(calciticLimePricePerBag) : null,
      recCalciticLime: recCalciticLime ? parseFloat(recCalciticLime) : null,
      recDolomiticLime: recDolomiticLime ? parseFloat(recDolomiticLime) : null,
      dolomiticLimePricePerBag: dolomiticLimePricePerBag ? parseFloat(dolomiticLimePricePerBag) : null,

      wantsNutritionBenefits: wantsNutritionBenefits === true || wantsNutritionBenefits === "Yes",   // NEW

      soilTest: hasDoneSoilTest === "Yes" ? {
        testDate: soilTestDate,
        ph: soilTestPH ? parseFloat(soilTestPH) : null,
        phRating: soilTestPHRating,
        phosphorus: soilTestP ? parseFloat(soilTestP) : null,
        phosphorusRating: soilTestPRating,
        potassium: soilTestK ? parseFloat(soilTestK) : null,
        potassiumRating: soilTestKRating,
        totalNitrogen: soilTestNPercent ? parseFloat(soilTestNPercent) : null,
        totalNitrogenRating: soilTestNPercentRating,
        calcium: soilTestCa ? parseFloat(soilTestCa) : null,
        calciumRating: soilTestCaRating,
        magnesium: soilTestMg ? parseFloat(soilTestMg) : null,
        magnesiumRating: soilTestMgRating,
        sodium: soilTestNa ? parseFloat(soilTestNa) : null,
        sodiumRating: soilTestNaRating,
        organicCarbon: soilTestOC ? parseFloat(soilTestOC) : null,
        organicCarbonRating: soilTestOCRating,
        organicMatter: soilTestOM ? parseFloat(soilTestOM) : null,
        organicMatterRating: soilTestOMRating,
        cec: soilTestCEC ? parseFloat(soilTestCEC) : null,
        cecRating: soilTestCECRating,
        targetYield: targetYield ? parseFloat(targetYield) : null,
        recCalciticLime: recCalciticLime ? parseFloat(recCalciticLime) : null,
        recPlantingFertilizer: recPlantingFertilizer || null,
        recPlantingQuantity: recPlantingQuantity ? parseFloat(recPlantingQuantity) : null,
        recTopdressingFertilizer: recTopdressingFertilizer || null,
        recTopdressingQuantity: recTopdressingQuantity ? parseFloat(recTopdressingQuantity) : null,
        recPotassiumFertilizer: recPotassiumFertilizer || null,
        recPotassiumQuantity: recPotassiumQuantity ? parseFloat(recPotassiumQuantity) : null,
        plantingFertilizerNutrients: plantingFertilizerNutrients || null,
        topdressingFertilizerNutrients: topdressingFertilizerNutrients || null,
        potassiumFertilizerNutrients: potassiumFertilizerNutrients || null,
        plantingFertilizerToUse: plantingFertilizerToUse || null,
        plantingFertilizerCost: plantingFertilizerCost ? parseFloat(plantingFertilizerCost) : null,
        topdressingFertilizerToUse: topdressingFertilizerToUse || null,
        topdressingFertilizerCost: topdressingFertilizerCost ? parseFloat(topdressingFertilizerCost) : null,
        potassiumFertilizerToUse: potassiumFertilizerToUse || null,
        potassiumFertilizerCost: potassiumFertilizerCost ? parseFloat(potassiumFertilizerCost) : null,
        fertilizerPlan: fertilizerPlan ? {
          totalCost: fertilizerPlan.totalCost,
          planting: fertilizerPlan.plantingRecommendations,
          topdressing: fertilizerPlan.topDressingRecommendations,
          perPlant: fertilizerPlan.perPlant
        } : null
      } : null,

      useCertifiedSeed: useCertifiedSeed === "yes",
      smartphone: false,

      recommendations: recommendationsOutput.list,
      financialAdvice: recommendationsOutput.financialAdvice,
      structuredList: recommendationsOutput.structuredList,
      structuredFinancialAdvice: recommendationsOutput.structuredFinancialAdvice,
      grossMarginAnalysis: grossMargin,
      deficiencySymptoms: deficiencySymptoms || null,
      deficiencyLocation: deficiencyLocation || null,

      metadata: {
        warnings: {
          yield: yieldWarnings,
          price: priceWarnings,
          spacing: spacingWarning ? [spacingWarning] : []
        },
        createdAt: new Date().toISOString(),
        source: "logic-based",
        version: "2.0"
      }
    };

    await sessionRef.set(farmerSession);
    console.log(`Saved farmer session ${sessionId} for crop ${primaryCrop} in ${country} with language ${userLanguage}`);

    return NextResponse.json({
      success: true,
      recommendations: recommendationsOutput.list,
      structuredList: recommendationsOutput.structuredList,
      structuredFinancialAdvice: recommendationsOutput.structuredFinancialAdvice,
      grossMarginAnalysis: grossMargin,
      financialAdvice: recommendationsOutput.financialAdvice,
      sessionId: sessionId,
      warnings: {
        yield: yieldWarnings,
        price: priceWarnings,
        spacing: spacingWarning
      },
      plantingAdvice,
      welcomeMessage: `Welcome ${farmerName || "Farmer"}! I've prepared your recommendations for ${primaryCrop}.`
    }, { status: 200 });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error occurred"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "operational",
    message: "Farmer Session Generation API",
    version: "2.0",
    supportedCrops: "All 219 crops across 75+ countries"
  });
}