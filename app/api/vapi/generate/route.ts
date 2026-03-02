// app/api/vapi/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { hybridSearch } from "@/lib/rag/hybridSearch";
import { CacheManager } from "@/lib/rag/cacheManager";
import { soilTestInterpreter } from "@/lib/soilTestInterpreter";
import { fertilizerCalculator } from "@/lib/fertilizerCalculator";
import { FieldValue } from "firebase-admin/firestore";
import { calculateRankedCropProfits } from "@/lib/utils/cropCalculations";

console.log("🌾 Farmer Session Generation Route Loaded");
console.log("🔑 API Key exists:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // 🌾 COMPREHENSIVE FARMER DETAILS - ALL 100+ QUESTIONS
    const {
      // SECTION 1: Personal & Location Information
      farmerName,
      phoneNumber,
      subCounty,
      ward,
      village,
      altitude,
      annualRainfall,

      // SECTION 2: Farm Overview
      totalFarmSize,
      cultivatedAcres,
      soilType,
      soilTested,
      waterSources,

      // SECTION 3: Crops Grown (Main crop details - for primary crop)
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

      // SECTION 4: Financial Information
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

      // SECTION 5: Infrastructure & Access
      roadAccess,
      marketDistance,
      creditAccess,
      supportPrograms,

      // SECTION 6: Livestock Enterprises
      livestockTypes,
      cattleBreed,
      milkYield,
      calvingRate,
      feedingSystem,
      poultryType,
      birdCount,
      eggProduction,
      mortalityRate,

      // SECTION 7: Post-Harvest & Value Addition
      postHarvestPractices,
      postHarvestLosses,
      valueAddition,
      bagCost,
      storageAccess,

      // SECTION 8: Challenges & Support
      productionChallenges,
      marketingChallenges,
      experience,
      mainChallenge,

      // SECTION 9: Management Level
      managementLevel,

      // ========== SOIL TEST SECTION ==========
      hasDoneSoilTest,
      soilTestDate,

      // pH
      soilTestPH,
      soilTestPHRating,

      // Phosphorus
      soilTestP,
      soilTestPRating,

      // Potassium
      soilTestK,
      soilTestKRating,

      // Calcium
      soilTestCa,
      soilTestCaRating,

      // Magnesium
      soilTestMg,
      soilTestMgRating,

      // Sodium
      soilTestNa,
      soilTestNaRating,

      // Total Nitrogen
      soilTestNPercent,
      soilTestNPercentRating,

      // Organic Carbon
      soilTestOC,
      soilTestOCRating,

      // Organic Matter
      soilTestOM,
      soilTestOMRating,

      // CEC
      soilTestCEC,
      soilTestCECRating,

      // Target Yield
      targetYield,

      // Fertilizer Selection
      availablePlantingFertilizers,
      availableTopDressingFertilizers,

      // Original fields
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

      // User ID
      userid
    } = await request.json();

    if (!crops || !county || !userid) {
      return NextResponse.json(
        { error: "Missing required fields: crops, county, userid are required" },
        { status: 400 }
      );
    }

    // Process crops array
    const cropsArray = crops.split(",").map((c: string) => c.trim());
    const primaryCrop = cropsArray[0];

    // 🔍 RAG ENHANCEMENT: Retrieve relevant knowledge
    const searchQuery = `${primaryCrop} farming in ${county} ${soilType || ''} ${mainChallenge || ''}`;

    const relevantKnowledge = await hybridSearch(searchQuery, {
      cropType: cropsArray,
      region: county,
      soilType: soilType,
      category: mainChallenge === 'pests' ? 'pest_control' :
                mainChallenge === 'water' ? 'irrigation' : 'general'
    }, {
      crops: cropsArray,
      county
    });

    console.log(`📚 Retrieved ${relevantKnowledge.length} relevant knowledge chunks`);

    // Build context from retrieved knowledge
    const knowledgeContext = relevantKnowledge
      .map(k => k.content)
      .join('\n\n');

    // ========== SOIL TEST ANALYSIS ==========
    let soilAnalysis = null;
    let fertilizerRecommendations = null;
    let fertilizerPlan = null;

    if (hasDoneSoilTest === "Yes" && soilTestDate) {
      try {
        // Parse soil test data
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

        // Interpret soil test
        soilAnalysis = soilTestInterpreter.interpretSoilTest(soilTestData);

        // Check soil test age
        const ageStatus = soilTestInterpreter.getTestAgeStatus(soilAnalysis.testAge);

        // ========== GENERATE COMPLETE FERTILIZER INTERVENTIONS ==========
        fertilizerPlan = soilTestInterpreter.generateCompleteFertilizerPlan(
          soilAnalysis,
          primaryCrop,
          availablePlantingFertilizers ? availablePlantingFertilizers.split(',') : []
        );
        console.log(`📊 Generated fertilizer plan with ${fertilizerPlan.interventions.length} interventions for deficient nutrients`);

        // Calculate fertilizer recommendations if fertilizers are selected
        if (availablePlantingFertilizers || availableTopDressingFertilizers) {
          const plantingFertIds = availablePlantingFertilizers ? availablePlantingFertilizers.split(',') : [];
          const topDressingFertIds = availableTopDressingFertilizers ? availableTopDressingFertilizers.split(',') : [];
          const targetYieldNum = parseFloat(targetYield) || 40;

          fertilizerRecommendations = fertilizerCalculator.calculateFertilizerProgram(
            soilTestData,
            primaryCrop,
            targetYieldNum,
            plantingFertIds,
            topDressingFertIds
          );
        }
      } catch (error) {
        console.error("Error processing soil test:", error);
      }
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API configuration error - Gemini API key required" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000, // Increased to 4000 for even longer recommendations
        responseMimeType: "application/json"
      }
    });

    // Build soil context for prompt
    const soilContext = soilAnalysis ? `
SOIL TEST RESULTS:
- Test date: ${soilAnalysis.testDate}
- pH: ${soilAnalysis.ph} (${soilAnalysis.phRating})
- Phosphorus: ${soilAnalysis.phosphorus} ppm (${soilAnalysis.phosphorusRating})
- Potassium: ${soilAnalysis.potassium} ppm (${soilAnalysis.potassiumRating})
- Calcium: ${soilAnalysis.calcium} ppm (${soilAnalysis.calciumRating})
- Magnesium: ${soilAnalysis.magnesium} ppm (${soilAnalysis.magnesiumRating})
- Total Nitrogen: ${soilAnalysis.totalNitrogen}% (${soilAnalysis.totalNitrogenRating})
- Organic Matter: ${soilAnalysis.organicMatter}% (${soilAnalysis.organicMatterRating})
- CEC: ${soilAnalysis.cec} meq/100g (${soilAnalysis.cecRating})
` : "";

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    // Build fertilizer plan context with EXACT calculations
    const fertilizerPlanContext = fertilizerPlan ? `
PRECISION FERTILIZER CALCULATIONS FROM SOIL TEST:

${fertilizerPlan.interventions.map((inv: any) => {
  return `${inv.nutrient} is ${inv.level} (${inv.value}${inv.nutrient.includes('pH') ? '' : inv.nutrient.includes('Nitrogen') ? '%' : 'ppm'}).
