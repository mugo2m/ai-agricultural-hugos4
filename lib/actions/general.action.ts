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
import { calculateRankedCropProfits } from "@/lib/utils/cropCalculations";
import { COUNTRY_CURRENCY_MAP } from "@/lib/config/currency";

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
  const pairs: { question: string; answer: string; isFinancial?: boolean; isSoilTest?: boolean; isDamage?: boolean }[] = [];

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

        const isDamage =
          question.toLowerCase().includes('damaged') ||
          question.toLowerCase().includes('plants lost') ||
          question.toLowerCase().includes('beyond recovery');

        pairs.push({
          question: question,
          answer: messages[i + 1].content,
          isFinancial,
          isSoilTest,
          isDamage
        });
        i++;
      }
    }
  }

  console.log(`🌾 Built ${pairs.length} Q&A pairs from farmer session (${pairs.filter(p => p.isFinancial).length} financial, ${pairs.filter(p => p.isSoilTest).length} soil test, ${pairs.filter(p => p.isDamage).length} damage reports)`);
  return pairs;
}

// 🌾 Format currency helper - Uses the country from session data
function formatCurrencyForCountry(amount: number, country: string = 'kenya'): string {
  const currency = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP.kenya;

  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces
  }).format(amount);
}

// 🌾 Format currency for speech
function formatCurrencyForSpeech(amount: number, country: string = 'kenya'): string {
  const currency = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP.kenya;
  return `${currency.name} ${amount.toLocaleString()}`;
}

// 🌾 Calculate gross margin based on Bungoma Farm Management Guidelines (FALLBACK ONLY)
function calculateGrossMargin(session: any) {
  if (!session) return null;

  const crop = session.crops?.[0] || 'maize';
  const lowerCrop = crop.toLowerCase();
  const country = session.country || 'kenya';

  // Default values from Bungoma guidelines
  const defaults: Record<string, any> = {
    maize: {
      low: { bags: 10, pricePerBag: 6750, seedCost: 5625, fertilizerCost: 0, labourCost: 13300, transportCost: 500, bagCost: 400 },
      medium: { bags: 40, pricePerBag: 6750, seedCost: 5625, fertilizerCost: 13250, labourCost: 24200, transportCost: 2000, bagCost: 1600 },
      high: { bags: 75, pricePerBag: 6750, seedCost: 5625, fertilizerCost: 20700, labourCost: 33650, transportCost: 3750, bagCost: 3000 }
    },
    beans: {
      low: { bags: 5, pricePerBag: 10350, seedCost: 3000, fertilizerCost: 0, labourCost: 5200, transportCost: 500, bagCost: 200 },
      medium: { bags: 10, pricePerBag: 10350, seedCost: 3000, fertilizerCost: 3300, labourCost: 5200, transportCost: 1000, bagCost: 400 },
      high: { bags: 15, pricePerBag: 10350, seedCost: 3000, fertilizerCost: 4950, labourCost: 5200, transportCost: 1500, bagCost: 600 }
    }
  };

  const data = defaults[lowerCrop] || defaults.maize;
  const pricePerBag = session.maizePrice || session.beansPrice || 6750;

  let low, medium, high;

  // Low input
  low = {
    bags: data.low.bags,
    pricePerBag,
    grossOutput: data.low.bags * pricePerBag,
    seedCost: data.low.seedCost,
    fertilizerCost: data.low.fertilizerCost,
    labourCost: data.low.labourCost,
    transportCost: data.low.transportCost,
    bagCost: data.low.bagCost,
    totalCost: 0,
    grossMargin: 0
  };

  // Medium input
  medium = {
    bags: data.medium.bags,
    pricePerBag,
    grossOutput: data.medium.bags * pricePerBag,
    seedCost: data.medium.seedCost,
    fertilizerCost: data.medium.fertilizerCost,
    labourCost: data.medium.labourCost,
    transportCost: data.medium.transportCost,
    bagCost: data.medium.bagCost,
    totalCost: 0,
    grossMargin: 0
  };

  // High input
  high = {
    bags: data.high.bags,
    pricePerBag,
    grossOutput: data.high.bags * pricePerBag,
    seedCost: data.high.seedCost,
    fertilizerCost: data.high.fertilizerCost,
    labourCost: data.high.labourCost,
    transportCost: data.high.transportCost,
    bagCost: data.high.bagCost,
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
    recommendation: getFinancialRecommendation(session.managementLevel, low, medium, high, country)
  };
}

