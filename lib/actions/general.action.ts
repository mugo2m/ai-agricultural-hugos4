// lib/actions/general.action.ts
"use server";

import { db } from "@/firebase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { hybridSearch } from "@/lib/rag/hybridSearch";
import { CacheManager } from "@/lib/rag/cacheManager";
import { generateEmbedding } from "@/lib/rag/embeddings";
import { FieldValue } from "firebase-admin/firestore";
import { soilTestInterpreter } from "@/lib/soilTestInterpreter";
import { fertilizerCalculator } from "@/lib/fertilizerCalculator";
// 👇 IMPORT from the new utility file
import { calculateRankedCropProfits } from "@/lib/utils/cropCalculations";

let genAI: GoogleGenerativeAI | null = null;
try {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  }
} catch (error) {
  console.log("⚠️ Gemini AI initialization skipped");
}

function cleanGeminiJson(text: string) {
  if (!text) return "{}";
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

// 🌾 Build Q&A history from farmer session with financial context
function buildFarmerQaHistory(messages: any[]) {
  const pairs: { question: string; answer: string; isFinancial?: boolean; isSoilTest?: boolean }[] = [];

  if (Array.isArray(messages)) {
    for (let i = 0; i < messages.length; i++) {
      if (messages[i]?.role === "user" && messages[i + 1]?.role === "assistant") {
        const question = messages[i].content;
        const isFinancial =
          question.toLowerCase().includes('cost') ||
          question.toLowerCase().includes('price') ||
          question.toLowerCase().includes('profit') ||
          question.toLowerCase().includes('margin');

        const isSoilTest =
          question.toLowerCase().includes('soil') ||
          question.toLowerCase().includes('fertilizer') ||
          question.toLowerCase().includes('ph') ||
          question.toLowerCase().includes('nutrient');

        pairs.push({
          question: question,
          answer: messages[i + 1].content,
          isFinancial,
          isSoilTest
        });
        i++;
      }
    }
  }

  console.log(`🌾 Built ${pairs.length} Q&A pairs from farmer session (${pairs.filter(p => p.isFinancial).length} financial, ${pairs.filter(p => p.isSoilTest).length} soil test)`);
  return pairs;
}

// 🌾 Format currency helper
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// 🌾 Calculate gross margin based on farmer data
function calculateGrossMargin(session: any) {
  if (!session) return null;

  const defaults = {
    maize: {
      low: { bags: 10, pricePerBag: 6750, seedCost: 5625, fertilizerCost: 0, labourCost: 13300, totalCost: 23310, grossMargin: 44190 },
      medium: { bags: 40, pricePerBag: 6750, seedCost: 5625, fertilizerCost: 13250, labourCost: 24200, totalCost: 52290, grossMargin: 217710 },
      high: { bags: 75, pricePerBag: 6750, seedCost: 5625, fertilizerCost: 20700, labourCost: 33650, totalCost: 72570, grossMargin: 433680 }
    }
  };

  const crop = session.crops?.[0] || 'maize';
  const pricePerBag = session.maizePrice || session.beansPrice || 6750;
  const dapCost = session.dapCost || 3300;
  const canCost = session.canCost || 2500;
  const labourRate = session.dailyWageRate || 200;

  let low, medium, high;

  // Low input
  low = {
    bags: 10,
    pricePerBag,
    grossOutput: 10 * pricePerBag,
    seedCost: session.seedCost || 5625,
    fertilizerCost: 0,
    labourCost: (session.ploughingCost || 7000) + (session.plantingLabourCost || 2000) + (session.weedingCost || 2500) + (session.harvestingCost || 500),
    transportCost: (session.transportCostPerBag || 50) * 10,
    bagCost: (session.bagCost || 40) * 10,
    totalCost: 0,
    grossMargin: 0
  };

  // Medium input
  medium = {
    bags: 40,
    pricePerBag,
    grossOutput: 40 * pricePerBag,
    seedCost: session.seedCost || 5625,
    fertilizerCost: (dapCost * 2.5) + (canCost * 2),
    labourCost: (session.ploughingCost || 7000) + 5000 + (session.plantingLabourCost || 2000) + (session.weedingCost || 4500) + (session.harvestingCost || 1500) + 1000,
    transportCost: (session.transportCostPerBag || 50) * 40,
    bagCost: (session.bagCost || 40) * 40,
    totalCost: 0,
    grossMargin: 0
  };

  // High input
  high = {
    bags: 75,
    pricePerBag,
    grossOutput: 75 * pricePerBag,
    seedCost: session.seedCost || 5625,
    fertilizerCost: (dapCost * 4) + (canCost * 3),
    labourCost: (session.ploughingCost || 7000) + 5000 + 2000 + (session.plantingLabourCost || 2000) + (session.weedingCost || 4500) + 2000 + (session.harvestingCost || 3000) + 3750 + 3000,
    transportCost: (session.transportCostPerBag || 50) * 75,
    bagCost: (session.bagCost || 40) * 75,
    totalCost: 0,
    grossMargin: 0
  };

  [low, medium, high].forEach(level => {
    level.totalCost = level.seedCost + level.fertilizerCost + level.labourCost + level.transportCost + level.bagCost;
    level.grossMargin = level.grossOutput - level.totalCost;
    level.costPerBag = Math.round(level.totalCost / level.bags);
  });

  return {
    crop,
    low,
    medium,
    high,
    farmerLevel: session.managementLevel || "Medium input",
    recommendation: getFinancialRecommendation(session.managementLevel, low, medium, high)
  };
}

// 🌾 Generate financial recommendation
function getFinancialRecommendation(level: string, low: any, medium: any, high: any): string {
  if (level?.toLowerCase().includes('low')) {
    return `Based on your low-input farming, you're currently earning ${formatCurrency(low.grossMargin)} per hectare. By adopting medium-input practices, you could increase your profit to ${formatCurrency(medium.grossMargin)}.`;
  } else if (level?.toLowerCase().includes('high')) {
    return `Excellent! Your high-input farming is generating ${formatCurrency(high.grossMargin)} per hectare.`;
  } else {
    return `At your current medium-input level, you're earning ${formatCurrency(medium.grossMargin)} per hectare. Upgrading to high-input practices could increase profit to ${formatCurrency(high.grossMargin)}.`;
  }
}

// 🌾 ENHANCED: Generate farmer session summary with soil test analysis
export async function generateFarmerSessionSummary(params: {
  sessionId: string;
  userId: string;
  messages: any[];
}) {
  const { sessionId, userId, messages } = params;

  try {
    const session = await CacheManager.getOrSet(
      `session:${sessionId}`,
      async () => {
        const sessionDoc = await db.collection("farmer_sessions").doc(sessionId).get();
        return sessionDoc.data() || null;
      },
      3600
    );

    if (!session) {
      throw new Error("Session not found");
    }

    const qaPairs = buildFarmerQaHistory(messages);
    const financialPairs = qaPairs.filter(p => p.isFinancial);
    const soilTestPairs = qaPairs.filter(p => p.isSoilTest);

    if (qaPairs.length === 0) {
      return {
        success: false,
        error: "No Q&A history found"
      };
    }

    const topics = qaPairs.map(p => p.question).join(' ');
    const relevantKnowledge = await hybridSearch(topics, {
      cropType: session?.crops || [],
      region: session?.county
    });

    const grossMargin = calculateGrossMargin(session);

    // Process soil test data if available
    let soilTestSummary = null;
    if (session.soilTest) {
      const ageStatus = soilTestInterpreter.getTestAgeStatus(session.soilTest.testAge || 0);
      soilTestSummary = {
        ...session.soilTest,
        ageStatus
      };
    }

    let summary = null;
    let source = "fallback";

    if (genAI) {
      try {
        const formattedHistory = qaPairs
          .map((pair, index) => `Q${index + 1}: ${pair.question}\nA${index + 1}: ${pair.answer}\n`)
          .join("");

        const knowledgeContext = relevantKnowledge
          .map(k => k.content)
          .join('\n\n');

        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

        const financialContext = grossMargin ? `
GROSS MARGIN ANALYSIS:
- Low input: ${formatCurrency(grossMargin.low.grossMargin)}
- Medium input: ${formatCurrency(grossMargin.medium.grossMargin)}
- High input: ${formatCurrency(grossMargin.high.grossMargin)}
- Farmer's current level: ${session.managementLevel || "Medium input"}
` : "";

        const soilContext = soilTestSummary ? `
SOIL TEST SUMMARY:
- Date: ${soilTestSummary.testDate}
- Status: ${soilTestSummary.ageStatus?.message}
- pH: ${soilTestSummary.ph} (${soilTestSummary.phRating})
- Phosphorus: ${soilTestSummary.phosphorus} ppm (${soilTestSummary.phosphorusRating})
- Potassium: ${soilTestSummary.potassium} ppm (${soilTestSummary.potassiumRating})
- Organic Matter: ${soilTestSummary.organicMatter}% (${soilTestSummary.organicMatterRating})
` : "";

        const prompt = `
You are an agricultural extension officer. Based on this farmer's Q&A session, provide a comprehensive summary.

FARMER DETAILS:
- Name: ${session.farmerName || "Not specified"}
- Crops: ${session?.crops?.join(", ") || "Not specified"}
- Location: ${session?.county || "Not specified"}
- Farm size: ${session?.cultivatedAcres || session?.acres || "Not specified"} acres
- Management level: ${session?.managementLevel || "Not specified"}

${soilContext}
${financialContext}

SESSION HISTORY (${qaPairs.length} questions):
${formattedHistory}

RETRIEVED KNOWLEDGE:
${knowledgeContext || "No specific knowledge retrieved."}

INSTRUCTIONS:
1. Summarize what the farmer learned in 3-4 sentences
2. Provide 3 follow-up recommendations
3. Include financial advice based on their questions
4. If soil test data exists, highlight key findings

Return as JSON:
{
  "summary": "string",
  "recommendations": ["string", "string", "string"],
  "financialAdvice": "string",
  "soilTestAdvice": "string",
  "topics": ["string"],
  "nextSteps": "string"
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = cleanGeminiJson(response?.text());

        try {
          summary = JSON.parse(text);
          source = "gemini-rag";
        } catch (parseError) {
          console.error("❌ Failed to parse Gemini response:", parseError);
        }
      } catch (geminiError) {
        console.log("⚠️ Gemini failed, using fallback summary");
      }
    }

    if (!summary) {
      summary = {
        summary: `You asked ${qaPairs.length} questions about your farm.`,
        recommendations: [
          `Learn more about pest management for your crops`,
          `Ask about optimal planting times for your location`,
          `Explore soil testing options in your area`
        ],
        financialAdvice: grossMargin?.recommendation || "Track your input costs and yields.",
        soilTestAdvice: soilTestSummary ? `Your soil test from ${soilTestSummary.testDate} shows ${soilTestSummary.phRating} pH and ${soilTestSummary.phosphorusRating} phosphorus.` : "Consider doing a soil test for precise fertilizer recommendations.",
        topics: session?.crops || ["general farming"],
        nextSteps: "Continue asking questions about your specific crops."
      };
    }

    const summaryRef = db.collection("farmer_sessions").doc(sessionId).collection("summaries").doc();
    await summaryRef.set({
      id: summaryRef.id,
      sessionId,
      userId,
      summary: summary.summary,
      recommendations: summary.recommendations,
      financialAdvice: summary.financialAdvice || null,
      soilTestAdvice: summary.soilTestAdvice || null,
      topics: summary.topics,
      nextSteps: summary.nextSteps,
      questionCount: qaPairs.length,
      createdAt: new Date().toISOString(),
      source
    });

    return {
      success: true,
      summaryId: summaryRef.id,
      ...summary
    };

  } catch (error: any) {
    console.error("❌ Error generating farmer summary:", error);
    return { success: false, error: error.message };
  }
}

// 🌾 ENHANCED: Get farmer session by ID with caching
export async function getFarmerSessionById(id: string): Promise<any> {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error("Invalid session ID provided:", id);
    return null;
  }

  try {
    const session = await CacheManager.getOrSet(
      `session:${id}`,
      async () => {
        const sessionDoc = await db.collection("farmer_sessions").doc(id).get();
        const data = sessionDoc.data();

        if (data && data.crops && data.crops.length > 0) {
          data.grossMarginAnalysis = calculateGrossMargin(data);
        }

        return data || null;
      },
      3600
    );

    return session;
  } catch (error) {
    console.error("Error fetching farmer session:", error);
    return null;
  }
}

// 🌾 ENHANCED: Get farmer sessions by user ID
export async function getFarmerSessionsByUserId(userId: string): Promise<any[]> {
  if (!userId) {
    console.log("No userId provided, returning empty array");
    return [];
  }

  try {
    return await CacheManager.getOrSet(
      `user-sessions:${userId}`,
      async () => {
        const sessions = await db
          .collection("farmer_sessions")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .get();

        return sessions.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      },
      1800
    );
  } catch (error) {
    console.error("Error fetching farmer sessions:", error);
    return [];
  }
}

// 🌾 ENHANCED: Get session summary
export async function getSessionSummary(params: {
  sessionId: string;
  userId: string;
}): Promise<any> {
  const { sessionId, userId } = params;

  if (!userId || !sessionId) {
    return null;
  }

  try {
    return await CacheManager.getOrSet(
      `summary:${sessionId}`,
      async () => {
        const summaries = await db
          .collection("farmer_sessions")
          .doc(sessionId)
          .collection("summaries")
          .orderBy("createdAt", "desc")
          .limit(1)
          .get();

        if (summaries.empty) return null;

        const summaryDoc = summaries.docs[0];
        return { id: summaryDoc.id, ...summaryDoc.data() };
      },
      86400
    );
  } catch (error) {
    console.error("Error fetching session summary:", error);
    return null;
  }
}

// 🌾 ENHANCED: Save farmer query
export async function saveFarmerQuery(params: {
  sessionId: string;
  userId: string;
  question: string;
  answer: string;
  images?: any[];
  ragUsed?: boolean;
  chunksUsed?: number;
  isFinancial?: boolean;
  isSoilTest?: boolean;
}) {
  const { sessionId, userId, question, answer, images, ragUsed, chunksUsed, isFinancial, isSoilTest } = params;

  try {
    const queryRef = db.collection("farmer_sessions").doc(sessionId).collection("queries").doc();

    await queryRef.set({
      id: queryRef.id,
      sessionId,
      userId,
      question,
      answer,
      images: images || [],
      ragUsed: ragUsed || false,
      chunksUsed: chunksUsed || 0,
      isFinancial: isFinancial || false,
      isSoilTest: isSoilTest || false,
      timestamp: new Date().toISOString()
    });

    await db.collection("farmer_sessions").doc(sessionId).update({
      queryCount: FieldValue.increment(1),
      financialQueryCount: isFinancial ? FieldValue.increment(1) : FieldValue.increment(0),
      soilTestQueryCount: isSoilTest ? FieldValue.increment(1) : FieldValue.increment(0),
      lastQueryAt: new Date().toISOString()
    });

    await CacheManager.invalidate(`session:${sessionId}`);

    return { success: true, queryId: queryRef.id };
  } catch (error) {
    console.error("Error saving farmer query:", error);
    return { success: false, error };
  }
}

// 🌾 NEW: Get fertilizer recommendations from soil test
export async function getFertilizerRecommendations(params: {
  sessionId: string;
  userId: string;
}) {
  try {
    const session = await getFarmerSessionById(params.sessionId);
    if (!session || !session.soilTest) {
      return { success: false, error: "No soil test data found" };
    }

    return {
      success: true,
      soilTest: session.soilTest,
      fertilizerRecommendations: session.soilTest.fertilizerRecommendations
    };
  } catch (error: any) {
    console.error("Error getting fertilizer recommendations:", error);
    return { success: false, error: error.message };
  }
}

// 🌾 Keep existing functions
export async function getInterviewById(id: string): Promise<any> {
  console.warn("⚠️ getInterviewById is deprecated. Use getFarmerSessionById instead.");
  if (!id) return null;
  try {
    const interview = await db.collection("interviews").doc(id).get();
    return interview.data() || null;
  } catch (error) {
    return null;
  }
}

export async function getInterviewsByUserId(userId: string): Promise<any[]> {
  console.warn("⚠️ getInterviewsByUserId is deprecated. Use getFarmerSessionsByUserId instead.");
  if (!userId) return [];
  try {
    const interviews = await db.collection("interviews").where("userId", "==", userId).orderBy("createdAt", "desc").get();
    return interviews.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return [];
  }
}

export async function getFeedbackByInterviewId(params: {
  interviewId: string;
  userId: string;
}): Promise<any> {
  console.log("📝 getFeedbackByInterviewId called (returning null)");
  return null;
}

export async function createFeedback(params: any): Promise<any> {
  return { success: false, error: "Feedback creation is deprecated. Use generateFarmerSessionSummary instead." };
}

export async function getLatestInterviews(params: any): Promise<any[]> {
  return [];
}