import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("🌾 Farmer Session Generation Route Loaded");
console.log("📦 GoogleGenerativeAI import:", !!GoogleGenerativeAI);
console.log("🔑 API Key exists:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);
console.log("🔑 API Key preview:", process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 10) + "...");

export async function POST(request: NextRequest) {
  try {
    // 🌾 ALL FARMER DETAILS
    const {
      // Location
      crops,
      season,
      county,
      subCounty,
      village,

      // Crop details
      cropOfInterest,
      acres,
      previousCrop,
      averageHarvest,
      harvestUnit,

      // Fertilizer - Planting
      usePlantingFertilizer,
      plantingFertilizerType,
      plantingFertilizerQuantity,
      noPlantingFertilizerReason,

      // Fertilizer - Topdressing
      useTopdressingFertilizer,
      topdressingFertilizerType,
      topdressingFertilizerQuantity,
      noTopdressingFertilizerReason,

      // Soil & Organic
      soilTested,
      soilType,
      organicManure,

      // Conservation practices
      terracing,
      mulching,
      coverCrops,
      rainwaterHarvesting,
      contourFarming,

      // Seed details - NEW
      useCertifiedSeed,        // "yes" or "no"
      certifiedSeedReason,     // if no: "too expensive", "not available", etc.
      seedQuantity,            // kg per acre if yes

      // Livestock - UPDATED
      cattle,
      cattleType,              // "hybrid", "local", "mixed"
      milkProduction,          // liters per day
      otherLivestock,

      // Technology
      smartphone,
      phoneNumber,

      // Farmer profile
      experience,
      mainChallenge,

      // User
      userid
    } = await request.json();

    // Validate required fields
    if (!crops || !county || !userid) {
      return NextResponse.json(
        { error: "Missing required fields: crops, county, userid are required" },
        { status: 400 }
      );
    }

    // 🌾 Build personalized prompt with ALL new fields
    const prompt = `You are an agricultural expert in East Africa. Based on this farmer's details, provide 5 personalized farming recommendations:

FARMER DETAILS:
- Crops grown: ${crops}
- Season: ${season || "not specified"}
- Location: ${county}${subCounty ? `, ${subCounty}` : ""}${village ? `, ${village}` : ""}
- Crop of interest: ${cropOfInterest || crops.split(",")[0]}
- Farm size: ${acres || "not specified"} acres
- Previous crop: ${previousCrop || "not specified"}
- Average harvest: ${averageHarvest || "not specified"} ${harvestUnit || ""} per acre

FERTILIZER USE:
- Planting fertilizer: ${usePlantingFertilizer === "yes" ? `Yes - ${plantingFertilizerType} ${plantingFertilizerQuantity}kg/acre` : `No - Reason: ${noPlantingFertilizerReason || "not specified"}`}
- Topdressing fertilizer: ${useTopdressingFertilizer === "yes" ? `Yes - ${topdressingFertilizerType} ${topdressingFertilizerQuantity}kg/acre` : `No - Reason: ${noTopdressingFertilizerReason || "not specified"}`}
- Organic manure: ${organicManure === "yes" ? "Yes" : "No"}

SEED DETAILS:
- Uses certified seed: ${useCertifiedSeed === "yes" ? `Yes - ${seedQuantity || "?"} kg/acre` : `No - Reason: ${certifiedSeedReason || "not specified"}`}

SOIL & CONSERVATION:
- Soil tested: ${soilTested === "yes" ? "Yes" : "No"}
- Soil type: ${soilType || "not specified"}
- Terracing: ${terracing === "yes" ? "Yes" : "No"}
- Mulching: ${mulching === "yes" ? "Yes" : "No"}
- Cover crops: ${coverCrops === "yes" ? "Yes" : "No"}
- Rainwater harvesting: ${rainwaterHarvesting === "yes" ? "Yes" : "No"}
- Contour farming: ${contourFarming === "yes" ? "Yes" : "No"}

LIVESTOCK:
- Cattle: ${cattle || "0"}
- Cattle type: ${cattleType || "not specified"}
- Milk production: ${milkProduction || "not specified"} liters/day
- Other livestock: ${otherLivestock || "none"}

FARMER PROFILE:
- Experience: ${experience || "not specified"} years
- Main challenge: ${mainChallenge || "not specified"}
- Has smartphone: ${smartphone === "yes" ? "Yes" : "No"}

IMPORTANT INSTRUCTIONS:
1. Provide 5 specific, actionable recommendations
2. Tailor advice to their ACTUAL fertilizer usage and quantities
3. If they don't use fertilizer due to cost, suggest low-cost alternatives
4. If they don't use certified seed, address their specific reason
5. If harvest is low, diagnose possible causes based on their practices
6. Integrate livestock advice if they have cattle, considering breed type and milk production
7. Suggest conservation practices they're NOT using
8. Consider their main challenge in recommendations
9. If no smartphone, note that SMS alerts are available

FORMAT: Return ONLY a JSON array of 5 strings, each a complete recommendation.

EXAMPLE:
["Plant maize in early March for long rains. Based on your 2 acres, use 100kg DAP at planting.", "Since you don't use fertilizer due to cost, try composting with manure from your 3 cows.", "Consider using certified seed - it increases yield by 30% despite higher cost.", "Your harvest of 10 bags is below average. Lack of topdressing may be the issue.", "For your hybrid cows, ensure they get enough water to maintain 15 liters/day production."]

RECOMMENDATIONS:`;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.error("Google Generative AI API key is missing");
      return NextResponse.json(
        { error: "API configuration error - Gemini API key required" },
        { status: 500 }
      );
    }

    console.log(`🌾 Generating farming recommendations for ${crops} in ${county}...`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        responseMimeType: "application/json"
      }
    });

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

    if (!generatedText.trim()) {
      return NextResponse.json({
        success: false,
        error: "Empty response from Gemini AI",
      }, { status: 500 });
    }

    console.log("Raw Gemini response:", generatedText.substring(0, 200) + "...");

    // Parse the response into an array of recommendations
    const recommendationsArray = parseGeneratedText(generatedText);

    // Clean and validate recommendations
    const cleanRecommendationsArray = cleanRecommendations(recommendationsArray);

    if (cleanRecommendationsArray.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid recommendations generated from AI response",
      }, { status: 500 });
    }

    // 🌾 Save COMPLETE farmer session to Firebase
    const sessionRef = db.collection("farmer_sessions").doc();
    const sessionId = sessionRef.id;

    const farmerSession = {
      id: sessionId,
      userId: userid,

      // Location
      crops: crops.split(",").map((c: string) => c.trim()),
      season,
      county,
      subCounty,
      village,

      // Crop details
      cropOfInterest,
      acres: acres ? parseFloat(acres) : null,
      previousCrop,
      averageHarvest: averageHarvest ? parseFloat(averageHarvest) : null,
      harvestUnit,

      // Fertilizer - Planting
      plantingFertilizer: {
        used: usePlantingFertilizer === "yes",
        type: plantingFertilizerType || null,
        quantity: plantingFertilizerQuantity ? parseFloat(plantingFertilizerQuantity) : null,
        reason: noPlantingFertilizerReason || null
      },

      // Fertilizer - Topdressing
      topdressingFertilizer: {
        used: useTopdressingFertilizer === "yes",
        type: topdressingFertilizerType || null,
        quantity: topdressingFertilizerQuantity ? parseFloat(topdressingFertilizerQuantity) : null,
        reason: noTopdressingFertilizerReason || null
      },

      // Soil & Organic
      soilTested: soilTested === "yes",
      soilType,
      organicManure: organicManure === "yes",

      // Seed details - NEW
      useCertifiedSeed: useCertifiedSeed === "yes",
      certifiedSeedReason: certifiedSeedReason || null,
      seedQuantity: seedQuantity ? parseFloat(seedQuantity) : null,

      // Conservation practices
      conservation: [
        terracing === "yes" ? "terracing" : null,
        mulching === "yes" ? "mulching" : null,
        coverCrops === "yes" ? "coverCrops" : null,
        rainwaterHarvesting === "yes" ? "rainwaterHarvesting" : null,
        contourFarming === "yes" ? "contourFarming" : null,
      ].filter(Boolean),

      // Livestock - UPDATED
      cattle: cattle ? parseInt(cattle) : 0,
      cattleDetails: cattle && parseInt(cattle) > 0 ? {
        type: cattleType || null,
        milkPerDay: milkProduction ? parseFloat(milkProduction) : null
      } : null,
      otherLivestock,

      // Technology
      smartphone: smartphone === "yes",
      phoneNumber,

      // Farmer profile
      experience: experience ? parseInt(experience) : null,
      mainChallenge,

      // AI-generated recommendations
      recommendations: cleanRecommendationsArray,

      // Metadata
      createdAt: new Date().toISOString(),
      queryCount: 0,
      source: "gemini"
    };

    try {
      await sessionRef.set(farmerSession);
      console.log(`✅ Saved farmer session ${sessionId} with ${cleanRecommendationsArray.length} recommendations`);
      console.log(`   Cattle: ${cattle}, Type: ${cattleType}, Milk: ${milkProduction} L/day`);
      console.log(`   Certified seed: ${useCertifiedSeed}, Quantity: ${seedQuantity} kg/acre`);
    } catch (firebaseError) {
      console.error("Firebase save error:", firebaseError);
    }

    return NextResponse.json({
      success: true,
      recommendations: cleanRecommendationsArray,
      count: cleanRecommendationsArray.length,
      sessionId: sessionId,
      welcomeMessage: `🌾 Welcome! I've prepared ${cleanRecommendationsArray.length} recommendations for your ${crops} in ${county}. Ask me anything about farming!`
    }, { status: 200 });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error occurred"
    }, { status: 500 });
  }
}

