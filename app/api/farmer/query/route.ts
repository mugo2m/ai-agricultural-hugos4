// app/api/farmer/query/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/firebase/admin";
import { hybridSearch } from "@/lib/rag/hybridSearch";
import { AnswerCache } from "@/lib/rag/cacheManager";
import { generateEmbedding } from "@/lib/rag/embeddings";
import { FieldValue } from "firebase-admin/firestore";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

// Helper function to detect financial questions
function detectFinancialQuestion(question: string): boolean {
  const q = question.toLowerCase();
  const financialKeywords = [
    'cost', 'price', 'profit', 'margin', 'revenue', 'income', 'expense',
    'budget', 'investment', 'kes', 'ksh', 'shilling', 'money', 'earn',
    'gross', 'net', 'break-even', 'roi', 'return', 'profitable',
    'expenditure', 'spend', 'spending', 'save', 'saving', 'cheap',
    'expensive', 'afford', 'affordable', 'valuation', 'worth', 'value',
    'financial', 'finance', 'economic', 'economy', 'market price',
    'selling price', 'buying price', 'cost per', 'price per'
  ];

  return financialKeywords.some(keyword => q.includes(keyword));
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Helper function to calculate gross margin based on farmer data
function getGrossMarginContext(sessionData: any): string {
  if (!sessionData) return "";

  const crop = sessionData.crops?.[0] || 'maize';
  const pricePerBag = sessionData.maizePrice || sessionData.beansPrice || 6750;
  const dapCost = sessionData.dapCost || 3300;
  const canCost = sessionData.canCost || 2500;
  const labourRate = sessionData.dailyWageRate || 200;

  // Default values based on Bungoma County document
  const lowMargin = {
    bags: 10,
    revenue: 10 * pricePerBag,
    costs: (sessionData.seedCost || 5625) + 0 +
           (sessionData.ploughingCost || 7000) + (sessionData.plantingLabourCost || 2000) +
           (sessionData.weedingCost || 2500) + (sessionData.harvestingCost || 500) +
           ((sessionData.transportCostPerBag || 50) * 10) + ((sessionData.bagCost || 40) * 10)
  };

  const mediumMargin = {
    bags: 40,
    revenue: 40 * pricePerBag,
    costs: (sessionData.seedCost || 5625) + (dapCost * 2.5) + (canCost * 2) +
           (sessionData.ploughingCost || 7000) + 5000 + (sessionData.plantingLabourCost || 2000) +
           (sessionData.weedingCost || 4500) + (sessionData.harvestingCost || 1500) + 1000 +
           ((sessionData.transportCostPerBag || 50) * 40) + ((sessionData.bagCost || 40) * 40)
  };

  const highMargin = {
    bags: 75,
    revenue: 75 * pricePerBag,
    costs: (sessionData.seedCost || 5625) + (dapCost * 4) + (canCost * 3) +
           (sessionData.ploughingCost || 7000) + 5000 + 2000 + (sessionData.plantingLabourCost || 2000) +
           (sessionData.weedingCost || 4500) + 2000 + (sessionData.harvestingCost || 3000) + 3750 + 3000 +
           ((sessionData.transportCostPerBag || 50) * 75) + ((sessionData.bagCost || 40) * 75)
  };

  lowMargin.profit = lowMargin.revenue - lowMargin.costs;
  mediumMargin.profit = mediumMargin.revenue - mediumMargin.costs;
  highMargin.profit = highMargin.revenue - highMargin.costs;

  return `
GROSS MARGIN REFERENCE (per hectare):
- Low input (${lowMargin.bags} bags): Revenue ${formatCurrency(lowMargin.revenue)}, Costs ${formatCurrency(lowMargin.costs)}, Profit ${formatCurrency(lowMargin.profit)}
- Medium input (${mediumMargin.bags} bags): Revenue ${formatCurrency(mediumMargin.revenue)}, Costs ${formatCurrency(mediumMargin.costs)}, Profit ${formatCurrency(mediumMargin.profit)}
- High input (${highMargin.bags} bags): Revenue ${formatCurrency(highMargin.revenue)}, Costs ${formatCurrency(highMargin.costs)}, Profit ${formatCurrency(highMargin.profit)}
- Your current management level: ${sessionData.managementLevel || "Medium input"}
`;
}

export async function POST(request: NextRequest) {
  try {
    const { question, userId, sessionId, sessionData } = await request.json();

    if (!question || !userId || !sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`🌾 Farmer query: "${question}"`);

    // Detect if this is a financial question
    const isFinancial = detectFinancialQuestion(question);
    if (isFinancial) {
      console.log(`💰 Financial question detected`);
    }

    // 🔍 RAG ENHANCEMENT: Check cache first
    const cachedAnswer = await AnswerCache.get(question, {
      crops: sessionData?.crops,
      county: sessionData?.county,
      isFinancial
    });

    if (cachedAnswer) {
      console.log("🎯 Answer cache HIT");
      return NextResponse.json({
        success: true,
        answer: cachedAnswer,
        cached: true,
        isFinancial
      });
    }

    // 🔍 RAG ENHANCEMENT: Retrieve relevant knowledge with enhanced context
    const relevantKnowledge = await hybridSearch(question, {
      cropType: sessionData?.crops || [],
      region: sessionData?.county,
      category: isFinancial ? 'financial' : detectQuestionCategory(question)
    }, {
      crops: sessionData?.crops || [],
      county: sessionData?.county
    });

    console.log(`📚 Retrieved ${relevantKnowledge.length} relevant knowledge chunks`);

    // Build context from retrieved knowledge
    const knowledgeContext = relevantKnowledge
      .map(k => `[Relevance: ${(k.similarity * 100).toFixed(1)}%]\n${k.content}`)
      .join('\n\n---\n\n');

    // Get gross margin context for financial questions
    const grossMarginContext = isFinancial ? getGrossMarginContext(sessionData) : "";

    // Generate answer using Gemini with enhanced RAG context
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

    const prompt = `
You are an agricultural expert assistant and financial advisor for farmers in East Africa.

FARMER CONTEXT:
- Name: ${sessionData?.farmerName || "Farmer"}
- Crops: ${sessionData?.crops?.join(", ") || "Not specified"}
- Location: ${sessionData?.county || "Not specified"}${sessionData?.subCounty ? `, ${sessionData.subCounty}` : ""}
- Farm size: ${sessionData?.cultivatedAcres || sessionData?.acres || "Not specified"} acres
- Soil type: ${sessionData?.soilType || "Not specified"}
- Has cattle: ${sessionData?.cattle > 0 ? `Yes (${sessionData.cattle} head)` : "No"}
- Management level: ${sessionData?.managementLevel || "Medium input"}
- Experience: ${sessionData?.experience || "Not specified"} years

FINANCIAL CONTEXT:
${sessionData?.inputCosts ? `
- DAP fertilizer: ${formatCurrency(sessionData.dapCost || 3300)}/50kg bag
- CAN fertilizer: ${formatCurrency(sessionData.canCost || 2500)}/50kg bag
- Labour rate: ${formatCurrency(sessionData.dailyWageRate || 200)}/day
- Maize price: ${formatCurrency(sessionData.maizePrice || 6750)}/90kg bag
- Beans price: ${formatCurrency(sessionData.beansPrice || 10350)}/90kg bag
` : "No specific financial data provided."}

${grossMarginContext}

RETRIEVED KNOWLEDGE:
${knowledgeContext || "No specific knowledge retrieved. Use your general expertise."}

QUESTION TYPE: ${isFinancial ? "💰 FINANCIAL QUESTION" : "🌾 GENERAL FARMING QUESTION"}
QUESTION: ${question}

INSTRUCTIONS:
1. Base your answer on the RETRIEVED KNOWLEDGE when possible
2. Provide practical, actionable advice tailored to East African farmers
3. Keep answers clear and simple
4. Mention specific crops if relevant
5. If you don't know, say you don't have that information
6. Include local practices where applicable
7. ${isFinancial ? "For financial questions, include specific cost estimates, potential profits, and break-even analysis where relevant. Use KES currency." : "For general questions, focus on agronomic best practices."}
8. If the farmer's management level is known, tailor advice accordingly
9. Consider their location and soil type when relevant
10. Provide specific numbers (kg, acres, KES) rather than vague advice

ANSWER:
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    // Save to Firestore with enhanced metadata
    try {
      const queryRef = db.collection("farmer_sessions").doc(sessionId).collection("queries").doc();
      await queryRef.set({
        id: queryRef.id,
        sessionId,
        userId,
        question,
        answer,
        isFinancial,
        ragContext: {
          chunksUsed: relevantKnowledge.length,
          topSimilarity: relevantKnowledge[0]?.similarity || 0,
          categories: [detectQuestionCategory(question)]
        },
        financialContext: isFinancial ? {
          grossMarginReferenced: grossMarginContext ? true : false,
          // Could add more financial metadata here
        } : null,
        timestamp: new Date().toISOString()
      });

      // Update query counts in session
      const updateData: any = {
        lastQueryAt: new Date().toISOString()
      };

      // Use FieldValue for increments
      updateData.queryCount = FieldValue.increment(1);
      if (isFinancial) {
        updateData.financialQueryCount = FieldValue.increment(1);
      }

      await db.collection("farmer_sessions").doc(sessionId).update(updateData);

    } catch (dbError) {
      console.error("Error saving to Firestore:", dbError);
    }

    // Cache the answer with financial flag
    await AnswerCache.set(question, {
      crops: sessionData?.crops,
      county: sessionData?.county,
      isFinancial
    }, answer);

    return NextResponse.json({
      success: true,
      answer,
      isFinancial,
      ragUsed: relevantKnowledge.length > 0,
      chunksUsed: relevantKnowledge.length,
      categories: [detectQuestionCategory(question)]
    });

  } catch (error: any) {
    console.error("❌ Farmer query error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process question"
      },
      { status: 500 }
    );
  }
}

function detectQuestionCategory(question: string): string {
  const q = question.toLowerCase();

  // Financial categories
  if (q.includes('cost') || q.includes('price') || q.includes('profit') ||
      q.includes('margin') || q.includes('revenue') || q.includes('income') ||
      q.includes('kes') || q.includes('ksh')) {
    return 'financial';
  }

  // Pest/Disease
  if (q.includes('pest') || q.includes('insect') || q.includes('worm') ||
      q.includes('disease') || q.includes('bug') || q.includes('infest')) {
    return 'pest_control';
  }

  // Fertilizer/Soil
  if (q.includes('fertilizer') || q.includes('manure') || q.includes('npk') ||
      q.includes('dap') || q.includes('can') || q.includes('urea') ||
      q.includes('soil') || q.includes('compost')) {
    return 'soil_health';
  }

  // Water/Irrigation
  if (q.includes('water') || q.includes('irrigation') || q.includes('rain') ||
      q.includes('drought') || q.includes('moisture')) {
    return 'water_management';
  }

  // Planting
  if (q.includes('plant') || q.includes('sow') || q.includes('seed') ||
      q.includes('spacing') || q.includes('variety') || q.includes('nursery')) {
    return 'planting';
  }

  // Harvesting
  if (q.includes('harvest') || q.includes('yield') || q.includes('bag') ||
      q.includes('storage') || q.includes('store') || q.includes('post-harvest')) {
    return 'harvesting';
  }

  // Market
  if (q.includes('market') || q.includes('sell') || q.includes('buy') ||
      q.includes('price') || q.includes('customer') || q.includes('trader')) {
    return 'market';
  }

  // Livestock
  if (q.includes('cattle') || q.includes('cow') || q.includes('milk') ||
      q.includes('livestock') || q.includes('animal') || q.includes('veterinary')) {
    return 'livestock';
  }

  return 'general';
}

// Optional: Add a GET endpoint for API info
export async function GET() {
  return NextResponse.json({
    status: "operational",
    message: "🌾 Farmer Query API with Financial Analysis",
    features: [
      "RAG-enhanced answers with hybrid search",
      "Financial question detection",
      "Gross margin calculations",
      "Context-aware responses",
      "Multi-category routing"
    ],
    categories: [
      "financial",
      "pest_control",
      "soil_health",
      "water_management",
      "planting",
      "harvesting",
      "market",
      "livestock",
      "general"
    ]
  });
}