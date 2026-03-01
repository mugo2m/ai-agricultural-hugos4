// app/api/farmer/query/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/firebase/admin";
import { hybridSearch } from "@/lib/rag/hybridSearch";
import { AnswerCache } from "@/lib/rag/cacheManager";
import { generateEmbedding } from "@/lib/rag/embeddings";
import { FieldValue } from "firebase-admin/firestore";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

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

    // 🔍 RAG ENHANCEMENT: Check cache first
    const cacheKey = { question, sessionId, userId };
    const cachedAnswer = await AnswerCache.get(question, {
      crops: sessionData?.crops,
      county: sessionData?.county
    });

    if (cachedAnswer) {
      console.log("🎯 Answer cache HIT");
      return NextResponse.json({
        success: true,
        answer: cachedAnswer,
        cached: true
      });
    }

    // 🔍 RAG ENHANCEMENT: Retrieve relevant knowledge
    const relevantKnowledge = await hybridSearch(question, {
      cropType: sessionData?.crops || [],
      region: sessionData?.county,
      category: detectQuestionCategory(question)
    }, {
      crops: sessionData?.crops || [],
      county: sessionData?.county
    });

    console.log(`📚 Retrieved ${relevantKnowledge.length} relevant knowledge chunks`);

    // Build context from retrieved knowledge
    const knowledgeContext = relevantKnowledge
      .map(k => `[Relevance: ${(k.similarity * 100).toFixed(1)}%]\n${k.content}`)
      .join('\n\n---\n\n');

    // Generate answer using Gemini with RAG context
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an agricultural expert assistant for farmers in East Africa.

FARMER CONTEXT:
- Crops: ${sessionData?.crops?.join(", ") || "Not specified"}
- Location: ${sessionData?.county || "Not specified"}
- Farm size: ${sessionData?.acres || "Not specified"} acres
- Has cattle: ${sessionData?.cattle > 0 ? "Yes" : "No"}

RETRIEVED KNOWLEDGE (use this to answer the question):
${knowledgeContext || "No specific knowledge retrieved. Use your general expertise."}

QUESTION: ${question}

INSTRUCTIONS:
1. Base your answer on the RETRIEVED KNOWLEDGE when possible
2. Provide practical, actionable advice
3. Keep answers clear and simple for farmers
4. Mention specific crops if relevant
5. If you don't know, say you don't have that information
6. Include local practices where applicable
7. Keep answers concise but helpful

ANSWER:
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    // Save to Firestore
    try {
      const queryRef = db.collection("farmer_sessions").doc(sessionId).collection("queries").doc();
      await queryRef.set({
        id: queryRef.id,
        sessionId,
        userId,
        question,
        answer,
        ragContext: {
          chunksUsed: relevantKnowledge.length,
          topSimilarity: relevantKnowledge[0]?.similarity || 0
        },
        timestamp: new Date().toISOString()
      });

      // Update query count
      await db.collection("farmer_sessions").doc(sessionId).update({
        queryCount: FieldValue.increment(1),
        lastQueryAt: new Date().toISOString()
      });

    } catch (dbError) {
      console.error("Error saving to Firestore:", dbError);
    }

    // Cache the answer
    await AnswerCache.set(question, {
      crops: sessionData?.crops,
      county: sessionData?.county
    }, answer);

    return NextResponse.json({
      success: true,
      answer,
      ragUsed: relevantKnowledge.length > 0,
      chunksUsed: relevantKnowledge.length
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

  if (q.includes('pest') || q.includes('insect') || q.includes('worm') || q.includes('disease')) {
    return 'pest_control';
  }
  if (q.includes('fertilizer') || q.includes('manure') || q.includes('npk') || q.includes('dap')) {
    return 'soil_health';
  }
  if (q.includes('water') || q.includes('irrigation') || q.includes('rain')) {
    return 'water_management';
  }
  if (q.includes('plant') || q.includes('sow') || q.includes('seed')) {
    return 'planting';
  }
  if (q.includes('harvest') || q.includes('yield') || q.includes('bag')) {
    return 'harvesting';
  }
  if (q.includes('market') || q.includes('sell') || q.includes('price')) {
    return 'market';
  }

  return 'general';
}