// Helper function to parse generated text into array
function parseGeneratedText(text: string): string[] {
  const cleanedText = text.trim();

  // Method 1: Try to parse as JSON array
  if (cleanedText.startsWith('[') && cleanedText.endsWith(']')) {
    try {
      const parsed = JSON.parse(cleanedText);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.log("JSON parse failed, trying regex extraction...");
    }
  }

  // Method 2: Extract array with regex
  const arrayMatch = cleanedText.match(/\[(.*?)\]/s);
  if (arrayMatch) {
    try {
      const arrayText = `[${arrayMatch[1]}]`;
      const parsed = JSON.parse(arrayText);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.log("Regex array extraction failed");
    }
  }

  // Method 3: Split by common patterns
  const lines = cleanedText.split('\n');
  const recommendations: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed ||
        trimmed.startsWith('```') ||
        trimmed.startsWith('{') ||
        trimmed.toLowerCase().includes('here are') ||
        trimmed.toLowerCase().includes('example')) {
      continue;
    }

    let recommendation = trimmed
      .replace(/^[\d]+[\.\)]\s*/, '')
      .replace(/^[a-zA-Z][\.\)]\s*/, '')
      .replace(/^[-*•]\s*/, '')
      .replace(/^["']|["']$/g, '')
      .trim();

    if (recommendation.length > 15) {
      recommendations.push(recommendation);
    }
  }

  return recommendations;
}

// Helper function to clean recommendations
function cleanRecommendations(recs: string[]): string[] {
  return recs
    .filter((r, index, self) => {
      if (typeof r !== 'string') return false;
      const trimmed = r.trim();
      if (trimmed.length < 15) return false;
      const normalized = trimmed.toLowerCase();
      const firstIndex = self.findIndex(item =>
        item.toLowerCase().normalize() === normalized.normalize()
      );
      return firstIndex === index;
    })
    .map(r => {
      return r
        .replace(/\\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/["']{2,}/g, '"')
        .replace(/^\s*["']|["']\s*$/g, '')
        .replace(/[`~@#$%^&*_=+<>]/g, '')
        .trim();
    })
    .slice(0, 5);
}

export async function GET() {
  return NextResponse.json({
    status: "operational",
    message: "🌾 Farmer Session Generation API",
    endpoints: {
      generate: "POST /api/vapi/generate (create farmer session with recommendations)"
    },
    note: "This API creates personalized farming recommendations based on farmer details including crops, fertilizer use, certified seed, and livestock."
  }, { status: 200 });
}