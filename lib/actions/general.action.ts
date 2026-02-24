"use server";

import { db } from "@/firebase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

// 🌾 NEW: Build Q&A history from farmer session
function buildFarmerQaHistory(messages: any[]) {
  const pairs: { question: string; answer: string }[] = [];

  if (Array.isArray(messages)) {
    for (let i = 0; i < messages.length; i++) {
      if (messages[i]?.role === "user" && messages[i + 1]?.role === "assistant") {
        pairs.push({
          question: messages[i].content,
          answer: messages[i + 1].content
        });
        i++;
      }
    }
  }

  console.log(`🌾 Built ${pairs.length} Q&A pairs from farmer session`);
  return pairs;
}

// 🌾 NEW: Generate farmer session summary
export async function generateFarmerSessionSummary(params: {
  sessionId: string;
  userId: string;
  messages: any[];
}) {
  const { sessionId, userId, messages } = params;

  try {
    // Get farmer session details
    const sessionDoc = await db.collection("farmer_sessions").doc(sessionId).get();
    if (!sessionDoc.exists) {
      throw new Error("Session not found");
    }

    const session = sessionDoc.data();
    const qaPairs = buildFarmerQaHistory(messages);

    if (qaPairs.length === 0) {
      return {
        success: false,
        error: "No Q&A history found"
      };
    }

    let summary = null;
    let source = "fallback";

    if (genAI) {
      try {
        const formattedHistory = qaPairs
          .map((pair, index) => `Q${index + 1}: ${pair.question}\nA${index + 1}: ${pair.answer}\n`)
          .join("");

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
You are an agricultural extension officer. Based on this farmer's Q&A session, provide a helpful summary.

FARMER DETAILS:
- Crops: ${session?.crops?.join(", ") || "Not specified"}
- Location: ${session?.county || "Not specified"}${session?.subCounty ? `, ${session.subCounty}` : ""}
- Farm size: ${session?.acres || "Not specified"} acres
- Cattle: ${session?.cattle || 0}

SESSION HISTORY:
${formattedHistory}

INSTRUCTIONS:
1. Summarize what the farmer learned in 3-4 sentences
2. Provide 3 follow-up recommendations based on their questions
3. Highlight any crops or topics they asked about most
4. Suggest what they should ask about next

Return as JSON with this structure:
{
  "summary": "string",
  "recommendations": ["string", "string", "string"],
  "topics": ["string"],
  "nextSteps": "string"
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = cleanGeminiJson(response?.text());

        try {
          summary = JSON.parse(text);
          source = "gemini";
        } catch (parseError) {
          console.error("❌ Failed to parse Gemini response:", parseError);
        }
      } catch (geminiError) {
        console.log("⚠️ Gemini failed, using fallback summary");
      }
    }

    // Fallback summary if Gemini fails
    if (!summary) {
      summary = {
        summary: `You asked ${qaPairs.length} questions about ${session?.crops?.join(", ") || "your crops"}. The assistant provided information on farming practices, pest management, and crop care.`,
        recommendations: [
          "Consider asking about optimal planting times for your specific location",
          "Learn about integrated pest management for your main crops",
          "Ask about soil testing services in your area"
        ],
        topics: session?.crops || ["general farming"],
        nextSteps: "Continue asking questions about your specific crops and challenges."
      };
    }

    // Save summary to Firebase
    const summaryRef = db.collection("farmer_sessions").doc(sessionId).collection("summaries").doc();
    await summaryRef.set({
      id: summaryRef.id,
      sessionId,
      userId,
      summary: summary.summary,
      recommendations: summary.recommendations,
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

// 🌾 NEW: Get farmer session by ID
export async function getFarmerSessionById(id: string): Promise<any> {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error("Invalid session ID provided:", id);
    return null;
  }

  try {
    const session = await db.collection("farmer_sessions").doc(id).get();
    return session.data() || null;
  } catch (error) {
    console.error("Error fetching farmer session:", error);
    return null;
  }
}

// 🌾 NEW: Get farmer sessions by user ID
export async function getFarmerSessionsByUserId(userId: string): Promise<any[]> {
  if (!userId) {
    console.log("No userId provided, returning empty array");
    return [];
  }

  try {
    const sessions = await db
      .collection("farmer_sessions")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return sessions.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching farmer sessions:", error);
    return [];
  }
}

// 🌾 NEW: Get session summary
export async function getSessionSummary(params: {
  sessionId: string;
  userId: string;
}): Promise<any> {
  const { sessionId, userId } = params;

  if (!userId || !sessionId) {
    return null;
  }

  try {
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
  } catch (error) {
    console.error("Error fetching session summary:", error);
    return null;
  }
}

// 🌾 NEW: Save farmer query
export async function saveFarmerQuery(params: {
  sessionId: string;
  userId: string;
  question: string;
  answer: string;
  images?: any[];
}) {
  const { sessionId, userId, question, answer, images } = params;

  try {
    const queryRef = db.collection("farmer_sessions").doc(sessionId).collection("queries").doc();

    await queryRef.set({
      id: queryRef.id,
      sessionId,
      userId,
      question,
      answer,
      images: images || [],
      timestamp: new Date().toISOString()
    });

    // Update query count in session
    await db.collection("farmer_sessions").doc(sessionId).update({
      queryCount: db.FieldValue.increment(1),
      lastQueryAt: new Date().toISOString()
    });

    return { success: true, queryId: queryRef.id };
  } catch (error) {
    console.error("Error saving farmer query:", error);
    return { success: false, error };
  }
}

// 🌾 NEW: Get session queries
export async function getSessionQueries(params: {
  sessionId: string;
  userId: string;
  limit?: number;
}): Promise<any[]> {
  const { sessionId, userId, limit = 50 } = params;

  if (!sessionId || !userId) {
    return [];
  }

  try {
    const queries = await db
      .collection("farmer_sessions")
      .doc(sessionId)
      .collection("queries")
      .orderBy("timestamp", "asc")
      .limit(limit)
      .get();

    return queries.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching session queries:", error);
    return [];
  }
}

// 🌾 KEEP EXISTING INTERVIEW FUNCTIONS BUT RENAME FOR CLARITY
// (These are kept but marked as deprecated - you can remove them later)

/** @deprecated Use getFarmerSessionById instead */
export async function getInterviewById(id: string): Promise<any> {
  console.warn("⚠️ getInterviewById is deprecated. Use getFarmerSessionById for farmer data.");
  if (!id) return null;
  try {
    const interview = await db.collection("interviews").doc(id).get();
    return interview.data() || null;
  } catch (error) {
    return null;
  }
}

/** @deprecated Use getFarmerSessionsByUserId instead */
export async function getInterviewsByUserId(userId: string): Promise<any[]> {
  console.warn("⚠️ getInterviewsByUserId is deprecated. Use getFarmerSessionsByUserId for farmer data.");
  if (!userId) return [];
  try {
    const interviews = await db.collection("interviews").where("userId", "==", userId).orderBy("createdAt", "desc").get();
    return interviews.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    return [];
  }
}

// 🌾 KEEP THESE IF NEEDED FOR BACKWARD COMPATIBILITY
export async function getFeedbackByInterviewId(params: any): Promise<any> {
  return null; // Deprecated
}

export async function createFeedback(params: any): Promise<any> {
  return { success: false, error: "Feedback creation is deprecated. Use generateFarmerSessionSummary instead." };
}

export async function getLatestInterviews(params: any): Promise<any[]> {
  return [];
}