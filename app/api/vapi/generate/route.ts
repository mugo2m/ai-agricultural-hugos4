// app/api/vapi/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { soilTestInterpreter } from "@/lib/soilTestInterpreter";
import { fertilizerCalculator } from "@/lib/fertilizerCalculator";
import { calculateRankedCropProfits } from "@/lib/utils/cropCalculations";
import { generateRecommendations } from "@/lib/recommendationEngine";

console.log("🌾 Farmer Session Generation Route Loaded (100% Logic-Based)");

export async function POST(request: NextRequest) {
  try {
    // 🌾 ALL FARMER DETAILS
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
      dailyWageRate,
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
      soilTestDate,
      soilTestPH,
      soilTestPHRating,
      soilTestP,
      soilTestPRating,
      soilTestK,
      soilTestKRating,
      soilTestCa,
      soilTestCaRating,
      soilTestMg,
      soilTestMgRating,
      soilTestNa,
      soilTestNaRating,
      soilTestNPercent,
      soilTestNPercentRating,
      soilTestOC,
      soilTestOCRating,
      soilTestOM,
      soilTestOMRating,
      soilTestCEC,
      soilTestCECRating,
      targetYield,
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
    } = await request.json();

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
          cec: parseFloat(soilTestCEC) || 0
        };

        soilAnalysis = soilTestInterpreter.interpretSoilTest(soilTestData);

        fertilizerPlan = soilTestInterpreter.generateCompleteFertilizerPlan(
          soilAnalysis,
          primaryCrop,
          availablePlantingFertilizers ? availablePlantingFertilizers.split(',') : []
        );
        console.log(`📊 Generated fertilizer plan with ${fertilizerPlan.interventions.length} interventions`);
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

    // ========== CALCULATE GROSS MARGIN ==========
    const grossMargin = calculateGrossMargin(primaryCrop, {
      maizePrice: parseFloat(maizePrice) || 6750,
      beansPrice: parseFloat(beansPrice) || 10350,
      dapCost: parseFloat(dapCost) || 3300,
      canCost: parseFloat(canCost) || 2500,
      dailyWageRate: parseFloat(dailyWageRate) || 200,
      ploughingCost: parseFloat(ploughingCost) || 7000,
      plantingLabourCost: parseFloat(plantingLabourCost) || 2000,
      weedingCost: parseFloat(weedingCost) || 2500,
      harvestingCost: parseFloat(harvestingCost) || 2000,
      transportCostPerBag: parseFloat(transportCostPerBag) || 50,
      bagCost: parseFloat(bagCost) || 40
    });

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
      plantingFertilizer: {
        used: usePlantingFertilizer === "yes",
        type: plantingFertilizerType || null,
        quantity: plantingFertilizerQuantity ? parseFloat(plantingFertilizerQuantity) : null,
        reason: noPlantingFertilizerReason || null
      },
      topdressingFertilizer: {
        used: useTopdressingFertilizer === "yes",
        type: topdressingFertilizerType || null,
        quantity: topdressingFertilizerQuantity ? parseFloat(topdressingFertilizerQuantity) : null,
        reason: noTopdressingFertilizerReason || null
      },
      commonPests,
      pestControlMethod,
      commonDiseases,
      diseaseControlMethod,
      actualYield: actualYield ? parseFloat(actualYield) : (averageHarvest ? parseFloat(averageHarvest) : null),
      yieldUnit: yieldUnit || harvestUnit || "bags",
      storageMethod,
      inputCosts: {
        dap: dapCost ? parseFloat(dapCost) : null,
        can: canCost ? parseFloat(canCost) : null,
        npk: npkCost ? parseFloat(npkCost) : null,
        bag: bagCost ? parseFloat(bagCost) : 40
      },
      labourCosts: {
        dailyWage: dailyWageRate ? parseFloat(dailyWageRate) : 100,
        ploughing: ploughingCost ? parseFloat(ploughingCost) : null,
        planting: plantingLabourCost ? parseFloat(plantingLabourCost) : null,
        weeding: weedingCost ? parseFloat(weedingCost) : null,
        harvesting: harvestingCost ? parseFloat(harvestingCost) : null
      },
      prices: {
        maize: maizePrice ? parseFloat(maizePrice) : 6750,
        beans: beansPrice ? parseFloat(beansPrice) : 10350
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

function calculateGrossMargin(crop: string, costs: any) {
  const defaults = {
    maize: {
      low: { bags: 10, pricePerBag: 6750, seedCost: 5625, fertilizerCost: 0, labourCost: 13300, transportCost: 500, bagCost: 400 },
      medium: { bags: 40, pricePerBag: 6750, seedCost: 5625, fertilizerCost: 13250, labourCost: 24200, transportCost: 2000, bagCost: 1600 },
      high: { bags: 75, pricePerBag: 6750, seedCost: 5625, fertilizerCost: 20700, labourCost: 33650, transportCost: 3750, bagCost: 3000 }
    }
  };

  const data = defaults[crop as keyof typeof defaults] || defaults.maize;

  const calculate = (level: any) => {
    const grossOutput = level.bags * level.pricePerBag;
    const totalCost = level.seedCost + level.fertilizerCost + level.labourCost +
                      level.transportCost + level.bagCost;
    return {
      ...level,
      grossOutput,
      totalCost,
      grossMargin: grossOutput - totalCost
    };
  };

  return {
    crop,
    low: calculate(data.low),
    medium: calculate(data.medium),
    high: calculate(data.high)
  };
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