RECOMMENDATION: ${inv.recommendation}
CALCULATED OPTIONS:
${inv.fertilizerOptions.map((opt: any) =>
  `  • ${opt.name}: ${opt.amountKg} kg per acre
    Cost: ${formatCurrency(opt.cost || 0)}
    Provides: ${Object.entries(opt.provides).map(([k, v]) => `${v} kg ${k}`).join(', ')}`
).join('\n')}
`;
}).join('\n')}

TOTAL FERTILIZER INVESTMENT: ${formatCurrency(fertilizerPlan.totalCost)} per acre
PLANTING FERTILIZERS: ${fertilizerPlan.plantingFertilizers.map((p: any) => `${p.selected.name} (${p.selected.amountKg}kg)`).join(', ')}
TOPDRESSING FERTILIZERS: ${fertilizerPlan.topdressingFertilizers.map((t: any) => `${t.selected.name} (${t.selected.amountKg}kg)`).join(', ')}
` : "";

    const fertilizerContext = fertilizerRecommendations ?
      fertilizerCalculator.generateRecommendationText(fertilizerRecommendations, primaryCrop) : "";

    // 🌾 ENHANCED prompt with ALL farmer details and explicit instruction for complete sentences
    const prompt = `You are an agricultural expert in East Africa. Based on this farmer's complete profile below, provide comprehensive farming recommendations including agronomic advice AND financial analysis.

FARMER DETAILS:

LOCATION & FARM OVERVIEW:
- Farmer name: ${farmerName || "Not specified"}
- Phone: ${phoneNumber || "Not specified"}
- Location: ${county}${subCounty ? `, ${subCounty}` : ""}${ward ? `, ${ward}` : ""}${village ? `, ${village}` : ""}
- Altitude: ${altitude || "Not specified"}
- Annual rainfall: ${annualRainfall || "Not specified"}
- Total farm size: ${totalFarmSize || acres || "Not specified"} acres
- Cultivated area: ${cultivatedAcres || acres || "Not specified"} acres
- Soil type: ${soilType || "Not specified"}

${soilContext}

CROPS GROWN:
- Primary crops: ${crops}
- Varieties: ${cropVarieties || "Not specified"}
- Crop acreage: ${cropAcres || acres || "Not specified"} acres
- Planting date: ${plantingDate || season || "Not specified"}
- Harvest date: ${harvestDate || "Not specified"}
- Seed source: ${seedSource || "Not specified"}
- Spacing used: ${spacing || "Not specified"}
- Seed rate: ${seedRate || seedQuantity || "Not specified"} kg/acre

FERTILIZER USE:
- Planting fertilizer: ${usePlantingFertilizer === "yes" ? `${plantingFertilizerType} ${plantingFertilizerQuantity}kg` : `No - Reason: ${noPlantingFertilizerReason || "not specified"}`}
- Topdressing fertilizer: ${useTopdressingFertilizer === "yes" ? `${topdressingFertilizerType} ${topdressingFertilizerQuantity}kg` : `No - Reason: ${noTopdressingFertilizerReason || "not specified"}`}

PESTS & DISEASES:
- Common pests: ${commonPests || "Not specified"}
- Pest control: ${pestControlMethod || "Not specified"}
- Common diseases: ${commonDiseases || "Not specified"}
- Disease control: ${diseaseControlMethod || "Not specified"}

FINANCIAL INFORMATION:
- Labour costs: Ploughing Ksh ${ploughingCost || "unknown"}/acre, Planting Ksh ${plantingLabourCost || "unknown"}/acre, Weeding Ksh ${weedingCost || "unknown"}/acre
- Daily wage rate: Ksh ${dailyWageRate || "unknown"}/day
- Selling price: Maize Ksh ${maizePrice || "6750"}/bag, Beans Ksh ${beansPrice || "10350"}/bag

LIVESTOCK (if any):
- Livestock types: ${livestockTypes || otherLivestock || "None"}
- Cattle details: ${cattleBreed || cattleType || "None"}, Milk: ${milkYield || milkProduction || "0"} L/day

FARMER PROFILE:
- Experience: ${experience || "Not specified"} years
- Main challenge: ${mainChallenge || productionChallenges || "Not specified"}
- Management level: ${managementLevel || "Medium input"}

${fertilizerPlanContext}

${fertilizerContext ? `ADDITIONAL FERTILIZER RECOMMENDATIONS:\n${fertilizerContext}` : ""}

RETRIEVED KNOWLEDGE (use this to inform your recommendations):
${knowledgeContext || "No specific knowledge retrieved, use general expertise."}

INSTRUCTIONS:
1. Provide 5 SPECIFIC, ACTIONABLE recommendations covering agronomy, pest/disease management, and financial optimization
2. **CRITICAL: You MUST include the EXACT fertilizer calculations from the PRECISION FERTILIZER CALCULATIONS section above in your recommendations**
3. For each deficient nutrient, show:
   - The current level (e.g., "Phosphorus: 12 ppm - Very Low")
   - EXACT kg of fertilizer to buy (e.g., "Apply 65 kg DAP")
   - Cost of that fertilizer (e.g., "Cost: Ksh 4,550")
   - What nutrients it provides (e.g., "Provides 30kg P₂O₅ + 11.7kg N")
4. Include the total fertilizer investment in your financial advice
5. **IMPORTANT: Each recommendation MUST be a complete sentence that ends with proper punctuation (. ! ?). Do not cut off mid-sentence.**
6. **CRITICAL: Ensure each recommendation is a complete thought with closing parenthesis and proper punctuation.**
7. Base advice on the RETRIEVED KNOWLEDGE when available
8. Provide a simple GROSS MARGIN ANALYSIS table showing potential profitability
9. Address their specific pests/diseases with control methods
10. Consider their main challenge in recommendations

FORMAT: Return a JSON object with this structure:
{
  "recommendations": [
    "**Soil Test Results & Fertilizer Plan:** Your soil test shows... Based on these results, you need to buy and apply: [list all fertilizers with exact kg and costs]",
    "**Phosphorus Management:** Your soil has [X]ppm P ([Level]). Apply [Y]kg of [fertilizer name] at planting, costing Ksh [Z]. This will provide [amount]kg P₂O₅.",
    "**Potassium Management:** Your soil has [X]ppm K ([Level]). Apply [Y]kg of [fertilizer name] at planting, costing Ksh [Z]. This will provide [amount]kg K₂O.",
    "**pH Correction:** Your soil pH is [X] ([Level]). Apply [Y]kg of lime before planting, costing Ksh [Z].",
    "**Financial Summary:** Total fertilizer investment Ksh [X]. Expected yield increase [Y]%, giving additional profit Ksh [Z] (ROI [W]%)."
  ],
  "grossMarginAnalysis": {
    "crop": "primary crop name",
    "low": { "bags": 10, "grossOutput": 67500, "totalCost": 23310, "grossMargin": 44190 },
    "medium": { "bags": 40, "grossOutput": 270000, "totalCost": 52290, "grossMargin": 217710 },
    "high": { "bags": 75, "grossOutput": 506250, "totalCost": 72570, "grossMargin": 433680 }
  },
  "financialAdvice": "Your total fertilizer investment is Ksh [X]. Based on your soil test, this could increase yields by [Y]%, giving you an additional profit of Ksh [Z]. That's a [W]% return on investment!"
}

RECOMMENDATIONS:`;

    let generatedText;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      generatedText = response.text();
    } catch (error: any) {
      console.error("Gemini API error:", error.message);
      return NextResponse.json({
        success: false,
        error: `Gemini API error: ${error.message}`,
      }, { status: 500 });
    }

    // ========== IMPROVED PARSING TO REMOVE JSON ARTIFACTS ==========
    let recommendationsArray = [];
    let grossMarginData = null;
    let financialAdvice = "";

    try {
      console.log("📥 Raw Gemini response:", generatedText.substring(0, 200));

      // Try to parse as JSON
      const parsed = JSON.parse(generatedText);

      // Check if parsed has a recommendations array
      if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
        // Filter out any elements that are just JSON artifacts
        recommendationsArray = parsed.recommendations.filter((rec: any) => {
          if (typeof rec !== 'string') return true;
          // Filter out strings that are just JSON formatting
          return !rec.includes('"recommendations"') &&
                 !rec.match(/^\[\s*$/) &&
                 rec.length > 20;
        });
      }
      else if (Array.isArray(parsed)) {
        // If parsed is an array, filter out artifacts
        recommendationsArray = parsed.filter((rec: any) => {
          if (typeof rec !== 'string') return true;
          return !rec.includes('"recommendations"') &&
                 !rec.match(/^\[\s*$/) &&
                 rec.length > 20;
        });
      }

      grossMarginData = parsed.grossMarginAnalysis || null;
      financialAdvice = parsed.financialAdvice || "";

      console.log("✅ Parsed recommendations after filtering:", recommendationsArray);

    } catch (e) {
      console.log("⚠️ JSON parse failed, using fallback parsing");

      // Manual extraction - look for recommendation text
      const lines = generatedText.split('\n');
      recommendationsArray = [];

      for (const line of lines) {
        const trimmed = line.trim();
        // Look for lines that start with ** (bold) and are long enough
        if (trimmed.startsWith('**') && trimmed.length > 30) {
          recommendationsArray.push(trimmed);
        }
      }
    }

    // If we still don't have recommendations, try one more approach
    if (recommendationsArray.length === 0) {
      // Try to extract anything that looks like a recommendation
      const matches = generatedText.match(/\*\*[^*]+\*\*[^"]+/g);
      if (matches) {
        recommendationsArray = matches;
      }
    }

    const cleanRecommendationsArray = cleanRecommendations(recommendationsArray);

    if (cleanRecommendationsArray.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid recommendations generated",
      }, { status: 500 });
    }

    // Save to Firebase with ALL new fields
    const sessionRef = db.collection("farmer_sessions").doc();
    const sessionId = sessionRef.id;

    const farmerSession = {
      id: sessionId,
      userId: userid,

      // SECTION 1: Personal & Location
      farmerName,
      phoneNumber,
      county,
      subCounty,
      ward,
      village,
      altitude,
      annualRainfall,

      // SECTION 2: Farm Overview
      totalFarmSize: totalFarmSize ? parseFloat(totalFarmSize) : null,
      cultivatedAcres: cultivatedAcres ? parseFloat(cultivatedAcres) : (acres ? parseFloat(acres) : null),
      soilType,
      soilTested: soilTested === "yes",
      waterSources: waterSources ? waterSources.split(',') : [],

      // SECTION 3: Crops
      crops: cropsArray,
      cropVarieties,
      cropAcres: cropAcres ? parseFloat(cropAcres) : null,
      plantingDate,
      harvestDate,
      seedSource,
      spacing,
      seedRate: seedRate ? parseFloat(seedRate) : (seedQuantity ? parseFloat(seedQuantity) : null),

      // Fertilizer
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

      // Pests & Diseases
      commonPests,
      pestControlMethod,
      commonDiseases,
      diseaseControlMethod,

      // Production
      actualYield: actualYield ? parseFloat(actualYield) : (averageHarvest ? parseFloat(averageHarvest) : null),
      yieldUnit: yieldUnit || harvestUnit || "bags",
      storageMethod,

      // SECTION 4: Financial
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

      // SECTION 5: Infrastructure
      roadAccess,
      marketDistance: marketDistance ? parseFloat(marketDistance) : null,
      creditAccess: creditAccess ? creditAccess.split(',') : [],
      supportPrograms: supportPrograms ? supportPrograms.split(',') : [],

      // SECTION 6: Livestock
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

      // SECTION 7: Post-Harvest
      postHarvestPractices: postHarvestPractices ? postHarvestPractices.split(',') : [],
      postHarvestLosses: postHarvestLosses || null,
      valueAddition: valueAddition ? valueAddition.split(',') : [],
      storageAccess: storageAccess === "yes",

      // SECTION 8: Challenges
      productionChallenges: productionChallenges ? productionChallenges.split(',') : [],
      marketingChallenges: marketingChallenges ? marketingChallenges.split(',') : [],
      experience: experience ? parseInt(experience) : null,
      mainChallenge,

      // SECTION 9: Management Level
      managementLevel,

      // ========== SOIL TEST DATA ==========
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
        fertilizerRecommendations,
        interventions: fertilizerPlan?.interventions || [],
        fertilizerPlan: fertilizerPlan ? {
          planting: fertilizerPlan.plantingFertilizers,
          topdressing: fertilizerPlan.topdressingFertilizers,
          totalCost: fertilizerPlan.totalCost,
          summary: fertilizerPlan.summary
        } : null
      } : null,

      // Fertilizer selections
      availablePlantingFertilizers: availablePlantingFertilizers ? availablePlantingFertilizers.split(',') : [],
      availableTopDressingFertilizers: availableTopDressingFertilizers ? availableTopDressingFertilizers.split(',') : [],

      // Original fields
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

      // AI-generated content
      recommendations: cleanRecommendationsArray,
      grossMarginAnalysis: grossMarginData,
      financialAdvice,

      // RAG context
      ragContext: {
        chunksUsed: relevantKnowledge.length,
        query: searchQuery
      },

      // Metadata
      createdAt: new Date().toISOString(),
      queryCount: 0,
      source: "gemini-rag-comprehensive"
    };

    await sessionRef.set(farmerSession);
    console.log(`✅ Saved farmer session ${sessionId} with ${cleanRecommendationsArray.length} recommendations`);

    // ========== CALCULATE RANKED CROP PROFITS ==========
    const rankedProfits = calculateRankedCropProfits(farmerSession);
    console.log(`📊 Ranked ${rankedProfits.length} crops by profitability:`,
      rankedProfits.map(p => `${p.crop}: ${p.profit}`).join(', '));

    // Invalidate relevant caches
    await CacheManager.invalidate(`search:*${county}*`);

    return NextResponse.json({
      success: true,
      recommendations: cleanRecommendationsArray,
      grossMarginAnalysis: grossMarginData,
      financialAdvice,
      rankedProfits,
      count: cleanRecommendationsArray.length,
      sessionId: sessionId,
      soilTestAnalyzed: !!soilAnalysis,
      fertilizerCalculated: !!fertilizerRecommendations,
      fertilizerPlanGenerated: !!fertilizerPlan,
      ragUsed: relevantKnowledge.length > 0,
      welcomeMessage: `🌾 Welcome ${farmerName || "Farmer"}! I've prepared ${cleanRecommendationsArray.length} personalized recommendations, ranked your ${rankedProfits.length} crops by profitability, and created a precision fertilizer plan based on your soil test.`
    }, { status: 200 });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error occurred"
    }, { status: 500 });
  }
}

