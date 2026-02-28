import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/firebase/admin";

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

    // Generate answer using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
You are an agricultural expert assistant for farmers in East Africa.

FARMER CONTEXT:
- Crops: ${sessionData?.crops?.join(", ") || "Not specified"}
- Location: ${sessionData?.county || "Not specified"}
- Farm size: ${sessionData?.acres || "Not specified"} acres
- Has cattle: ${sessionData?.cattle > 0 ? "Yes" : "No"}
- Previous recommendations: ${sessionData?.recommendations?.slice(0, 2).join("; ") || "None"}

QUESTION: ${question}

INSTRUCTIONS:
1. Provide practical, actionable advice
2. Keep answers clear and simple for farmers
3. Mention specific crops if relevant
4. If you don't know, say you don't have that information
5. Include local practices where applicable
6. Keep answers concise but helpful

ANSWER:
`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text();

    // Save to Firestore (optional)
    try {
      const queryRef = db.collection("farmer_sessions").doc(sessionId).collection("queries").doc();
      await queryRef.set({
        id: queryRef.id,
        sessionId,
        userId,
        question,
        answer,
        timestamp: new Date().toISOString()
      });
    } catch (dbError) {
      console.error("Error saving to Firestore:", dbError);
      // Continue even if save fails
    }

    // ✅ ALWAYS return success: true with answer
    return NextResponse.json({
      success: true,
      answer
    });

  } catch (error: any) {
    console.error("❌ Farmer query error:", error);

    // ✅ ALWAYS return JSON, even on error
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process question"
      },
      { status: 500 }
    );
  }
}