// 🌾 Generate financial recommendation
function getFinancialRecommendation(level: string, low: any, medium: any, high: any, country: string = 'kenya'): string {
  if (level?.toLowerCase().includes('low')) {
    return `Based on your low-input farming, you're currently earning ${formatCurrencyForCountry(low.grossMargin, country)} per hectare. By adopting medium-input practices, you could increase your profit to ${formatCurrencyForCountry(medium.grossMargin, country)}. Remember: Every Ksh 1 invested returns Ksh 3-5 profit!`;
  } else if (level?.toLowerCase().includes('high')) {
    return `Excellent! Your high-input farming is generating ${formatCurrencyForCountry(high.grossMargin, country)} per hectare. You're maximizing your profits!`;
  } else {
    return `At your current medium-input level, you're earning ${formatCurrencyForCountry(medium.grossMargin, country)} per hectare. Upgrading to high-input practices could increase profit to ${formatCurrencyForCountry(high.grossMargin, country)}. Farming is still in exponential phase - more inputs = more profits!`;
  }
}

// 🌾 ENHANCED: Generate farmer session summary
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

    const country = session.country || 'kenya';
    const qaPairs = buildFarmerQaHistory(messages);
    const financialPairs = qaPairs.filter(p => p.isFinancial);
    const soilTestPairs = qaPairs.filter(p => p.isSoilTest);
    const damageReports = qaPairs.filter(p => p.isDamage);

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
GROSS MARGIN ANALYSIS (Bungoma Guidelines):
- Low input: ${formatCurrencyForCountry(grossMargin.low.grossMargin, country)}
- Medium input: ${formatCurrencyForCountry(grossMargin.medium.grossMargin, country)}
- High input: ${formatCurrencyForCountry(grossMargin.high.grossMargin, country)}
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
- Planting Nutrients: ${soilTestSummary.plantingNutrients ? JSON.stringify(soilTestSummary.plantingNutrients) : 'Not specified'}
- Topdressing Nutrients: ${soilTestSummary.topdressingNutrients ? JSON.stringify(soilTestSummary.topdressingNutrients) : 'Not specified'}
- Potassium Nutrients: ${soilTestSummary.potassiumNutrients ? JSON.stringify(soilTestSummary.potassiumNutrients) : 'Not specified'}
` : "";

        const damageContext = session.plantsDamaged ? `
DAMAGE REPORT:
- Plants damaged beyond recovery: ${session.plantsDamaged} plants
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
${damageContext}
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
5. If damage reports exist, acknowledge them and provide recovery advice
6. Emphasize farming as a BUSINESS - every input should maximize profit

