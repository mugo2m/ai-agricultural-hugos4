// app/api/vapi/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { hybridSearch } from "@/lib/rag/hybridSearch";
import { CacheManager } from "@/lib/rag/cacheManager";

console.log("🌾 Farmer Session Generation Route Loaded");
console.log("🔑 API Key exists:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // 🌾 ALL FARMER DETAILS
    const {
      crops,
      season,
      county,
      subCounty,
      village,
      cropOfInterest,
      acres,
      previousCrop,
      averageHarvest,
      harvestUnit,
      usePlantingFertilizer,
      plantingFertilizerType,
      plantingFertilizerQuantity,
      noPlantingFertilizerReason,
      useTopdressingFertilizer,
      topdressingFertilizerType,
      topdressingFertilizerQuantity,
      noTopdressingFertilizerReason,
      soilTested,
      soilType,
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
      phoneNumber,
      experience,
      mainChallenge,
      userid
    } = await request.json();

    if (!crops || !county || !userid) {
      return NextResponse.json(
        { error: "Missing required fields: crops, county, userid are required" },
        { status: 400 }
      );
    }

    // 🔍 RAG ENHANCEMENT: Retrieve relevant knowledge
    const searchQuery = `${crops} farming in ${county} ${soilType || ''} ${mainChallenge || ''}`;

    const relevantKnowledge = await hybridSearch(searchQuery, {
      cropType: crops.split(',').map(c => c.trim()),
      region: county,
      soilType: soilType,
      category: mainChallenge === 'pests' ? 'pest_control' :
                mainChallenge === 'water' ? 'irrigation' : 'general'
    }, {
      crops: crops.split(',').map(c => c.trim()),
      county
    });

    console.log(`📚 Retrieved ${relevantKnowledge.length} relevant knowledge chunks`);

    // Build context from retrieved knowledge
    const knowledgeContext = relevantKnowledge
      .map(k => k.content)
      .join('\n\n');

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API configuration error - Gemini API key required" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        responseMimeType: "application/json"
      }
    });

    // 🌾 ENHANCED prompt with RAG context
    const prompt = `You are an agricultural expert in East Africa. Based on this farmer's details AND the retrieved knowledge below, provide 5 personalized farming recommendations:

FARMER DETAILS:
- Crops grown: ${crops}
- Season: ${season || "not specified"}
- Location: ${county}${subCounty ? `, ${subCounty}` : ""}${village ? `, ${village}` : ""}
- Crop of interest: ${cropOfInterest || crops.split(",")[0]}
- Farm size: ${acres || "not specified"} acres
- Previous crop: ${previousCrop || "not specified"}
- Average harvest: ${averageHarvest || "not specified"} ${harvestUnit || ""} per acre
- Fertilizer planting: ${usePlantingFertilizer === "yes" ? `${plantingFertilizerType} ${plantingFertilizerQuantity}kg` : "No"}
- Fertilizer topdressing: ${useTopdressingFertilizer === "yes" ? `${topdressingFertilizerType} ${topdressingFertilizerQuantity}kg` : "No"}
- Certified seed: ${useCertifiedSeed === "yes" ? `Yes - ${seedQuantity}kg` : `No - ${certifiedSeedReason}`}
- Soil type: ${soilType || "not specified"}
- Cattle: ${cattle || "0"} (${cattleType || "none"}, ${milkProduction || "0"} L/day)
- Main challenge: ${mainChallenge || "not specified"}

RETRIEVED KNOWLEDGE (use this to inform your recommendations):
${knowledgeContext || "No specific knowledge retrieved, use general expertise."}

IMPORTANT INSTRUCTIONS:
1. Provide 5 specific, actionable recommendations
2. Base advice on the RETRIEVED KNOWLEDGE when available
3. If they don't use fertilizer due to cost, suggest low-cost alternatives
4. If they don't use certified seed, address their specific reason
5. If harvest is low, diagnose possible causes
6. Integrate livestock advice if they have cattle
7. Suggest conservation practices they're NOT using
8. Consider their main challenge

FORMAT: Return ONLY a JSON array of 5 strings, each a complete recommendation.

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

    // Parse and clean recommendations
    const recommendationsArray = parseGeneratedText(generatedText);
    const cleanRecommendationsArray = cleanRecommendations(recommendationsArray);

    if (cleanRecommendationsArray.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid recommendations generated",
      }, { status: 500 });
    }

    // Save to Firebase
    const sessionRef = db.collection("farmer_sessions").doc();
    const sessionId = sessionRef.id;

    const farmerSession = {
      id: sessionId,
      userId: userid,
      crops: crops.split(",").map((c: string) => c.trim()),
      season,
      county,
      subCounty,
      village,
      cropOfInterest,
      acres: acres ? parseFloat(acres) : null,
      previousCrop,
      averageHarvest: averageHarvest ? parseFloat(averageHarvest) : null,
      harvestUnit,
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
      soilTested: soilTested === "yes",
      soilType,
      organicManure: organicManure === "yes",
      useCertifiedSeed: useCertifiedSeed === "yes",
      certifiedSeedReason: certifiedSeedReason || null,
      seedQuantity: seedQuantity ? parseFloat(seedQuantity) : null,
      conservation: [
        terracing === "yes" ? "terracing" : null,
        mulching === "yes" ? "mulching" : null,
        coverCrops === "yes" ? "coverCrops" : null,
        rainwaterHarvesting === "yes" ? "rainwaterHarvesting" : null,
        contourFarming === "yes" ? "contourFarming" : null,
      ].filter(Boolean),
      cattle: cattle ? parseInt(cattle) : 0,
      cattleDetails: cattle && parseInt(cattle) > 0 ? {
        type: cattleType || null,
        milkPerDay: milkProduction ? parseFloat(milkProduction) : null
      } : null,
      otherLivestock,
      smartphone: smartphone === "yes",
      phoneNumber,
      experience: experience ? parseInt(experience) : null,
      mainChallenge,
      recommendations: cleanRecommendationsArray,
      ragContext: {
        chunksUsed: relevantKnowledge.length,
        query: searchQuery
      },
      createdAt: new Date().toISOString(),
      queryCount: 0,
      source: "gemini-rag"
    };

    await sessionRef.set(farmerSession);
    console.log(`✅ Saved farmer session ${sessionId} with ${cleanRecommendationsArray.length} recommendations (RAG-enhanced)`);

    // Invalidate relevant caches
    await CacheManager.invalidate(`search:*${county}*`);

    return NextResponse.json({
      success: true,
      recommendations: cleanRecommendationsArray,
      count: cleanRecommendationsArray.length,
      sessionId: sessionId,
      ragUsed: relevantKnowledge.length > 0,
      welcomeMessage: `🌾 Welcome! I've prepared ${cleanRecommendationsArray.length} recommendations for your ${crops} in ${county}, based on our farming knowledge base. Ask me anything!`
    }, { status: 200 });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error occurred"
    }, { status: 500 });
  }
}

// Helper functions (keep existing)
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
      if (trimmed.length < 15) return false;
      return self.findIndex(item =>
        item.toLowerCase().trim() === trimmed.toLowerCase()
      ) === index;
    })
    .map(r => r.replace(/\s+/g, ' ').trim())
    .slice(0, 5);
}

export async function GET() {
  return NextResponse.json({
    status: "operational",
    message: "🌾 Farmer Session Generation API with RAG",
    endpoints: {
      generate: "POST /api/vapi/generate (create farmer session with RAG-enhanced recommendations)"
    }
  }, { status: 200 });
}