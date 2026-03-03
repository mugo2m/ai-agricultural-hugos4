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

    // Generate answer using logic-based Q&A engine
    const answer = generateAnswer(question, sessionData);

    // Save to Firestore
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

      await db.collection("farmer_sessions").doc(sessionId).update({
        queryCount: FieldValue.increment(1),
        lastQueryAt: new Date().toISOString()
      });

    } catch (dbError) {
      console.error("Error saving to Firestore:", dbError);
    }

    return NextResponse.json({
      success: true,
      answer
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
    message: "🌾 Farmer Query API (Logic-Based)",
    features: [
      "Template-based answers",
      "No AI costs",
      "Instant responses"
    ]
  });
}