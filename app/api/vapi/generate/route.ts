// app/api/vapi/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { soilTestInterpreter } from "@/lib/soilTestInterpreter";
import { fertilizerCalculator } from "@/lib/fertilizerCalculator";
import { generateRecommendations } from "@/lib/recommendationEngine";
import { calculateGrossMarginFromFarmerData } from "@/lib/utils";
import { getSpacingOptions } from "@/lib/data/spacing";

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

    let spacingInfo = null;
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
      }
    }

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
          targetYield: targetYield ? parseFloat(targetYield) : null,
          recCalciticLime: recCalciticLime ? parseFloat(recCalciticLime) : null,
          recPlantingFertilizer: recPlantingFertilizer || null,
          recPlantingQuantity: recPlantingQuantity ? parseFloat(recPlantingQuantity) : null,
          recTopdressingFertilizer: recTopdressingFertilizer || null,
          recTopdressingQuantity: recTopdressingQuantity ? parseFloat(recTopdressingQuantity) : null,
          recPotassiumFertilizer: recPotassiumFertilizer || null,
          recPotassiumQuantity: recPotassiumQuantity ? parseFloat(recPotassiumQuantity) : null
        };

        soilAnalysis = soilTestInterpreter.interpretSoilTest(soilTestData);

        if (soilTestData.recPlantingFertilizer && plantingFertilizerToUse) {
          fertilizerPlan = fertilizerCalculator.calculateFromRecommendations(
            {
              targetYield: soilTestData.targetYield || 27,
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

    let grossMargin = null;
    try {
      const grossMarginInput = {
        crop: primaryCrop,
        cropAcres: farmSize,
        actualYield: parseFloat(actualYield) || parseFloat(averageHarvest) || 27,
        yieldUnit: yieldUnit || harvestUnit || "90kg bags",
        pricePerUnit: parseFloat(pricePerUnit) || 6750,
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
        transportCostPerBag: parseFloat(transportCostPerBag) || 50,
        bagCost: parseFloat(bagCost) || 40
      };

      grossMargin = calculateGrossMarginFromFarmerData(grossMarginInput);
    } catch (error) {
      console.error("Error calculating gross margin:", error);
    }

    // Get both legacy and structured recommendations
    const recommendationsOutput = generateRecommendations({
      hasSoilTest: hasDoneSoilTest === "Yes",
      soilAnalysis,
      fertilizerPlan,
      crop: primaryCrop,
      crops: cropsArray,
      farmerData: {
        usePlantingFertilizer,
        useTopdressingFertilizer,
        conservationPractices,
        commonPests,
        commonDiseases,
        managementLevel: "Medium",
        actualYield: parseFloat(actualYield) || parseFloat(averageHarvest) || 27,
        pricePerUnit: parseFloat(pricePerUnit) || 6750,
        totalCosts: grossMargin?.totalCosts || 52290,
        country: country || 'kenya',
        limePricePerBag: calciticLimePricePerBag ? parseFloat(calciticLimePricePerBag) : 300,
        recCalciticLime: recCalciticLime ? parseFloat(recCalciticLime) : 0
      }
    });

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
      waterSources: waterSources ? waterSources.split(',') : [],
      crops: cropsArray,
      cropVarieties,
      cropAcres: farmSize,
      plantingDate,
      seedSource,
      spacing,
      spacingInfo,
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

      commonPests,
      commonDiseases,
      actualYield: parseFloat(actualYield) || parseFloat(averageHarvest) || null,
      yieldUnit: yieldUnit || harvestUnit || "bags",
      pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : null,
      storageMethod,
      labourCosts: {
        ploughing: parseFloat(ploughingCost) || null,
        planting: parseFloat(plantingLabourCost) || null,
        weeding: parseFloat(weedingCost) || null,
        harvesting: parseFloat(harvestingCost) || null
      },
      transportCostPerBag: parseFloat(transportCostPerBag) || null,
      bagCost: parseFloat(bagCost) || null,

      productionChallenges: [],
      marketingChallenges: [],

      conservationPractices,

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

      createdAt: new Date().toISOString(),
      queryCount: 0,
      source: "logic-based"
    };

    await sessionRef.set(farmerSession);
    console.log(`Saved farmer session ${sessionId}`);

    return NextResponse.json({
      success: true,
      // Send both legacy and new fields in the response
      recommendations: recommendationsOutput.list,
      structuredList: recommendationsOutput.structuredList,
      structuredFinancialAdvice: recommendationsOutput.structuredFinancialAdvice,
      grossMarginAnalysis: grossMargin,
      financialAdvice: recommendationsOutput.financialAdvice,
      sessionId: sessionId,
      welcomeMessage: `Welcome ${farmerName || "Farmer"}! I've prepared your recommendations.`
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
    message: "Farmer Session Generation API"
  });
}