Return as JSON:
{
  "summary": "string",
  "recommendations": ["string", "string", "string"],
  "financialAdvice": "string",
  "soilTestAdvice": "string",
  "damageAdvice": "string",
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
        summary: `You asked ${qaPairs.length} questions about your farm. Based on Bungoma Farm Management Guidelines, focus on optimizing your inputs for maximum profit.`,
        recommendations: [
          `Learn more about pest management for your crops using integrated methods`,
          `Ask about optimal planting times for your location`,
          `Explore soil testing options in your area for precision fertilizer recommendations`
        ],
        financialAdvice: grossMargin?.recommendation || "Track all input costs (seeds, fertilizer, labour) to calculate your actual profit margins. Farming is a BUSINESS!",
        soilTestAdvice: soilTestSummary ? `Your soil test from ${soilTestSummary.testDate} shows ${soilTestSummary.phRating} pH and ${soilTestSummary.phosphorusRating} phosphorus.` : "Consider doing a soil test for precise fertilizer recommendations - it can save you up to 30% on fertilizer costs!",
        damageAdvice: session.plantsDamaged ? `You reported ${session.plantsDamaged} plants damaged beyond recovery. Consider reviewing your pest and disease management strategies.` : "",
        topics: session?.crops || ["general farming"],
        nextSteps: "Continue asking questions about your specific crops to maximize profitability."
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
      damageAdvice: summary.damageAdvice || null,
      topics: summary.topics,
      nextSteps: summary.nextSteps,
      questionCount: qaPairs.length,
      financialQuestionCount: financialPairs.length,
      soilTestQuestionCount: soilTestPairs.length,
      damageReportCount: damageReports.length,
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

// 🌾 UPDATED: Get farmer session by ID with language support
export async function getFarmerSessionById(id: string, language: string = 'en'): Promise<any> {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error("Invalid session ID provided:", id);
    return null;
  }

  try {
    const session = await CacheManager.getOrSet(
      `session:${id}:lang:${language}`,
      async () => {
        const sessionDoc = await db.collection("farmer_sessions").doc(id).get();
        const data = sessionDoc.data();

        // ✅ IMPORTANT: Don't overwrite existing grossMarginAnalysis
        // Only add Bungoma defaults if grossMarginAnalysis is missing AND it's an old session
        if (data && !data.grossMarginAnalysis && data.crops && data.crops.length > 0) {
          console.log("📊 Adding Bungoma default gross margin for old session (no real data)");
          data.grossMarginAnalysis = calculateGrossMargin(data);
        } else if (data && data.grossMarginAnalysis) {
          console.log("✅ Using existing gross margin data from farmer's actual inputs");
        }

        // Add language to the session data for use in the frontend
        if (data) {
          data.language = language;
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

// 🌾 ENHANCED: Get farmer sessions by user ID - Handles both string and timestamp dates
export async function getFarmerSessionsByUserId(userId: string): Promise<any[]> {
  if (!userId) {
    console.log("No userId provided, returning empty array");
    return [];
  }

  console.log(`🔍 [DEBUG] Fetching sessions for userId: ${userId}`);

  try {
    // First, get all sessions without orderBy to see what's in the database
    const sessionsWithoutOrder = await db
      .collection("farmer_sessions")
      .where("userId", "==", userId)
      .get();

    console.log(`🔍 [DEBUG] Total sessions found in DB: ${sessionsWithoutOrder.size}`);

    // Log all sessions found
    sessionsWithoutOrder.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`🔍 [DEBUG] Session ${index + 1}:`, {
        id: doc.id,
        crops: data.crops,
        farmerName: data.farmerName,
        createdAt: data.createdAt,
        createdAtType: typeof data.createdAt,
        userId: data.userId
      });
    });

    // Convert all sessions to array and sort manually to handle mixed date types
    let allSessions = sessionsWithoutOrder.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Manual sorting to handle both string and timestamp dates
    allSessions.sort((a, b) => {
      let dateA: Date;
      let dateB: Date;

      // Convert a.createdAt to Date
      if (a.createdAt) {
        if (a.createdAt.toDate && typeof a.createdAt.toDate === 'function') {
          // Firestore Timestamp
          dateA = a.createdAt.toDate();
        } else if (typeof a.createdAt === 'string') {
          // String date
          dateA = new Date(a.createdAt);
        } else {
          dateA = new Date(0); // fallback
        }
      } else {
        dateA = new Date(0);
      }

      // Convert b.createdAt to Date
      if (b.createdAt) {
        if (b.createdAt.toDate && typeof b.createdAt.toDate === 'function') {
          dateB = b.createdAt.toDate();
        } else if (typeof b.createdAt === 'string') {
          dateB = new Date(b.createdAt);
        } else {
          dateB = new Date(0);
        }
      } else {
        dateB = new Date(0);
      }

      return dateB.getTime() - dateA.getTime(); // descending order
    });

    console.log(`🔍 [DEBUG] After manual sort: ${allSessions.length} sessions`);
    allSessions.forEach((session, index) => {
      console.log(`🔍 [DEBUG] Sorted session ${index + 1}:`, {
        id: session.id,
        crops: session.crops,
        farmerName: session.farmerName,
        createdAt: session.createdAt
      });
    });

    // Cache the sorted results
    return await CacheManager.getOrSet(
      `user-sessions:${userId}`,
      async () => {
        console.log(`🔍 [DEBUG] Cache miss - returning ${allSessions.length} sessions`);
        return allSessions;
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
  isDamage?: boolean;
}) {
  const { sessionId, userId, question, answer, images, ragUsed, chunksUsed, isFinancial, isSoilTest, isDamage } = params;

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
      isDamage: isDamage || false,
      timestamp: new Date().toISOString()
    });

    await db.collection("farmer_sessions").doc(sessionId).update({
      queryCount: FieldValue.increment(1),
      financialQueryCount: isFinancial ? FieldValue.increment(1) : FieldValue.increment(0),
      soilTestQueryCount: isSoilTest ? FieldValue.increment(1) : FieldValue.increment(0),
      damageReportCount: isDamage ? FieldValue.increment(1) : FieldValue.increment(0),
      lastQueryAt: new Date().toISOString()
    });

    await CacheManager.invalidate(`session:${sessionId}`);

    return { success: true, queryId: queryRef.id };
  } catch (error) {
    console.error("Error saving farmer query:", error);
    return { success: false, error };
  }
}

// 🌾 Get fertilizer recommendations from soil test
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

// Keep existing functions for backward compatibility
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