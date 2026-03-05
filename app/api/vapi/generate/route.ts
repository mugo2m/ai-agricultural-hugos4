// app/api/vapi/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { soilTestInterpreter } from "@/lib/soilTestInterpreter";
import { fertilizerCalculator } from "@/lib/fertilizerCalculator";
import { calculateRankedCropProfits } from "@/lib/utils/cropCalculations";
import { generateRecommendations } from "@/lib/recommendationEngine";
import { calculateGrossMarginFromFarmerData } from "@/lib/utils";

console.log("🌾 Farmer Session Generation Route Loaded (100% Logic-Based)");

export async function POST(request: NextRequest) {
  try {
    // 🌾 ALL FARMER DETAILS - COMPLETE WITH ALL FIELDS
    const body = await request.json();

    const {
      farmerName,
      phoneNumber,
      subCounty,
      ward,
      village,
      altitude,
      annualRainfall,
      totalFarmSize,
      cultivatedAcres,
      soilType,
      soilTested,
      waterSources,
      crops,
      cropVarieties,
      cropAcres,
      plantingDate,
      harvestDate,
      seedSource,
      spacing,
      seedRate,
      usePlantingFertilizer,
      plantingFertilizerType,
      plantingFertilizerQuantity,
      noPlantingFertilizerReason,
      useTopdressingFertilizer,
      topdressingFertilizerType,
      topdressingFertilizerQuantity,
      noTopdressingFertilizerReason,
      commonPests,
      pestControlMethod,
      commonDiseases,
      diseaseControlMethod,
      actualYield,
      yieldUnit,
      storageMethod,
      dapCost,
      canCost,
      npkCost,
      ploughingCost,
      plantingLabourCost,
      weedingCost,
      harvestingCost,
      maizePrice,
      beansPrice,
      buyerType,
      transportCostPerBag,
      roadAccess,
      marketDistance,
      creditAccess,
      supportPrograms,
      livestockTypes,
      cattleBreed,
      milkYield,
      calvingRate,
      feedingSystem,
      poultryType,
      birdCount,
      eggProduction,
      mortalityRate,
      postHarvestPractices,
      postHarvestLosses,
      valueAddition,
      bagCost,
      storageAccess,
      productionChallenges,
      marketingChallenges,
      experience,
      mainChallenge,
      managementLevel,
      hasDoneSoilTest,

      // SOIL TEST RAW VALUES
      soilTestDate,
      soilTestPH,
      soilTestPHRating,
      soilTestP,
      soilTestPRating,
      soilTestK,
      soilTestKRating,
      soilTestNPercent,
      soilTestNPercentRating,
      soilTestOC,
      soilTestOCRating,
      soilTestOM,
      soilTestOMRating,
      soilTestCEC,
      soilTestCECRating,
      soilTestCa,
      soilTestCaRating,
      soilTestMg,
      soilTestMgRating,
      soilTestNa,
      soilTestNaRating,

      // SOIL TEST RECOMMENDATIONS
      targetYield,
      recPlantingFertilizer,
      recPlantingQuantity,
      recTopdressingFertilizer,
      recTopdressingQuantity,
      recPotassiumFertilizer,
      recPotassiumQuantity,

      // FERTILIZER SELECTION - WHAT FARMER WILL ACTUALLY BUY
      plantingFertilizerToUse,
      plantingFertilizerCost,
      topdressingFertilizerToUse,
      topdressingFertilizerCost,
      potassiumFertilizerToUse,
      potassiumFertilizerCost,

      // RENAMED FERTILIZER QUANTITIES TO AVOID DUPLICATION
      plantingFertilizerQuantity: plantingFertilizerQuantityKg,
      topdressingFertilizerQuantity: topdressingFertilizerQuantityKg,
      potassiumFertilizerQuantity: potassiumFertilizerQuantityKg,

      // SEED COST AND PRICE PER UNIT
      seedCost,
      pricePerUnit,

      availablePlantingFertilizers,
      availableTopDressingFertilizers,
      season,
      county,
      cropOfInterest,
      acres,
      previousCrop,
      averageHarvest,
      harvestUnit,
      organicManure,
      terracing,
      mulching,
      coverCrops,
      rainwaterHarvesting,
      contourFarming,
      useCertifiedSeed,
      certifiedSeedReason,
      seedQuantity,
      cattle,
      cattleType,
      milkProduction,
      otherLivestock,
      smartphone,
      userid
    } = body;

    if (!crops || !county || !userid) {
      return NextResponse.json(
        { error: "Missing required fields: crops, county, userid are required" },
        { status: 400 }
      );
    }

    const cropsArray = crops.split(",").map((c: string) => c.trim());
    const primaryCrop = cropsArray[0];

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

          // SOIL TEST RECOMMENDATIONS
          targetYield: targetYield ? parseFloat(targetYield) : null,
          recPlantingFertilizer: recPlantingFertilizer || null,
          recPlantingQuantity: recPlantingQuantity ? parseFloat(recPlantingQuantity) : null,
          recTopdressingFertilizer: recTopdressingFertilizer || null,
          recTopdressingQuantity: recTopdressingQuantity ? parseFloat(recTopdressingQuantity) : null,
          recPotassiumFertilizer: recPotassiumFertilizer || null,
          recPotassiumQuantity: recPotassiumQuantity ? parseFloat(recPotassiumQuantity) : null
        };

        soilAnalysis = soilTestInterpreter.interpretSoilTest(soilTestData);

        // If farmer has recommendations and has selected fertilizers to buy, calculate precision plan
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
            }
          );
        } else {
          // Fallback to standard calculation
          fertilizerPlan = soilTestInterpreter.generateCompleteFertilizerPlan(
            soilAnalysis,
            primaryCrop,
            availablePlantingFertilizers ? availablePlantingFertilizers.split(',') : []
          );
        }

        console.log(`📊 Generated fertilizer plan with ${fertilizerPlan?.interventions?.length || 0} interventions`);
        console.log(`💰 Total investment: Ksh ${fertilizerPlan?.totalCost || 0}`);
      } catch (error) {
        console.error("Error processing soil test:", error);
      }
    }

    // ========== GENERATE RECOMMENDATIONS USING LOGIC ENGINE ==========
    const recommendations = generateRecommendations({
      hasSoilTest: hasDoneSoilTest === "Yes",
      soilAnalysis,
      fertilizerPlan,
      crop: primaryCrop,
      crops: cropsArray,
      farmerData: {
        usePlantingFertilizer,
        useTopdressingFertilizer,
        organicManure,
        terracing,
        mulching,
        coverCrops,
        rainwaterHarvesting,
        contourFarming,
        commonPests,
        commonDiseases,
        mainChallenge,
        experience,
        managementLevel
      }
    });

    // ========== CALCULATE GROSS MARGIN USING FARMER'S ACTUAL DATA ==========
    let grossMargin = null;
    try {
      const grossMarginInput = {
        crop: primaryCrop,
        cropAcres: parseFloat(cropAcres) || parseFloat(acres) || 1,
        actualYield: parseFloat(actualYield) || parseFloat(averageHarvest) || 0,
        yieldUnit: yieldUnit || harvestUnit || "90kg bags",
        pricePerUnit: parseFloat(pricePerUnit) || (primaryCrop === "maize" ? 6750 : 10350),
        seedRate: parseFloat(seedRate) || parseFloat(seedQuantity) || 0,
        seedCost: parseFloat(seedCost) || 180,

        // USING RENAMED VARIABLES
        plantingFertilizerCost: plantingFertilizerCost ? parseFloat(plantingFertilizerCost) : parseFloat(dapCost) || 3500,
        plantingFertilizerQuantity: parseFloat(plantingFertilizerQuantityKg) || 0,

        topdressingFertilizerCost: topdressingFertilizerCost ? parseFloat(topdressingFertilizerCost) : parseFloat(canCost) || 2500,
        topdressingFertilizerQuantity: parseFloat(topdressingFertilizerQuantityKg) || 0,

        potassiumFertilizerCost: potassiumFertilizerCost ? parseFloat(potassiumFertilizerCost) : 0,
        potassiumFertilizerQuantity: parseFloat(potassiumFertilizerQuantityKg) || 0,

        ploughingCost: parseFloat(ploughingCost) || 0,
        plantingLabourCost: parseFloat(plantingLabourCost) || 0,
        weedingCost: parseFloat(weedingCost) || 0,
        harvestingCost: parseFloat(harvestingCost) || 0,
        transportCostPerBag: parseFloat(transportCostPerBag) || 0,
        bagCost: parseFloat(bagCost) || 40
      };

      console.log("📊 Gross Margin Input:", grossMarginInput);

      grossMargin = calculateGrossMarginFromFarmerData(grossMarginInput);
      console.log("💰 Gross Margin Result:", grossMargin);
    } catch (error) {
      console.error("Error calculating gross margin:", error);
      // Provide a fallback gross margin
      grossMargin = {
        crop: primaryCrop,
        bags: 0,
        pricePerBag: 0,
        revenue: 0,
        seedCost: 0,
        fertilizerCost: 0,
        labourCost: 0,
        transportCost: 0,
        bagCost: 0,
        totalCosts: 0,
        grossMargin: 0,
        roi: 0,
        costPerBag: 0
      };
    }

    // ========== SAVE TO FIREBASE ==========
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
      altitude,
      annualRainfall,
      totalFarmSize: totalFarmSize ? parseFloat(totalFarmSize) : null,
      cultivatedAcres: cultivatedAcres ? parseFloat(cultivatedAcres) : (acres ? parseFloat(acres) : null),
      soilType,
      soilTested: soilTested === "yes",
      waterSources: waterSources ? waterSources.split(',') : [],
      crops: cropsArray,
      cropVarieties,
      cropAcres: cropAcres ? parseFloat(cropAcres) : null,
      plantingDate,
      harvestDate,
      seedSource,
      spacing,
      seedRate: seedRate ? parseFloat(seedRate) : (seedQuantity ? parseFloat(seedQuantity) : null),
      seedCost: seedCost ? parseFloat(seedCost) : null,

      // USING RENAMED VARIABLES FOR FERTILIZER QUANTITIES
      plantingFertilizer: {
        used: usePlantingFertilizer === "yes",
        type: plantingFertilizerType || null,
        quantity: plantingFertilizerQuantityKg ? parseFloat(plantingFertilizerQuantityKg) : null,
        cost: plantingFertilizerCost ? parseFloat(plantingFertilizerCost) : null,
        reason: noPlantingFertilizerReason || null
      },
      topdressingFertilizer: {
        used: useTopdressingFertilizer === "yes",
        type: topdressingFertilizerType || null,
        quantity: topdressingFertilizerQuantityKg ? parseFloat(topdressingFertilizerQuantityKg) : null,
        cost: topdressingFertilizerCost ? parseFloat(topdressingFertilizerCost) : null,
        reason: noTopdressingFertilizerReason || null
      },
      potassiumFertilizer: {
        used: potassiumFertilizerToUse ? true : false,
        type: potassiumFertilizerToUse || null,
        quantity: potassiumFertilizerQuantityKg ? parseFloat(potassiumFertilizerQuantityKg) : null,
        cost: potassiumFertilizerCost ? parseFloat(potassiumFertilizerCost) : null,
      },

      commonPests,
      pestControlMethod,
      commonDiseases,
      diseaseControlMethod,
      actualYield: actualYield ? parseFloat(actualYield) : (averageHarvest ? parseFloat(averageHarvest) : null),
      yieldUnit: yieldUnit || harvestUnit || "bags",
      pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : null,
      storageMethod,
      inputCosts: {
        dap: dapCost ? parseFloat(dapCost) : null,
        can: canCost ? parseFloat(canCost) : null,
        npk: npkCost ? parseFloat(npkCost) : null,
        bag: bagCost ? parseFloat(bagCost) : 40
      },
      labourCosts: {
        ploughing: ploughingCost ? parseFloat(ploughingCost) : null,
        planting: plantingLabourCost ? parseFloat(plantingLabourCost) : null,
        weeding: weedingCost ? parseFloat(weedingCost) : null,
        harvesting: harvestingCost ? parseFloat(harvestingCost) : null
      },
      prices: {
        maize: maizePrice ? parseFloat(maizePrice) : 6750,
        beans: beansPrice ? parseFloat(beansPrice) : 10350,
        perUnit: pricePerUnit ? parseFloat(pricePerUnit) : null
      },
      buyerType,
      transportCostPerBag: transportCostPerBag ? parseFloat(transportCostPerBag) : null,
      roadAccess,
      marketDistance: marketDistance ? parseFloat(marketDistance) : null,
      creditAccess: creditAccess ? creditAccess.split(',') : [],
      supportPrograms: supportPrograms ? supportPrograms.split(',') : [],
      livestockTypes: livestockTypes ? livestockTypes.split(',') : (otherLivestock ? [otherLivestock] : []),
      cattle: cattle ? parseInt(cattle) : 0,
      cattleDetails: {
        breed: cattleBreed || cattleType || null,
        milkPerDay: milkYield ? parseFloat(milkYield) : (milkProduction ? parseFloat(milkProduction) : null),
        calvingRate,
        feedingSystem
      },
      poultry: {
        type: poultryType,
        count: birdCount ? parseInt(birdCount) : null,
        eggProduction: eggProduction ? parseInt(eggProduction) : null,
        mortalityRate: mortalityRate ? parseFloat(mortalityRate) : null
      },
      postHarvestPractices: postHarvestPractices ? postHarvestPractices.split(',') : [],
      postHarvestLosses: postHarvestLosses || null,
      valueAddition: valueAddition ? valueAddition.split(',') : [],
      storageAccess: storageAccess === "yes",
      productionChallenges: productionChallenges ? productionChallenges.split(',') : [],
      marketingChallenges: marketingChallenges ? marketingChallenges.split(',') : [],
      experience: experience ? parseInt(experience) : null,
      mainChallenge,
      managementLevel,
      soilTest: hasDoneSoilTest === "Yes" ? {
        testDate: soilTestDate,
        ph: soilTestPH ? parseFloat(soilTestPH) : null,
        phRating: soilTestPHRating,
        phosphorus: soilTestP ? parseFloat(soilTestP) : null,
        phosphorusRating: soilTestPRating,
        potassium: soilTestK ? parseFloat(soilTestK) : null,
        potassiumRating: soilTestKRating,
        calcium: soilTestCa ? parseFloat(soilTestCa) : null,
        calciumRating: soilTestCaRating,
        magnesium: soilTestMg ? parseFloat(soilTestMg) : null,
        magnesiumRating: soilTestMgRating,
        sodium: soilTestNa ? parseFloat(soilTestNa) : null,
        sodiumRating: soilTestNaRating,
        totalNitrogen: soilTestNPercent ? parseFloat(soilTestNPercent) : null,
        totalNitrogenRating: soilTestNPercentRating,
        organicCarbon: soilTestOC ? parseFloat(soilTestOC) : null,
        organicCarbonRating: soilTestOCRating,
        organicMatter: soilTestOM ? parseFloat(soilTestOM) : null,
        organicMatterRating: soilTestOMRating,
        cec: soilTestCEC ? parseFloat(soilTestCEC) : null,
        cecRating: soilTestCECRating,
        targetYield: targetYield ? parseFloat(targetYield) : null,
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
        analysis: soilAnalysis,
        interventions: fertilizerPlan?.interventions || [],
        fertilizerPlan: fertilizerPlan ? {
          planting: fertilizerPlan.plantingFertilizers,
          topdressing: fertilizerPlan.topdressingFertilizers,
          totalCost: fertilizerPlan.totalCost,
          summary: fertilizerPlan.summary
        } : null
      } : null,
      availablePlantingFertilizers: availablePlantingFertilizers ? availablePlantingFertilizers.split(',') : [],
      availableTopDressingFertilizers: availableTopDressingFertilizers ? availableTopDressingFertilizers.split(',') : [],
      season,
      previousCrop,
      organicManure: organicManure === "yes",
      conservation: [
        terracing === "yes" ? "terracing" : null,
        mulching === "yes" ? "mulching" : null,
        coverCrops === "yes" ? "coverCrops" : null,
        rainwaterHarvesting === "yes" ? "rainwaterHarvesting" : null,
        contourFarming === "yes" ? "contourFarming" : null,
      ].filter(Boolean),
      useCertifiedSeed: useCertifiedSeed === "yes",
      certifiedSeedReason,
      smartphone: smartphone === "yes",
      recommendations: recommendations.list,
      financialAdvice: recommendations.financialAdvice,
      grossMarginAnalysis: grossMargin,
      createdAt: new Date().toISOString(),
      queryCount: 0,
      source: "logic-based"
    };

    await sessionRef.set(farmerSession);
    console.log(`✅ Saved farmer session ${sessionId} with ${recommendations.list.length} recommendations`);

    const rankedProfits = calculateRankedCropProfits(farmerSession);

    return NextResponse.json({
      success: true,
      recommendations: recommendations.list,
      grossMarginAnalysis: grossMargin,
      financialAdvice: recommendations.financialAdvice,
      rankedProfits,
      count: recommendations.list.length,
      sessionId: sessionId,
      soilTestAnalyzed: !!soilAnalysis,
      fertilizerPlanGenerated: !!fertilizerPlan,
      welcomeMessage: `🌾 Welcome ${farmerName || "Farmer"}! I've prepared ${recommendations.list.length} personalized recommendations based on your farm data.`
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
    message: "🌾 Farmer Session Generation API (100% Logic-Based)",
    endpoints: {
      generate: "POST /api/vapi/generate"
    }
  });
}