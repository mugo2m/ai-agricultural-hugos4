// app/api/farmer/query/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { generateAnswer } from "@/lib/qaEngine";

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

    // Generate answer using logic-based Q&A engine – now returns structured object
    const answer = generateAnswer(question, sessionData);
    console.log("📦 Answer generated:", answer); // helpful for debugging

    // Save to Firestore – store the structured answer object
    try {
      const queryRef = db.collection("farmer_sessions").doc(sessionId).collection("queries").doc();
      await queryRef.set({
        id: queryRef.id,
        sessionId,
        userId,
        question,
        answer, // now stores the structured object { key, params }
        timestamp: new Date().toISOString()
      });

      await db.collection("farmer_sessions").doc(sessionId).update({
        queryCount: FieldValue.increment(1),
        lastQueryAt: new Date().toISOString()
      });

    } catch (dbError) {
      console.error("Error saving to Firestore:", dbError);
    }

    return NextResponse.json({
      success: true,
      answer // send the structured object to the client
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

export async function GET() {
  return NextResponse.json({
    status: "operational",
    message: "🌾 Farmer Query API (Logic-Based, Structured Output)",
    features: [
      "Template-based answers",
      "No AI costs",
      "Instant responses",
      "57 crops supported",
      "Structured output for i18n"
    ]
  });
}