// Helper functions
function parseGeneratedText(text: string): string[] {
  const cleanedText = text.trim();

  if (cleanedText.startsWith('[') && cleanedText.endsWith(']')) {
    try {
      const parsed = JSON.parse(cleanedText);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  const arrayMatch = cleanedText.match(/\[(.*?)\]/s);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(`[${arrayMatch[1]}]`);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }

  const lines = cleanedText.split('\n');
  const recommendations: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('```')) continue;

    let recommendation = trimmed
      .replace(/^[\d]+[\.\)]\s*/, '')
      .replace(/^[-*•]\s*/, '')
      .trim();

    if (recommendation.length > 15) {
      recommendations.push(recommendation);
    }
  }

  return recommendations;
}

function cleanRecommendations(recs: string[]): string[] {
  return recs
    .filter((r, index, self) => {
      if (typeof r !== 'string') return false;
      const trimmed = r.trim();
      // Filter out JSON artifacts and very short strings
      if (trimmed.length < 30) return false;
      if (trimmed.includes('"recommendations"')) return false;
      if (trimmed.match(/^\[\s*$/)) return false;

      // Remove duplicates
      return self.findIndex(item =>
        item.toLowerCase().trim() === trimmed.toLowerCase()
      ) === index;
    })
    .map(r => {
      // Clean up the text
      return r
        .replace(/^["\\[\]]+|["\\[\]]+$/g, '')
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    })
    .slice(0, 5);
}

export async function GET() {
  return NextResponse.json({
    status: "operational",
    message: "🌾 Farmer Session Generation API with Soil Test Analysis & Precision Fertilizer Plan",
    endpoints: {
      generate: "POST /api/vapi/generate (create farmer session with soil test based fertilizer interventions for each deficient nutrient)"
    }
  }, { status: 200 });
}