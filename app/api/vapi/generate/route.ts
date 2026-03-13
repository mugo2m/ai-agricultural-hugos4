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

console.log("Farmer Session Generation Route Loaded");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
      transportCostPerBag,
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
      recPlantingFertilizer,
      recPlantingQuantity,
      recTopdressingFertilizer,
      recTopdressingQuantity,
      recPotassiumFertilizer,
      recPotassiumQuantity,

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
      country
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

    // ========== VALIDATE YIELD AND PRICE ==========
    let validatedYield = parseFloat(actualYield) || parseFloat(averageHarvest) || 0;
    let validatedPrice = parseFloat(pricePerUnit) || 0;
    let yieldWarnings: string[] = [];
    let priceWarnings: string[] = [];

    if (validatedYield > 0 && primaryCrop) {
      // Convert to kg if needed
      const yieldInKg = convertToKg(primaryCrop, validatedYield, yieldUnit || harvestUnit || "kg");

      // Validate against crop-specific ranges
      const yieldValidation = validateYield(primaryCrop, yieldInKg, farmSize);
      if (!yieldValidation.valid && yieldValidation.message) {
        yieldWarnings.push(yieldValidation.message);
        if (yieldValidation.suggested) {
          validatedYield = yieldValidation.suggested / farmSize;
        }
      }
    }

    if (validatedPrice > 0 && primaryCrop) {
      // Convert to price per kg
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

        // Validate plant population
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

          // Add all the rating fields!
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

          // Add crop info
          crops: primaryCrop,
          cropAcres: farmSize
        };

        soilAnalysis = soilTestInterpreter.interpretSoilTest(soilTestData);

        // AFTER interpretation, add back the original values and ratings
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

          soilAnalysis.crop = primaryCrop;
          soilAnalysis.farmSize = farmSize;
        }

        // Calculate fertilizer plan if we have recommendations
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
            country || 'kenya'
          );
        }
      } catch (error) {
        console.error("Error processing soil test:", error);
      }
    }

    // ========== GROSS MARGIN CALCULATION ==========
    let grossMargin = null;
    try {
      // Get crop-specific defaults
      const getCropDefaultYield = (crop: string): number => {
        const defaults: Record<string, number> = {
          maize: 27, // bags
          beans: 12,
          rice: 30,
          onions: 80,
          tomatoes: 150,
          potatoes: 120,
          cabbages: 100,
          mangoes: 150,
          avocados: 80,
          bananas: 60,
          coffee: 20,
          tea: 25,
          macadamia: 40,
          cocoa: 8
        };
        return defaults[crop.toLowerCase()] || 27;
      };

      const grossMarginInput = {
        crop: primaryCrop,
        cropAcres: farmSize,
        actualYield: validatedYield || getCropDefaultYield(primaryCrop),
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
        transportCostPerUnit: parseFloat(transportCostPerBag) || 50,
        transportUnit: "per bag",
        bagCost: parseFloat(bagCost) || 40
      };

      grossMargin = calculateGrossMarginFromFarmerData(grossMarginInput);
    } catch (error) {
      console.error("Error calculating gross margin:", error);
    }

    // ========== GENERATE RECOMMENDATIONS ==========
    const recommendationsOutput = generateRecommendations({
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
        recCalciticLime: recCalciticLime ? parseFloat(recCalciticLime) : 0
      }
    });

    // ========== SAVE TO FIRESTORE ==========
    const sessionRef = db.collection("farmer_sessions").doc();
    const sessionId = sessionRef.id;

    const farmerSession = {
      id: sessionId,
      userId: userid,
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
      },
      topdressingFertilizer: {
        used: useTopdressingFertilizer === "yes",
        type: topdressingFertilizerType || null,
        quantity: topdressingFertilizerQuantityKg ? parseFloat(topdressingFertilizerQuantityKg) : null,
        cost: topdressingFertilizerCost ? parseFloat(topdressingFertilizerCost) : null,
      },
      potassiumFertilizer: {
        used: potassiumFertilizerToUse ? true : false,
        type: potassiumFertilizerToUse || null,
        quantity: potassiumFertilizerQuantityKg ? parseFloat(potassiumFertilizerQuantityKg) : null,
        cost: potassiumFertilizerCost ? parseFloat(potassiumFertilizerCost) : null,
      },

      commonPests: commonPests ? commonPests.split(',').map((p: string) => p.trim()) : [],
      commonDiseases: commonDiseases ? commonDiseases.split(',').map((d: string) => d.trim()) : [],

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
      transportCostPerBag: parseFloat(transportCostPerBag) || null,
      bagCost: parseFloat(bagCost) || null,

      conservationPractices: conservationPractices ? conservationPractices.split(',').map((p: string) => p.trim()) : [],

      limePricePerBag: calciticLimePricePerBag ? parseFloat(calciticLimePricePerBag) : null,
      recCalciticLime: recCalciticLime ? parseFloat(recCalciticLime) : null,

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

      // Legacy string fields (for backward compatibility)
      recommendations: recommendationsOutput.list,
      financialAdvice: recommendationsOutput.financialAdvice,

      // NEW structured fields for i18n
      structuredList: recommendationsOutput.structuredList,
      structuredFinancialAdvice: recommendationsOutput.structuredFinancialAdvice,

      grossMarginAnalysis: grossMargin,

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
    console.log(`Saved farmer session ${sessionId} for crop ${primaryCrop}`);

    // ========== RETURN RESPONSE ==========
    return NextResponse.json({
      success: true,
      // Send both legacy and new fields in the response
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
    supportedCrops: "All 47 crops including maize, beans, rice, mangoes, avocados, tea, coffee, macadamia, cocoa, etc."
  });
}